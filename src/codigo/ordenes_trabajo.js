import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper
} from '@mui/material';
import axios from 'axios';

const OrdenesTrabajoList = () => {
  const [ordenes, setOrdenes] = useState([]);
  const navigate = useNavigate();  // Usa useNavigate

  useEffect(() => {
    // Cargar todas las órdenes de trabajo al montar el componente
    const fetchOrdenesTrabajo = async () => {
      try {
        const response = await axios.get('https://teknia.app/api3/obtener_ordenes_trabajo');
        setOrdenes(response.data);
      } catch (error) {
        console.error('Error al cargar las órdenes de trabajo:', error);
      }
    };

    fetchOrdenesTrabajo();
  }, []);

  // Maneja el clic en "Ver detalles"
  const handleVerDetalles = (numeroOrden) => {
    navigate(`/detalle_orden/${numeroOrden}`);  // Usa navigate en lugar de history.push
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre Persona</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Fecha Creación</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ordenes.map((orden) => (
            <TableRow key={orden.id}>
              <TableCell>{orden.id}</TableCell>
              <TableCell>{orden.nombre_persona}</TableCell>
              <TableCell>{orden.correo_persona}</TableCell>
              <TableCell>{new Date(orden.fecha_creacion).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleVerDetalles(orden.id)}
                >
                  Ver detalles
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrdenesTrabajoList;