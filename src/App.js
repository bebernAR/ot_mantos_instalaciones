import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Link,
  IconButton,
  Switch,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Home from './codigo/homeYlogin/home';
import ActivityPage from './codigo/actividadespage';
import PlanTrabajoPage from './codigo/planes_trabajo';
import Tecnicos from './codigo/tecnicos';
import OrdenesTrabajoList from './codigo/ordenes_trabajo';
import DetalleOrdenTrabajo from './codigo/detalle_orden';
import Login from './codigo/homeYlogin/login';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './codigo/protected_route';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/firebase-config';
import PlantelProduccion from './codigo/plantel_produccion';
import DetalleOrdenPorduccion from './codigo/detalle_orden_produccion';
import TablaOperadores from './codigo/tabla_operadores';
import DetallesEstacion from './codigo/detalle_estacion_trabajo';
import TablaMaquinas from './codigo/tabla_maquinas';
function LogoutButton() {
  const navigate = useNavigate(); 

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra sesión con Firebase
      navigate('/login'); // Redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Button color="inherit" onClick={handleLogout} style={{ marginLeft: '20px' }}>
      Cerrar Sesión
    </Button>
  );
}

function AvatarUsuario({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (email) => email ? email.charAt(0).toUpperCase() : '?';

  return (
    <>
      <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
        <Avatar
          src={user?.photoURL || ''}
          alt={user?.email || 'Usuario'}
        >
          {user?.photoURL ? '' : getInitials(user.email)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>{user?.email}</MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <LogoutButton />
        </MenuItem>
      </Menu>
    </>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; 
  }, []);

  if (loading) {
    return <p>Cargando...</p>; 
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {!currentUser ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} /> {/* Redirige cualquier otra ruta al login */}
            </Routes>
          ) : (
            <>
              <AppBar position="static" sx={{ backgroundColor: darkMode ? 'black' : 'black' }}>
                <Toolbar>
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="logo"
                    component={RouterLink}
                    to="/"
                    style={{ marginRight: '20px' }}
                  >
                    <img src={`/logo_asiarob.png`} alt="Logo" style={{ width: '160px', height: '40px' }} />
                  </IconButton>

                  <Typography variant="h7" style={{ flexGrow: 1 }}>
                    INSTALACIONES, ENSAMBLAJE, MANTOS Y REPARACIONES
                  </Typography>

                  <Link
                    component={RouterLink}
                    to="/"
                    color="inherit"
                    style={{ marginRight: '20px', textDecoration: 'none' }}
                    className="link-appbar"
                  >
                    INICIO
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/activities"
                    color="inherit"
                    style={{ marginRight: '20px', textDecoration: 'none' }}
                    className="link-appbar"
                  >
                    ACTIVIDADES
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/plan_trabajo"
                    color="inherit"
                    style={{ marginRight: '20px', textDecoration: 'none' }}
                    className="link-appbar"
                  >
                    PLANES
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/tecnico"
                    color="inherit"
                    style={{ marginRight: '20px', textDecoration: 'none' }}
                    className="link-appbar"
                  >
                    CREAR ORDEN
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/ordenes_trabajo"
                    color="inherit"
                    style={{ marginRight: '20px', textDecoration: 'none' }}
                    className="link-appbar"
                  >
                    ORDENES
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/plantel_produccion"
                    color="inherit"
                    style={{ marginRight: '20px', textDecoration: 'none' }}
                    className="link-appbar"
                  >
                    PRODUCCIÓN
                  </Link>

                  <p>Modo Oscuro</p>
                  <Switch checked={darkMode} onChange={handleThemeChange} color="default" />

                  {/* Avatar del Usuario */}
                  <AvatarUsuario user={currentUser} />
                </Toolbar>
              </AppBar>

              <Routes>
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/activities" element={<PrivateRoute><ActivityPage /></PrivateRoute>} />
                <Route path="/plan_trabajo" element={<PrivateRoute><PlanTrabajoPage /></PrivateRoute>} />
                <Route path="/tecnico" element={<PrivateRoute><Tecnicos /></PrivateRoute>} />
                <Route path="/ordenes_trabajo" element={<PrivateRoute><OrdenesTrabajoList /></PrivateRoute>} />
                <Route path="/detalle_orden/:numeroOrden" element={<PrivateRoute><DetalleOrdenTrabajo /></PrivateRoute>} />
                <Route path="/plantel_produccion/" element={<PrivateRoute><PlantelProduccion /></PrivateRoute>} />
                <Route path="/detalle_orden_produccion/:numeroOrden" element={<PrivateRoute><DetalleOrdenPorduccion /></PrivateRoute>} />
                <Route path="/tabla_operadores" element={<PrivateRoute><TablaOperadores /></PrivateRoute>} />
                <Route path="/tabla_maquinas" element={<PrivateRoute><TablaMaquinas /></PrivateRoute>} />
                <Route path="/estacion_detalle/:id" element={<PrivateRoute><DetallesEstacion /></PrivateRoute>} />
                
                


              </Routes>
            </>
          )}
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
