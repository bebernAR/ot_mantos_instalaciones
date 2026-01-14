import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Grid2, Card, Button, Select, MenuItem, InputLabel, FormControl, Typography, 
  TextField
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DetalleOrdenTrabajo = () => {
  const { numeroOrden } = useParams();  // Número de orden desde la URL
  const [planesTrabajo, setPlanesTrabajo] = useState([]);
  const [ordenTrabajo, setOrdenTrabajo] = useState({ fecha_creacion: "" });
  const [reservas, setReservas] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState("");
  const [titulo, setTitulo] = useState("");  // Título de la orden
  const [prioridad, setPrioridad] = useState("");  // Prioridad
  const [fechaEstimada, setFechaEstimada] = useState("");  // Fecha estimada
  const [tiempoTotal, setTiempoTotal] = useState(0);
  
  const navigate = useNavigate();// Tiempo acumulado

  // Cargar datos de la orden y planes de trabajo
  useEffect(() => {
    const fetchPlanesTrabajo = async () => {
      try {
        const response = await axios.get(
          `https://teknia.app/api3/obtener_planes_trabajo_por_orden/${numeroOrden}`
        );
        setPlanesTrabajo(response.data);
  
        const sumaTiempo = response.data.reduce((acc, plan) => acc + +plan.tiempo_estimado, 0);
        setTiempoTotal(sumaTiempo);
  
        const ordenResponse = await axios.get(
          `https://teknia.app/api3/obtener_orden_trabajo/${numeroOrden}`
        );
        setOrdenTrabajo(ordenResponse.data);
  
        // Usar la primera familia como ejemplo
        const response2 = await axios.get(`https://teknia.app/api/reservas_agendadas_orden/${response.data[0]?.familia}`);
        setReservas(response2.data);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };
  
    fetchPlanesTrabajo();
  }, [numeroOrden]);

  const handleEliminarOrdenProduccion = async () => {
  const confirmar = window.confirm("¿Estás seguro de eliminar la orden completa y todas sus actividades?");
  if (!confirmar) return;

  try {
    const response = await axios.delete(`https://teknia.app/api3/eliminar_orden_trabajo/${numeroOrden}`);
    alert(response.data.message);
    // Puedes redirigir a la lista de órdenes
    navigate('/ordenes_trabajo');
  } catch (error) {
    console.error("Error al eliminar la orden completa:", error);
    alert("No se pudo eliminar la orden");
  }
};

  const handleBorrarOrden = async () => {
    try {
      const response = await axios.delete(`https://teknia.app/api/orden_agendada/${numeroOrden}`);
      console.log("Orden eliminada:", response.data);
      alert("Orden eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la orden:", error);
    }
  };

  // Manejar la asignación de la orden y mostrar datos en consola
  const handleAsignarOrden = async () => {
    const reservaInfo = findById(reservas, reservaSeleccionada);
    if (!reservaInfo) {
      console.error("Reserva no encontrada");
      return;
    }
  
    const datosOrden = {
      titulo,
      prioridad,
      fechaEstimada,
      reservaId: reservaSeleccionada,
      ordenNumero: numeroOrden,
      tiempoTotal,
      creadoPor: ordenTrabajo.nombre_persona,
      familia: planesTrabajo[0]?.familia || "Sin familia",
      maquina: planesTrabajo[0]?.maquina || "Sin máquina",
      ...reservaInfo, // Agrega todas las propiedades de reservaInfo
    };
  
    console.log("Datos para enviar a la API:", datosOrden);
  
    try {
      const response = await axios.post('https://teknia.app/api/orden_agendada', datosOrden);
      console.log("Respuesta del servidor:", response.data);
      alert("Guardado correctamente");
    } catch (error) {
      console.error("Error al enviar los datos a la API:", error);
    }
  };

  // Función para buscar por id y retornar los datos de la reserva
  const findById = (array, id) => {
    const foundItem = array.find(item => item.id === id);
    if (!foundItem) return null;

    // Retorna solo las propiedades relevantes
    const {
      razon_social,
      username,
      email,
      contacto,
      correo_cliente,
      modelo,
      no_serie,
      tecnico_asignado,
      correo_tecnico_asignado,
    } = foundItem;

    return {
      razon_social,
      username,
      email,
      contacto,
      correo_cliente,
      modelo,
      no_serie,
      tecnico_asignado,
      correo_tecnico_asignado,
    };
  };

  const isButtonDisabled = !titulo || !prioridad || !reservaSeleccionada || !fechaEstimada;

  const formatearFecha = (fecha) =>
    new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(fecha));

  return (
    <>
      <Grid2 size={{ xs: 12, md: 8 }} style={{ padding: 10 }}>
        <Card>
          <Grid2 container spacing={2}>
            <Grid2 xs={1}><strong>Orden #:</strong></Grid2>
            <Grid2 xs={11}>{planesTrabajo[0]?.numero_orden}</Grid2>

            <Grid2 xs={1}><strong>Familia:</strong></Grid2>
            <Grid2 xs={11}>{planesTrabajo[0]?.familia}</Grid2>

            <Grid2 xs={1}><strong>Máquina:</strong></Grid2>
            <Grid2 xs={11}>{planesTrabajo[0]?.maquina}</Grid2>

            <Grid2 xs={1}><strong>Creado por:</strong></Grid2>
            <Grid2 xs={11}>{ordenTrabajo.nombre_persona}</Grid2>

            <Grid2 xs={1}><strong>Fecha de creación:</strong></Grid2>
            <Grid2 xs={11}>
              {formatearFecha(ordenTrabajo.fecha_creacion || new Date())}
            </Grid2>
          </Grid2>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 8 }} style={{ padding: 10 }}>
        <TextField
          label="Título"
          variant="outlined"
          fullWidth
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-prioridad-label">Prioridad</InputLabel>
          <Select
            labelId="select-prioridad-label"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
            label="Prioridad"
          >
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Media">Media</MenuItem>
            <MenuItem value="Baja">Baja</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Fecha Estimada"
          type="date"
          value={fechaEstimada}
          onChange={(e) => setFechaEstimada(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-reserva-label">Asignar a un servicio</InputLabel>
          <Select
            labelId="select-reserva-label"
            value={reservaSeleccionada}
            onChange={(e) => setReservaSeleccionada(e.target.value)}
            label="Asignar a un servicio"
          >
            {reservas.map((reserva) => (
              <MenuItem key={reserva.id} value={reserva.id}>
                {`${reserva.ticket} - ${reserva.razon_social}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          disabled={isButtonDisabled}
          sx={{ marginRight: 6 }}
          onClick={handleAsignarOrden}
        >
          Asignar Orden
        </Button>


        <Button
          variant="contained"
          color="secondary"
          onClick={handleEliminarOrdenProduccion}
        >
          Eliminar Orden
        </Button>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 8 }} sx={{ mt: 2 }} style={{ padding: 10 }}>
        <Typography variant="h6" align="center">
          Tiempo Total Estimado : {tiempoTotal +' min'}
        </Typography>
      </Grid2>

  <Grid2 size={{ xs: 12, md: 8 }} style={{ padding: 10 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Posición</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Objetivo</TableCell>
                <TableCell>Clasificación</TableCell>
                <TableCell>Tiempo Estimado (min)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planesTrabajo.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.posicion}</TableCell>
                  <TableCell>{plan.codigo}</TableCell>
                  <TableCell>{plan.titulo}</TableCell>
                  <TableCell>{plan.objetivo}</TableCell>
                  <TableCell>{plan.clasificacion}</TableCell>
                  <TableCell><strong>{plan.tiempo_estimado} min</strong></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid2>      
    </>
  );
};

export default DetalleOrdenTrabajo;
