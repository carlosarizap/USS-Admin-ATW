import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { signin, isAuthenticated, errors: signinErrors } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/menu');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    try {
      const response = await signin(values);
      if (response) {
        alert('Login successful');
      } else {
        alert('Contraseña Incorrecta');
      }
      // Display success message or handle success case
    } catch (error) {
      // Display error message or handle error case
      alert('Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-frame">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-wrapper">
            <h5 className='text-start'>RUT:</h5>
            <input
              type="Rut"
              {...register('Rut', { required: true })}
              className='input-field'
              placeholder="Ingrese su Rut"
            />
            {errors.Rut && (<p className='text-red-500'> Se requiere Rut</p>)}
          </div>
          <div className="input-wrapper">
            <h5 className='text-start'>Contraseña:</h5>
            <input
              type="Password"
              {...register('Password', { required: true })}
              className='input-field'
              placeholder="Ingrese su Contraseña"
            />
            {errors.Password && (<p className='text-red-500'> Se requiere Contraseña</p>)}
          </div>
          <button className='btn btn-primary' type="submit">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
