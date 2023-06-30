import { Client } from 'ssh2';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import alumnoRoutes from './routes/alumnoRoutes.js';
import operadorRoutes from './routes/operadorRoutes.js';
import gruposRoutes from './routes/gruposRoutes.js';
import bodyParser from 'body-parser';


const app = express();

app.use(cors({
    origin: [
        'http://localhost:3001',
        'http://localhost:3000',
    ],
}))
app.use(cors());
app.use(cookieParser())
app.use(express.json());//convertir req budy en formato json
// Middleware para procesar el cuerpo de las solicitudes POST
app.use(bodyParser.urlencoded({ extended: false }));
//convertir req budy en formato json
app.use(bodyParser.json());

app.set("view engine","ejs");

mongoose.connect('mongodb+srv://admin:admin@cluster0.3d16rpy.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
});

// Rutas
app.use(authRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/operadores', operadorRoutes);
app.use('/api/grupos', gruposRoutes);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});