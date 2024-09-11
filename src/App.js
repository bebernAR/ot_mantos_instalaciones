import React from 'react';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import FirebaseForm from './LogRegForm';


function App() {
  return (
    <AuthProvider>
      <div className="App">
        <h1>Iniciar Sesión </h1>
        <FirebaseForm />
      </div>
    </AuthProvider>

  );
}

export default App;
