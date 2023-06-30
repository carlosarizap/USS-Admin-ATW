
import { registerRequest, LoginRequest, ForgotContrasenaRequest } from '../api/auth.js';
import { useState, createContext, useContext, useEffect } from 'react';

export const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within a AuthProvider");
    return context;
  }; 


export const AuthProvider = ({children})=>{
    
    const [user, setUser] = useState(null)
    const [isAuthenticated, setisAuthenticated] =useState(false);
    const [errors, setErrors] = useState()

     const signup = async (user)=>{
        try{
        const res = await registerRequest(user);
        console.log(res.data);
        setUser(res.data);
        await setisAuthenticated(true)
        } catch (error){
            //console.log(error.response)
            setErrors(error.response.data)
        }
    };

    const signin = async ( user) => {
        try {
            //console.log(user)
            const res = await LoginRequest(user)
            setUser(user);
            await setisAuthenticated(true)
            return(true)
        } catch (error) {
            setisAuthenticated(false)
            await setErrors(error.response.data)
            return(false)
        }
    }

    const ForgotContrasena = async ( user) => {
        try {
            //console.log(user)
            const res = await ForgotContrasenaRequest(user)
            setUser(user);
            await setisAuthenticated(true)
            return(true)
        } catch (error) {
            setisAuthenticated(false)
            await setErrors(error.response.data)
            return(false)
        }
    }

 /*   useEffect(()=>{
        if (errors.length > 0){
           const timer = setTimeout(() =>{
                setErrors([])
            }, 5000)
            return()=> clearTimeout(timer)
        }
     }, [errors])*/
    

    return(
        <AuthContext.Provider
        value={{
            signup,
            signin,
            ForgotContrasena,
            user,
            isAuthenticated,
            errors
        }}>
        
            {children}
        </AuthContext.Provider>
    )
}
