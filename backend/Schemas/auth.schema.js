import { z } from 'zod';

export const registerSchema = z.object({
  Rut: z.string({
    required_error: 'Se requiere el campo Rut',
  }),
  Password: z.string({
    required_error: 'Se requiere el campo Password',
  }).min(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  }),
  Nombre: z.string({
    required_error: 'Se requiere el campo Nombre',
  }),
  Apellidos: z.string({
    required_error: 'Se requiere el campo Apellidos',
  }),
  Correo: z.string({
    required_error: 'Se requiere el campo Correo',
  }).email({
    message: 'El campo Correo debe ser una dirección de correo electrónico válida',
  })
});

export const loginSchema = z.object({
  Rut: z.string({
    required_error: 'Se requiere el campo Rut',
  }),
  Password: z.string({
    required_error: 'Se requiere el campo Password',
  }).min(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  }),
});

export const forgotpasswordSchema = z.object({
  Correo: z.string({
    required_error: 'Se requiere el campo Correo',
  }).email({
    message: 'El campo Correo debe ser una dirección de correo electrónico válida',
  })
});