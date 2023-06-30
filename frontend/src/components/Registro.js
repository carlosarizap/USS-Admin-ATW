import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Registro() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    signup(values);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-wrapper">
          <input
            type="_id"
            {...register('_id', { required: true })}
            className='input-field'
            placeholder="Ingrese su nombre de _id"
          />
          {errors._id && (<p className='text-red-500'> Se requiere id</p>)}
        </div>
        <div className="input-wrapper">
          <input
            type="Rut"
            {...register('Rut', { required: true })}
            className='input-field'
            placeholder="Ingrese su Rut"
          />
          {errors.Rut && (<p className='text-red-500'> Se requiere Rut</p>)}
        </div>
        <div className="input-wrapper">
          <input
            type="Password"
            {...register('Password', { required: true })}
            className='input-field'
            placeholder="Ingrese su Contraseña"
          />
          {errors.Password && (<p className='text-red-500'> Se requiere Contraseña</p>)}
        </div>
        <div className="input-wrapper">
          <input
            type="Nombre"
            {...register('Nombre', { required: true })}
            className='input-field'
            placeholder="Ingrese su Nombre"
          />
          {errors.Nombre && (<p className='text-red-500'> Se requiere Nombre</p>)}
        </div>
        <div className="input-wrapper">
          <input
            type="Apellidos"
            {...register('Apellidos', { required: true })}
            className='input-field'
            placeholder="Ingrese su Apellido"
          />
          {errors.Apellidos && (<p className='text-red-500'> Se requiere Apellido</p>)}
        </div>
        <div className="input-wrapper">
          <input
            type="Correo"
            {...register('Correo', { required: true })}
            className='input-field'
            placeholder="Ingrese su Correo"
          />
          {errors.Correo && (<p className='text-red-500'> Se requiere correo</p>)}
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default Registro;