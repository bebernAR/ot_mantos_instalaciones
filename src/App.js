import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importa Router, Routes, y Route
import { AuthProvider } from './context/AuthContext';
import './App.css';
import FirebaseForm from './LogRegForm';
import Inicio from './Inicio';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta para el formulario de login/registro */}
            <Route path="/" element={<FirebaseForm />} />

            {/* Ruta para la página de inicio */}
            <Route path="/inicio" element={<Inicio />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;