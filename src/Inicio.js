import React from 'react';


function Inicio() {
  return (
    <div className="inicio-container">
      <h1>Bienvenido a la Página de Inicio</h1>
      <p>¡Te has autenticado exitosamente! 🎉</p>
      
      <div className="card">
        <h2>Explora tu cuenta</h2>
        <p>Ahora puedes acceder a todas las funcionalidades de la aplicación.</p>
      </div>

      <div className="card">
        <h2>Perfil</h2>
        <p>Configura tu perfil y ajusta tus preferencias personales.</p>
      </div>

      <button className="logout-button">Cerrar Sesión</button>
    </div>
  );
}

export default Inicio;