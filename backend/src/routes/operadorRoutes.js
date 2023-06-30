import express from 'express';
const router = express.Router();
import Operador from '../models/operador.model.js'; // Update the path to the operador model file
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import { Client } from 'ssh2';

const config = {
    host: '192.168.110.130', // IP or domain name of the virtual machine
    port: 22, // SSH port
    username: 'root', // Username of the virtual machine
    password: '123456', // User's password
};

// CREATE - Add a new operador
router.post('/', async (req, res) => {
    try {
        const newOperador = new Operador({
            _id: new ObjectId().toString(),
            ...req.body,
        });

        newOperador.Password = newOperador.Rut;
        newOperador.FechaCreacion = Date.now();
        newOperador.UltimaConexion = Date.now();

        const rutExists = await checkRutExists(newOperador.Rut);
        if (rutExists) {
            console.log("existe");
            return res.json({ message: 'RUT ya existe' });
        }

        const savedOperador = await newOperador.save();

        const conn = new Client();

        conn.on('ready', () => {
            console.log('SSH connection established');

            // Execute commands to create the user and add it to the selected group
            const commands = [
                `sudo useradd -m -s /bin/bash -c "${newOperador.Nombre} ${newOperador.Apellidos} - ${newOperador.Correo}" ${newOperador.Rut}`,
                `echo ${newOperador.Rut}:${newOperador.Rut} | sudo chpasswd`,
                `sudo usermod -aG Operadores ${newOperador.Rut}` // Use the 'grupo' variable here
            ];

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

        res.json(savedOperador);
    } catch (error) {
        res.status(400).json({ error: 'Invalid Data' });
    }
});

const checkRutExists = async (rut) => {
    try {
        const operador = await Operador.findOne({ Rut: rut });
        return !!operador;
    } catch (error) {
        console.error('Error checking RUT:', error);
        return false;
    }
};

// READ - Get all operadors
router.get('/', async (req, res) => {
    try {
        const operadors = await Operador.find();
        res.json(operadors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Get a specific operador by ID
router.get('/:id', async (req, res) => {
    try {
        const operador = await Operador.findById(req.params.id);
        if (operador) {
            res.json(operador);
        } else {
            res.status(404).json({ error: 'Operador not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE - Update a specific operador by ID
router.put('/:id', async (req, res) => {
    try {
        const operador = await Operador.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (operador) {
            res.json(operador);
        } else {
            res.status(404).json({ error: 'Operador not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Delete a specific operador by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedOperador = await Operador.findByIdAndDelete(req.params.id);

        const conn = new Client();

        conn.on('ready', () => {
            console.log('SSH connection established');

            conn.exec(`sudo userdel -r ${deletedOperador.Rut}`, (err, stream) => {
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

        if (deletedOperador) {
            res.json({ message: 'Operador deleted' });
        } else {
            res.status(404).json({ error: 'Operador not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
