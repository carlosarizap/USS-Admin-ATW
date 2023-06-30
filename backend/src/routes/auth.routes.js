import { Router } from "express";
import { login, register, fpassword, rpassword, rppassword, logout, profile } from '../controllers/auth.controller.js'
import { authRequire } from "../middlewares/validateToken.js";
import {validateSchema} from '../middlewares/validatorM.js';
import {loginSchema, registerSchema, forgotpasswordSchema} from "../../Schemas/auth.schema.js";

const router = Router();

router.post('/register', validateSchema(registerSchema), register);

router.post('/login', validateSchema(loginSchema) , login);

router.post('/forgot-password',validateSchema(forgotpasswordSchema), fpassword);

router.get('/reset-password/:id/:token', rpassword);

router.post('/reset-password/:id/:token', rppassword);

router.post('/logout', logout);

router.get('/profile', authRequire, profile);

export default router;