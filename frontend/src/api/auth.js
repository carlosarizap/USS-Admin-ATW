import axios from 'axios';

const API = 'http://localhost:4000'

export const registerRequest = user => axios.post(`${API}/register`, user)

export const LoginRequest = user => axios.post(`${API}/Login`, user)

export const ForgotContrasenaRequest = user => axios.post(`${API}/forgot-password`, user)
