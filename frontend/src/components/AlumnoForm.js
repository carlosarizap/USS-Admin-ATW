import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Switch } from 'antd';
import '../index.css';

const AlumnoForm = () => {
    const navigate = useNavigate();
    const { id: alumnoId } = useParams();
    const location = useLocation();
    const isCreateMode = location.pathname === '/alumnos/crear';
    const [alumno, setAlumno] = useState({});
    const [asignaturas, setAsignaturas] = useState([
        { value: 'BDD', label: 'Base de Datos' },
        { value: 'POO', label: 'POO' },
        { value: 'PA', label: 'PA' },
        { value: 'APP', label: 'App y Tec de la Web' },
    ]);
    const [selectedAsignaturas, setSelectedAsignaturas] = useState([]);

    useEffect(() => {
        const fetchAlumno = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/alumnos/${alumnoId}`);
                const data = await response.json();
                setAlumno(data);
                setSelectedAsignaturas(data.Asignaturas || []);
            } catch (error) {
                console.error('Error fetching alumno:', error);
            }
        };

        if (alumnoId && !isCreateMode) {
            fetchAlumno();
        }
    }, [alumnoId, isCreateMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (
            !alumno.Rut ||
            !alumno.Nombre ||
            !alumno.Apellidos ||
            !alumno.Correo
        ) {
            alert('Rellena todos los campos.');
            return;
        }

        try {
            let apiUrl = '';
            let httpMethod = '';

            if (isCreateMode) {
                apiUrl = 'http://localhost:4000/api/alumnos';
                httpMethod = 'POST';
            } else {
                apiUrl = `http://localhost:4000/api/alumnos/${alumnoId}`;
                httpMethod = 'PUT';
            }

            const response = await fetch(apiUrl, {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...alumno,
                    Asignaturas: selectedAsignaturas,
                }),
            });

            const data = await response.json();

            if (data.message === 'RUT ya existe') {
                alert(data.message);
            }
            navigate('/alumnos');
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Estás seguro de que quieres borrar este Alumno?');
        if (!confirmed) {
            return;
        }

        try {
            const url = `http://localhost:4000/api/alumnos/${alumnoId}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
            const data = await response.json();
            navigate(`/alumnos`);
            console.log('Alumno deleted successfully:', data);
        } catch (error) {
            console.error('Error deleting asignatura:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const uppercaseValue = name === 'Nombre' || name === 'Apellidos' ? value.toUpperCase() : value;
        setAlumno((prevAlumno) => ({
            ...prevAlumno,
            [name]: uppercaseValue,
        }));
    };

    const handleAsignaturasChange = (selectedOptions) => {
        const selectedAsignaturas = selectedOptions ? selectedOptions.map((option) => option.value) : [];
        setSelectedAsignaturas(selectedAsignaturas);
    };
    return (
        <div className="container mt-5">
            <h1 className="text-center">{isCreateMode ? 'Crear Alumno' : 'Editar Alumno'}</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        RUT:
                        <input
                            className="form-control"
                            type="text"
                            name="Rut"
                            id="rutInput"
                            value={alumno?.Rut || ''}
                            onChange={handleInputChange}
                            required
                            readOnly={!isCreateMode}
                        />
                    </h5>
                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Estado:
                            <input
                                className="form-control"
                                type="text"
                                name="Activo"
                                value={alumno.Estado ? "Activo" : "Inactivo"}
                                id="activoInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch className="select-option"
                            id="activoSwitch"
                            checked={alumno.Estado || false}
                            onChange={(checked) => setAlumno((prevAlumno) => ({ ...prevAlumno, Estado: checked }))}
                        />
                    </div>
                </div>

                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Nombre:
                        <input
                            className="form-control"
                            type="text"
                            name="Nombre"
                            value={alumno?.Nombre || ''}
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
                            value={alumno?.Apellidos || ''}
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
                                value={alumno?.Correo || ''}
                                id="correoInput"
                                onChange={handleInputChange}
                                required
                            />
                        </h5>
                    </div>
                </div>


                <div>
                    <h5 className="mb-2">Asignaturas:</h5>
                    <Select className='select-option'
                        isMulti
                        options={asignaturas}
                        onChange={handleAsignaturasChange}
                        value={selectedAsignaturas
                            .map((asignatura) => ({
                                value: asignatura,
                                label: asignatura
                            }))}
                    />
                </div>


            </form >
            <div className="row justify-content-center">
                <div className="text-center">
                    {!isCreateMode && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            BORRAR
                        </button>
                    )}
                    <button onClick={handleSubmit} className="btn btn-primary">
                        {isCreateMode ? 'CREAR' : 'GUARDAR'}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default AlumnoForm;