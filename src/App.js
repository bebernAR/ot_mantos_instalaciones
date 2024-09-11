import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Link,
  IconButton
} from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link as RouterLink } from 'react-router-dom';
import Home from './codigo/home';
import ActivityPage from './codigo/actividadespage';
import Equipos from './codigo/equipos';

function App() {
  return (
    <Router>
      <AppBar position="static" sx={{ backgroundColor: 'black' }}> {/* Cambiar el fondo a negro */}
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="logo" component={RouterLink} to="/" style={{ marginRight: '20px' }}>
            <img src={`/logo_asiarob.png`} alt="Logo" style={{ width: '160px', height: '40px' }} />
          </IconButton>

          {/* Título de la aplicación */}
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            MANTOS Y REPARACIONES
          </Typography>

          {/* Enlaces de navegación */}
          <Link component={RouterLink} to="/" color="inherit" style={{ marginRight: '20px', textDecoration: "none" }}>
            INICIO
          </Link>
          <Link component={RouterLink} to="/activities" color="inherit" style={{ marginRight: '20px', textDecoration: "none" }}>
            ACTIVIDADES
          </Link>
          <Link component={RouterLink} to="/equipos" color="inherit" style={{ textDecoration: "none" }}>
            EQUIPOS
          </Link>
        </Toolbar>
      </AppBar>

      {/* Rutas de la aplicación */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activities" element={<ActivityPage />} />
        <Route path="/equipos" element={<Equipos />} />
      </Routes>
    </Router>
  );
}

export default App;