import User from '../models/operador.model.js';
import bcrypt from 'bcryptjs';
import { createAccesToken } from '../libs/jwt.js';
import { TOKEN_SECRET } from '../config.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export const register = async (req, res) => {
  const { _id, Rut, Password, Nombre, Apellidos, Correo } = req.body;

  try {

    const userFound = await User.findOne({ Correo })
    if (userFound) return res.status(400).json((["El correo ya esta en uso"]))

    const PasswordHash = await bcrypt.hash(Password, 10);

    const newUser = new User({
      _id,
      Rut,
      Password: PasswordHash,
      Nombre,
      Apellidos,
      Correo
    });

    const userSaved = await newUser.save();
    const token = await createAccesToken({ id: userSaved._id });
    res.cookie('token', token);
    res.json({
      _id: userSaved._id,
      Rut: userSaved.Rut,
      Nombre: userSaved.Nombre,
      Apellidos: userSaved.Apellidos,
      Correo: userSaved.Correo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { Rut, Password } = req.body;

  try {
    const userFound = await User.findOne({ Rut });

    if (!userFound) return res.status(400).json({ message: 'Usuario no encontrado' });

    const PasswordEnc = await bcrypt.hash(userFound.Password, 10);
    const isMatch = await bcrypt.compare(Password, PasswordEnc);

    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = await createAccesToken({ id: userFound._id });
    res.cookie('token', token);
    res.json({
      id: userFound._id,
      Rut: userFound.Rut
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fpassword = async (req, res) => {
  const { Correo } = req.body;
  console.log(req.body);

  try {

      const userFound = await User.findOne({ Correo });
    
      
      if (!userFound) {
          return res.status(400).json({ message: "Correo no encontrado" });
      }

      if (!userFound.Correo) {
          return res.status(400).json({ message: "Correo no encontrado" });
      }
      res.json({ userFound });

      const secret = TOKEN_SECRET + userFound.Password;
      const token = jwt.sign({ Correo: userFound.Correo, id: userFound._id }, secret, {
          expiresIn: "5m",
      });

      const link = 'http://localhost:4000/reset-password/' + userFound._id + '/' + token;
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          //secure: true,
          //port: 993,
          auth: {
              user: 'slincopan.jr@gmail.com',
              pass: 'nardjmjxmvolcbln'
          }
      });

      var mailOptions = {
          from: 'Restablecer Contraseña <slincopan.jr@gmail.com>',
          to: Correo,
          subject: 'Restablecimiento de Contraseña',
          html: `
        <div style="text-align: center;">
          <img src="https://periodico.uss.cl/wp-content/uploads/2022/12/Logo-USS-Nuevo.Horizontal-color.png" alt="Logo USS" width="200" height="auto">
        </div>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 24px; margin-bottom: 20px; text-align: center;">Restablecer Contraseña</h1>
          <p style="font-size: 16px;">Estimado/a,</p>
          <p style="font-size: 16px;">Hemos recibido una solicitud para restablecer tu contraseña. Para continuar con el proceso, por favor haz clic en el siguiente enlace:</p>
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 3px;">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 16px;">Si no solicitaste el restablecimiento de contraseña, puedes ignorar este mensaje.</p>
          <p style="font-size: 16px;">Gracias,</p>
          <p style="font-size: 16px;">El equipo de Restablecer Contraseña</p>
        </div>
      `
      };

      transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log(error);
          } else {
              console.log('Email sent: ' + info.response);
          }
      });
      console.log(link);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const rpassword = async (req, res) => {
  const { id, token} = req.params;

  const userFound = await User.findOne({ _id: id });

  if (!userFound) {
      return res.status(400).json({ message: "Usuario no Existe" });
  }
 
  const secret = TOKEN_SECRET + userFound.Password;


  try {
      const verify = jwt.verify(token, secret);
      console.log('VerifycORREO: ',verify.Correo);
      if (verify.Correo !== userFound.Correo) {
        return res.status(400).json({ message: "Token inválido" });
      }
      console.log(verify.Correo,userFound.Correo);
      res.render("index", { Correo: verify.Correo, status: "No Verificado" });
  } catch (error) {
      console.log(error);
      res.send("No Verificado");
  }
}

export const rppassword = async (req, res) => {
  const { id, token } = req.params;
  const { Password, confirmPassword } = req.body;

  try {

      const userFound = await User.findOne({ _id: id });
      console.log(userFound)

      if (!userFound) {
          return res.status(400).json({ message: "Usuario no existe" });
      }

      const secret = TOKEN_SECRET + userFound.Password;

      try {
          const verify = jwt.verify(token, secret);

          if (verify.Correo !== userFound.Correo) {
              return res.status(400).json({ message: "Token inválido" });
          }
          console.log(Password);
          if (typeof Password !== "string") {
              return res.status(400).json({ message: "Contraseña inválida" });
          }

          if (Password !== confirmPassword) {
              return res.status(400).json({ message: "La contraseña y la confirmación no coinciden" });
          }
        
          //const PasswordHash = await bcrypt.hash(Password, 10);

          await User.updateOne(
              { _id: id },
              { Password: Password }
          );
    

          res.render("index", { Correo: verify.Correo, status: "Verificado" });
      } catch (error) {
     
          res.status(400).json({ message: "Token inválido" });
      }
  } catch (error) {
 
      res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const logout = async (req, res) => {
  res.cookie('token', "", {
    expires: new Date(0)
  })
  return res.sendStatus(200)
}

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id)

  if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });

  return res.json({
    id: userFound._id,
    user: userFound.user,
    Password: userFound.Password,
  })


}
