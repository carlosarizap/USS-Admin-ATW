import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RecuperaContrasena() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { ForgotContrasena, isAuthenticated, errors: ForgotContrasenaErrors } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (values) => {
        try {
            const response = await ForgotContrasena(values);
            if (response) {
                alert('Se ha enviado un correo para reestablecer su contraseña');
            } else {
                alert('Oh, ha sucedido un inconveniente, intentalo más tarde');
            }
            // Display success message or handle success case
        } catch (error) {
            // Display error message or handle error case
            alert('Eviar Contraseña Falló');
        }
    };

    return (
        <div className="login-container">
            <div className="login-frame">
                <h2 className="login-title">Reestablecer Contraseña<abbr title=""></abbr></h2>
                <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                        <h5 className='text-start'>Ingrese su Correo:</h5>
                    <div className="input-wrapper">
                        <input
                            type="Correo"
                            {...register('Correo', { required: true })}
                            className='input-field'
                            placeholder="Ingrese su Correo"
                        />
                        {errors.Correo && (<p className='text-red-500'> Se requiere correo</p>)}
                    </div>
                    <button className='btn btn-primary' type="submit">Enviar</button>
                </form>
            </div>
        </div>
    );
}

export default RecuperaContrasena;
