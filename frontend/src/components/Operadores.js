import React, { useState, useEffect } from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';

const Operadores = () => {
    const [operadores, setOperadores] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOperadores();
    }, []);

    const fetchOperadores = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/operadores');
            const data = await response.json();
            setOperadores(data);
        } catch (error) {
            console.error('Error fetching operadores:', error);
        }
    };

    const handleRowClick = (operadorId) => {
        navigate(`/operadores/${operadorId}`);
    };

    return (
        <div className="p-5">
            <div className="d-flex justify-content-between align-items-center">
                <h2>OPERADORES</h2>
                <Link to="/operadores/crear" className="btn btn-primary">AGREGAR</Link>
            </div>

            {operadores && operadores.length > 0 ? (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>RUT</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Correo</th>
                            <th>Fecha Creación</th>
                            <th>Última Conexión</th>
                        </tr>
                    </thead>
                    <tbody>
                        {operadores.map((operador) => (
                            <tr key={operador._id} onClick={() => handleRowClick(operador._id)}>
                                <td>{operador.Rut}</td>
                                <td>{operador.Nombre}</td>
                                <td>{operador.Apellidos}</td>
                                <td>{operador.Correo}</td>
                                <td>{new Date(operador.FechaCreacion).toLocaleString('es-ES')}</td>
                                <td>{new Date(operador.UltimaConexion).toLocaleString('es-ES')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay operadores creados.</p>
            )}
        </div>
    );
};


export default Operadores;
