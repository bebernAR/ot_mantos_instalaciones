import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Box, Button, Grid, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Pagination, CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase-config';
import { signOut } from "firebase/auth";
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Obtener usuario autenticado
  const [orders, setOrders] = useState([]); // Almacenar datos de la API
  const [loading, setLoading] = useState(true); // Estado de carga
  const [page, setPage] = useState(1); // Estado de paginación
  const rowsPerPage = 5; // Definir número de filas por página

  // Manejar cierre de sesión
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // Redirigir al inicio
  };

  // Redirigir al login
  const irAlogin = async () => {
    navigate('/login');
  };

  // Llamada a la API para obtener órdenes del usuario autenticado
  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(
            `https://teknia.app/api3/obtener_ordenes_trabajo_correo/${currentUser.email}`
          );
          setOrders(response.data); // Guardar datos en el estado
        } catch (error) {
          console.error('Error al obtener las órdenes:', error);
        } finally {
          setLoading(false); // Finalizar carga
        }
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Manejar cambio de página en la paginación
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Calcular datos a mostrar en la página actual
  const paginatedOrders = orders.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Órdenes de Trabajo de {currentUser ? currentUser.email : "Invitado"}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Consulta y gestiona tus órdenes de manera eficiente.
        </Typography>
      
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Correo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Versión</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Creación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Modificación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Puede Editar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>{order.nombre_persona}</TableCell>
                <TableCell>{order.correo_persona}</TableCell>
                <TableCell>{order.version}</TableCell>
                <TableCell>{new Date(order.fecha_creacion).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.fecha_modificacion).toLocaleDateString()}</TableCell>
                <TableCell>{order.puede_editar ? 'Sí' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="center" mt={2} mb={2}>
          <Pagination 
            count={Math.ceil(orders.length / rowsPerPage)} 
            page={page} 
            onChange={handleChangePage} 
            color="primary"
          />
        </Box>
      </TableContainer>
    </Container>
  );
};

export default Home;
