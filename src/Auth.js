import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Importa las funciones de autenticación
import { useFirebaseApp } from 'reactfire'; // Importa Reactfire para usar FirebaseApp

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Obtiene la instancia de Firebase App
  const firebaseApp = useFirebaseApp();

  // Obtiene la instancia de Auth usando Firebase App
  const auth = getAuth(firebaseApp);

  const submit = async () => {
    try {
      // Crea un nuevo usuario con email y contraseña
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Usuario creado exitosamente');
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert(`Error: ${error.message}`);
    }
  }

  return (
    <div>
      <div>
        <label htmlFor="email">Correo electrónico</label>
        <input type="email" id="email" onChange={(ev) => setEmail(ev.target.value)} />
        
        <label htmlFor="password">Contraseña</label>
        <input type="password" id="password" onChange={(ev) => setPassword(ev.target.value)} />
        
        <button onClick={submit}>Iniciar sesión</button>
      </div>
    </div>
  );
}