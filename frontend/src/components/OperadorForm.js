import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Switch } from 'antd';
import '../index.css';

const OperadorForm = () => {
    const navigate = useNavigate();
    const { id: operadorId } = useParams();
    const location = useLocation();
    const isCreateMode = location.pathname === '/operadores/crear';
    const [operador, setOperador] = useState({});


    useEffect(() => {
        const fetchOperador = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/operadores/${operadorId}`);
                const data = await response.json();
                setOperador(data);

            } catch (error) {
                console.error('Error fetching operador:', error);
            }
        };

        if (operadorId && !isCreateMode) {
            fetchOperador();
        }
    }, [operadorId, isCreateMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (
            !operador.Rut ||
            !operador.Nombre ||
            !operador.Apellidos ||
            !operador.Correo
        ) {
            console.log('Rellena todos los campos.');
            return;
        }

        try {
            if (isCreateMode) {
                // Create mode: send a POST request to create a new Operador
                await fetch('http://localhost:4000/api/operadores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...operador,
                    }),
                });
            } else {
                // Edit mode: send a PUT request to update the existing Operador
                await fetch(`http://localhost:4000/api/operadores/${operadorId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...operador,
                    }),
                });
            }

            navigate('/operadores');
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };


    const handleDelete = async () => {
        const confirmed = window.confirm('Estás seguro de que quieres borrar este Operador?');
        if (!confirmed) {
            return;
        }

        try {
            const url = `http://localhost:4000/api/operadores/${operadorId}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (response.ok) {
                navigate('/operadores');
                console.log('Operador deleted successfully.');
            } else {
                console.error('Error deleting Operador:', response.status);
            }
        } catch (error) {
            console.error('Error deleting Operador:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const uppercaseValue = name === 'Nombre' || name === 'Apellidos' ? value.toUpperCase() : value;
        setOperador((prevOperador) => ({
            ...prevOperador,
            [name]: uppercaseValue,
        }));
    };
    return (
        <div className="container mt-5">
            <h1 className="text-center">{isCreateMode ? 'Crear Operador' : 'Editar Operador'}</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        RUT:
                        <input
                            className="form-control"
                            type="text"
                            name="Rut"
                            id="rutInput"
                            value={operador?.Rut || ''}
                            onChange={handleInputChange}
                            required
                            readOnly={!isCreateMode}
                        />
                    </h5>
                </div>

                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Nombre:
                        <input
                            className="form-control"
                            type="text"
                            name="Nombre"
                            value={operador?.Nombre || ''}
                            id="nombreInput"
                            onChange={handleInputChange}
                            required


                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Apellidos:
                        <input
                            className="form-control"
                            type="text"
                            name="Apellidos"
                            value={operador?.Apellidos || ''}
                            id="apellidosInput"
                            onChange={handleInputChange}
                            required

                        />
                    </h5>
                </div>


                <div className="row align-items-center">
                    <div className="col">
                        <h5 className="mb-3 text-start">
                            Correo:
                            <input
                                className="form-control"
                                type="text"
                                name="Correo"
                                value={operador?.Correo || ''}
                                id="correoInput"
                                onChange={handleInputChange}
                                required
                            />
                        </h5>
                    </div>
                </div>


            </form >
            <div className="row justify-content-center">
                <div className="text-center">
                    {!isCreateMode && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            BORRAR
                        </button>
                    )}
                    <button onClick={handleSubmit} type='submit' className="btn btn-primary">
                        {isCreateMode ? 'CREAR' : 'GUARDAR'}
                    </button>

                </div>
            </div>

        </div >
    );
};

export default OperadorForm;