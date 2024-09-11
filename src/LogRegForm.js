import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
function FirebaseForm(){
  const auth = useAuth()
  const navigate = useNavigate();
  const [emailRegister, setEmailRegister] = useState("")
  const [passwordRegister, setPasswordRegister] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")


  console.log(emailRegister, passwordRegister, "stateFormsFirebase")

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await auth.register(emailRegister, passwordRegister);
      navigate('/inicio'); // Redirige a la pantalla de inicio después del registro
    } catch (error) {
      console.error('Error en el registro:', error);
    }
  };

  const handleGoogle = async (e) => {
    e.preventDefault();
    try {
      await auth.loginWithGoogle();
      navigate('/inicio'); // Redirige a la pantalla de inicio después del login con Google
    } catch (error) {
      console.error('Error en el login con Google:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      navigate('/inicio'); // Redirige a la pantalla de inicio después del login
    } catch (error) {
      console.error('Error en el login:', error);
    }
  };


  
  return(
    <div className='App'>
      <form className='form'>
        <h3 className="title">Register</h3>
        <input className='input' onChange={(e)=> setEmailRegister(e.target.value)} type='email'/>
        <input className='input' onChange={(e)=> setPasswordRegister(e.target.value)} type='password'/>
        <button className='button' onClick={(e)=>handleLogin(e)}>Ingresar</button>
      </form>

      <button className='button' onClick={(e)=>handleGoogle(e)}>Iniciar Sesión con Google</button>
      <button className='button' onClick={(e)=>handleRegister(e)}>Registrar</button>
    </div>


  )
}

export default FirebaseForm;