import mongoose from'mongoose';

const operadorSchema = new mongoose.Schema({
  _id: String,
  Rut: String,
  Password: String,
  Nombre: String,
  Apellidos: String,
  Correo: String,
  FechaCreacion: Date,
  UltimaConexion: Date,
},
{ collection: 'Operador' , versionKey: false});

export default mongoose.model('Operador', operadorSchema);


