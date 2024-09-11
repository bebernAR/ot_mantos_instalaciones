import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
function FirebaseForm(){
  const auth = useAuth()
  const [emailRegister, setEmailRegister] = useState("")
  const [passwordRegister, setPasswordRegister] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")


  console.log(emailRegister, passwordRegister, "stateFormsFirebase")

  const handleRegister = (e) =>{
    e.preventDefault()
    auth.register(emailRegister, passwordRegister)
  };

  const handleGoogle = (e) =>{
    e.preventDefault()
    auth.loginWithGoogle()
  };

  const handleLogin = (e) =>{
    e.preventDefault()
    auth.login()
  }

  console.log(emailRegister,passwordRegister,"stateFormsFirebase")
  
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