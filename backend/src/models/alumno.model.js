import mongoose from 'mongoose';

const alumnoSchema = new mongoose.Schema({
  _id: String,
  Rut: String,
  Password: String,
  Nombre: String,
  Apellidos: String,
  Correo: String,
  UltimaConexion: Date,
  FechaCreacion: Date,
  Estado: Boolean,
  Asignaturas: Array,
},
{ collection: 'Alumno' , versionKey: false});

export default mongoose.model('Alumno', alumnoSchema);

