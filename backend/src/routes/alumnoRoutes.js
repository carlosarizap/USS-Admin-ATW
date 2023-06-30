import express from 'express';
const router = express.Router();
import Alumno from '../models/alumno.model.js'; // Update the path to the alumno model file
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import { Client } from 'ssh2';

const config = {
  host: '192.168.110.130', // IP or domain name of the virtual machine
  port: 22, // SSH port
  username: 'root', // Username of the virtual machine
  password: '123456', // User's password
};

// CREATE - Add a new alumno
router.post('/', async (req, res) => {
  try {
    const newAlumno = new Alumno({
      _id: new ObjectId().toString(),
      ...req.body,
    });

    newAlumno.Password = newAlumno.Rut;
    newAlumno.FechaCreacion = Date.now();
    newAlumno.UltimaConexion = Date.now();

    const rutExists = await checkRutExists(newAlumno.Rut);
    if (rutExists) {
      console.log("existe");
      return res.json({ message: 'RUT ya existe' });
    }

    const savedAlumno = await newAlumno.save();

    const conn = new Client();

    conn.on('ready', () => {
      console.log('SSH connection established');

      // Execute commands to create the user and add it to the selected group
      const commands = [
        `sudo useradd -m -s /bin/bash -c "${newAlumno.Nombre} ${newAlumno.Apellidos} - ${newAlumno.Correo}" ${newAlumno.Rut}`,
        `echo ${newAlumno.Rut}:${newAlumno.Rut} | sudo chpasswd`,
        `sudo usermod -aG Alumnos ${newAlumno.Rut}` // Use the 'grupo' variable here
      ];

      newAlumno.Asignaturas.forEach((asignatura) => {
        // Check the asignatura value and add the corresponding group command
        if (asignatura === 'BDD') {
          commands.push(`sudo usermod -aG BDD ${newAlumno.Rut}`);
        } else if (asignatura === 'POO') {
          commands.push(`sudo usermod -aG POO ${newAlumno.Rut}`);
        } else if (asignatura === 'PA') {
          commands.push(`sudo usermod -aG PA ${newAlumno.Rut}`);
        } else if (asignatura === 'APP') {
          commands.push(`sudo usermod -aG APP ${newAlumno.Rut}`);
        }
      });

      console.log(commands)

      conn.exec(commands.join(' && '), (err, stream) => { // Join the commands with ' && '
        if (err) {
          console.error('SSH exec error:', err);
          conn.end(); // Close the SSH connection
          res.status(500).json({ error: 'Error creating the user' });
          return;
        }

        stream.on('close', (code, signal) => {
          console.log('Shell closed:', code, signal);
          conn.end(); // Close the SSH connection
          res.json({ success: true });
        });

        stream.stderr.on('data', (data) => {
          console.error('SSH stderr:', data.toString());
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res.status(500).json({ error: 'Error creating the user' });
    });

    conn.connect(config);

    res.json(savedAlumno);
  } catch (error) {
    res.status(400).json({ error: 'Invalid Data' });
  }
});

const checkRutExists = async (rut) => {
  try {
    const alumno = await Alumno.findOne({ Rut: rut });
    return !!alumno; // Return true if alumno is found, false otherwise
  } catch (error) {
    console.error('Error checking RUT:', error);
    return false; // Return false in case of an error
  }
};

const updateUltimaConexion = async () => {
  try {
    const alumnos = await Alumno.find();

    const conn = new Client();

    conn.on('ready', () => {
      console.log('SSH connection established');

      alumnos.forEach((alumno) => {
        const command = `last --time-format iso ${alumno.Rut} | awk 'NR==1 {print $3}'`;

        conn.exec(command, (err, stream) => {
          if (err) {
            console.error('SSH exec error:', err);
            return;
          }

          stream.on('data', (data) => {
            const lastLoginTime = data.toString().trim();

            // Update the UltimaConexion attribute of the alumno
            alumno.UltimaConexion = new Date(lastLoginTime);

            // Save the updated alumno
            alumno.save()
              .then(() => {
                console.log(`Updated UltimaConexion for ${alumno.Nombre} ${alumno.Apellidos}`);
              })
              .catch((error) => {
                console.error(`Error updating UltimaConexion for ${alumno.Nombre} ${alumno.Apellidos}:`, error);
              });
          });

          stream.on('close', (code, signal) => {
            console.log('Shell closed:', code, signal);
            conn.end(); // Close the SSH connection
          });

          stream.stderr.on('data', (data) => {
            console.error('SSH stderr:', data.toString());
          });
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
    });

    conn.connect(config);
  } catch (error) {
    console.error('Error retrieving alumnos:', error);
  }
};

// READ - Get all alumnos
router.get('/', async (req, res) => {
  try {
    const alumnos = await Alumno.find();

    // Update the UltimaConexion attribute for all alumnos
    await updateUltimaConexion();

    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get a specific alumno by ID
router.get('/:id', async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id);
    if (alumno) {
      res.json(alumno);
    } else {
      res.status(404).json({ error: 'Alumno not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update a specific alumno by ID
router.put('/:id', async (req, res) => {
  try {
    const alumno = await Alumno.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const conn = new Client();

    conn.on('ready', () => {
      console.log('SSH connection established');

      // Execute commands to create the user and add it to the selected group
      const commands = [
        `sudo usermod -G "" ${alumno.Rut}`,
        `sudo usermod -aG Alumnos ${alumno.Rut}`
      ];

      alumno.Asignaturas.forEach((asignatura) => {
        // Check the asignatura value and add the corresponding group command
        if (asignatura === 'BDD') {
          commands.push(`sudo usermod -aG BDD ${alumno.Rut}`);
        } else if (asignatura === 'POO') {
          commands.push(`sudo usermod -aG POO ${alumno.Rut}`);
        } else if (asignatura === 'PA') {
          commands.push(`sudo usermod -aG PA ${alumno.Rut}`);
        } else if (asignatura === 'APP') {
          commands.push(`sudo usermod -aG APP ${alumno.Rut}`);
        }
      });

      console.log(commands)

      conn.exec(commands.join(' && '), (err, stream) => { // Join the commands with ' && '
        if (err) {
          console.error('SSH exec error:', err);
          conn.end(); // Close the SSH connection
          res.status(500).json({ error: 'Error creating the user' });
          return;
        }

        stream.on('close', (code, signal) => {
          console.log('Shell closed:', code, signal);
          conn.end(); // Close the SSH connection
          res.json({ success: true });
        });

        stream.stderr.on('data', (data) => {
          console.error('SSH stderr:', data.toString());
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res.status(500).json({ error: 'Error creating the user' });
    });

    conn.connect(config);

    if (alumno) {
      res.json(alumno);
    } else {
      res.status(404).json({ error: 'Alumno not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Delete a specific alumno by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedAlumno = await Alumno.findByIdAndDelete(req.params.id);

    const conn = new Client();

    conn.on('ready', () => {
      console.log('SSH connection established');

      conn.exec(`sudo userdel -r ${deletedAlumno.Rut}`, (err, stream) => {
        if (err) {
          console.error('SSH exec error:', err);
          conn.end(); // Close the SSH connection
          res.status(500).json({ error: 'Error deleting the user' });
          return;
        }

        stream.on('close', (code, signal) => {
          console.log('Shell closed:', code, signal);
          conn.end(); // Close the SSH connection
          res.json({ success: true });
        });

        stream.stderr.on('data', (data) => {
          console.error('SSH stderr:', data.toString());
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res.status(500).json({ error: 'Error deleting the user' });
    });

    conn.connect(config);

    if (deletedAlumno) {
      res.json({ message: 'Alumno deleted' });
    } else {
      res.status(404).json({ error: 'Alumno not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const importedAlumnos = req.body;

    const importedAlumnoIds = importedAlumnos.map((alumno) => alumno._id);

    const existingAlumnos = await Alumno.find();

    const existingAlumnoIds = existingAlumnos.map((alumno) => alumno._id);

    const alumnosToDelete = existingAlumnoIds.filter(
      (alumnoId) => !importedAlumnoIds.includes(alumnoId)
    );

    // para borrar en linux
    const importedAlumnoRuts = importedAlumnos.map((alumno) => alumno.Rut);
    const existingAlumnoRuts = existingAlumnos.map((alumno) => alumno.Rut);
    const alumnosToDeleteRut = existingAlumnoRuts.filter(
      (alumnoRut) => !importedAlumnoRuts.includes(alumnoRut)
    );


    alumnosToDeleteRut.map(async (alumno) => {
      const conn = new Client();

      conn.on('ready', () => {
        console.log('SSH connection established');
        console.log(alumno)
        conn.exec(`sudo userdel -r ${alumno}`, (err, stream) => {
          if (err) {
            console.error('SSH exec error:', err);
            conn.end(); // Close the SSH connection
            res.status(500).json({ error: 'Error deleting the user' });
            return;
          }

          stream.on('close', (code, signal) => {
            console.log('Shell closed:', code, signal);
            conn.end(); // Close the SSH connection
            res.json({ success: true });
          });

          stream.stderr.on('data', (data) => {
            console.error('SSH stderr:', data.toString());
          });
        });
      });

      conn.on('error', (err) => {
        console.error('SSH connection error:', err);
        res.status(500).json({ error: 'Error deleting the user' });
      });

      conn.connect(config);
    })

    await Alumno.deleteMany({ _id: { $in: alumnosToDelete } });




    const updatedAlumnos = await Promise.all(
      importedAlumnos.map(async (alumno) => {

        alumno.FechaCreacion = Date.now();
        alumno.UltimaConexion = Date.now();

        const rutExists = await checkRutExists(alumno.Rut);

        console.log("wtf")
        console.log(rutExists);



        if (!alumno._id) {
          if (!rutExists) {
            alumno._id = new ObjectId().toString();



            const conn = new Client();

            conn.on('ready', () => {
              console.log('SSH connection established');
              // Create Linux 

              // Execute commands to create the user and add it to the selected group
              const commands = [
                `sudo useradd -m -s /bin/bash -c "${alumno.Nombre} ${alumno.Apellidos} - ${alumno.Correo}" ${alumno.Rut}`,
                `echo ${alumno.Rut}:${alumno.Rut} | sudo chpasswd`,
                `sudo usermod -aG Alumnos ${alumno.Rut}` // Use the 'grupo' variable here
              ];

              if (typeof alumno.Asignaturas === 'string') {
                // If Asignaturas is a string, convert it to an array with a single element
                alumno.Asignaturas = alumno.Asignaturas.split(',');
              }

              alumno.Asignaturas.forEach((asignatura) => {
                // Check the asignatura value and add the corresponding group command
                if (asignatura === 'BDD') {
                  commands.push(`sudo usermod -aG BDD ${alumno.Rut}`);
                } else if (asignatura === 'POO') {
                  commands.push(`sudo usermod -aG POO ${alumno.Rut}`);
                } else if (asignatura === 'PA') {
                  commands.push(`sudo usermod -aG PA ${alumno.Rut}`);
                } else if (asignatura === 'APP') {
                  commands.push(`sudo usermod -aG APP ${alumno.Rut}`);
                }
              });

              console.log(commands)

              conn.exec(commands.join(' && '), (err, stream) => { // Join the commands with ' && '
                if (err) {
                  console.error('SSH exec error:', err);
                  conn.end(); // Close the SSH connection
                  res.status(500).json({ error: 'Error creating the user' });
                  return;
                }

                stream.on('close', (code, signal) => {
                  console.log('Shell closed:', code, signal);
                  conn.end(); // Close the SSH connection
                  res.json({ success: true });
                });

                stream.stderr.on('data', (data) => {
                  console.error('SSH stderr:', data.toString());
                });
              });
            });

            conn.on('error', (err) => {
              console.error('SSH connection error:', err);
              res.status(500).json({ error: 'Error creating the user' });
            });

            conn.connect(config);
          }else{
            return;
          }

        } else {

          const conn = new Client();

          conn.on('ready', () => {
            console.log('SSH connection established');

            // Execute commands to create the user and add it to the selected group
            const commands = [
              `sudo usermod -G "" ${alumno.Rut}`,
              `sudo usermod -aG Alumnos ${alumno.Rut}`
            ];

            if (typeof alumno.Asignaturas === 'string') {
              // If Asignaturas is a string, convert it to an array with a single element
              alumno.Asignaturas = alumno.Asignaturas.split(',');
            }

            alumno.Asignaturas.forEach((asignatura) => {
              // Check the asignatura value and add the corresponding group command
              if (asignatura === 'BDD') {
                commands.push(`sudo usermod -aG BDD ${alumno.Rut}`);
              } else if (asignatura === 'POO') {
                commands.push(`sudo usermod -aG POO ${alumno.Rut}`);
              } else if (asignatura === 'PA') {
                commands.push(`sudo usermod -aG PA ${alumno.Rut}`);
              } else if (asignatura === 'APP') {
                commands.push(`sudo usermod -aG APP ${alumno.Rut}`);
              }
            });

            console.log(commands)

            conn.exec(commands.join(' && '), (err, stream) => { // Join the commands with ' && '
              if (err) {
                console.error('SSH exec error:', err);
                conn.end(); // Close the SSH connection
                res.status(500).json({ error: 'Error creating the user' });
                return;
              }

              stream.on('close', (code, signal) => {
                console.log('Shell closed:', code, signal);
                conn.end(); // Close the SSH connection
                res.json({ success: true });
              });

              stream.stderr.on('data', (data) => {
                console.error('SSH stderr:', data.toString());
              });
            });
          });

          conn.on('error', (err) => {
            console.error('SSH connection error:', err);
            res.status(500).json({ error: 'Error creating the user' });
          });

          conn.connect(config);

        }

        const updatedAlumno = await Alumno.findOneAndUpdate(
          { _id: alumno._id },
          alumno,
          { upsert: true, new: true }
        );
        return updatedAlumno;
      })
    );

    res.json(updatedAlumnos);
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid Data' });
  }
});

export default router;
