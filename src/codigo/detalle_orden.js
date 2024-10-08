import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid2, Card, Button, Select, MenuItem, InputLabel, FormControl, Typography
} from '@mui/material';
import axios from 'axios';

const DetalleOrdenTrabajo = () => {
  const { numeroOrden } = useParams(); // Obtener el número de orden desde la URL
  const [planesTrabajo, setPlanesTrabajo] = useState([]);
  const [ordenTrabajo, setOrdenTrabajo] = useState({ fecha_creacion: "" });
  const [reservas, setReservas] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState("");
  const [tiempoTotal, setTiempoTotal] = useState(0);

  useEffect(() => {
    // Cargar los planes de trabajo relacionados con la orden seleccionada
    const fetchPlanesTrabajo = async () => {
      try {
        const response = await axios.get(`https://teknia.app/api3/obtener_planes_trabajo_por_orden/${numeroOrden}`);
        setPlanesTrabajo(response.data);
        var sumaTiempo = 0;
        for(var i = 0; i<response.data.length; i++){
            var tiempo = response.data[i].tiempo_estimado;
            sumaTiempo = sumaTiempo + + tiempo;
        }
        setTiempoTotal(sumaTiempo);
        const response1 = await axios.get(`https://teknia.app/api3/obtener_orden_trabajo/${numeroOrden}`);
        setOrdenTrabajo(response1.data);
      } catch (error) {
        console.error('Error al cargar los planes de trabajo:', error);
      }
    };

    // Cargar las reservas agendadas
    const fetchReservasAgendadas = async () => {
      try {
        const response = await axios.get('https://teknia.app/api/reservas_agendadas/');
        setReservas(response.data);
      } catch (error) {
        console.error('Error al cargar las reservas agendadas:', error);
      }
    };

    fetchPlanesTrabajo();
    fetchReservasAgendadas();
  }, [numeroOrden]);

  function formatearFecha(fechaISO) {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(fechaISO));
  }

  const handleAsignarOrden = () => {
    // Imprime en consola los datos de la reserva seleccionada y la orden de trabajo
    console.log("Reserva seleccionada:", reservaSeleccionada);
    console.log("Orden de trabajo:", ordenTrabajo);
  };

  return (
    <>
      <Grid2 size={{ xs: 12, md: 8 }} style={{padding: 10}}>
        <Card>
          <Grid2 container spacing={2}>
            <Grid2 container spacing={2}>
              <Grid2 xs={1}>
                <strong>Orden #:</strong>
              </Grid2>
              <Grid2 xs={11}>
                {planesTrabajo[0]?.numero_orden}
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 xs={1}>
                <strong>Familia:</strong>
              </Grid2>
              <Grid2 xs={11}>
                {planesTrabajo[0]?.familia}
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 xs={1}>
                <strong>Máquina:</strong>
              </Grid2>
              <Grid2 xs={11}>
                {planesTrabajo[0]?.maquina}
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 xs={1}>
                <strong>Creado por:</strong>
              </Grid2>
              <Grid2 xs={11}>
                {ordenTrabajo.nombre_persona}
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 xs={1}>
                <strong>Fecha de creación:</strong>
              </Grid2>
              <Grid2 xs={11}>
                {formatearFecha((ordenTrabajo.fecha_creacion === null || ordenTrabajo.fecha_creacion === "") ? new Date().toISOString() : ordenTrabajo.fecha_creacion)}
              </Grid2>
            </Grid2>
          </Grid2>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 8 }} style={{padding: 10}}>
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
                  <TableCell>{plan.tiempo_estimado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid2>

      {/* Alinear el Tiempo Total a la derecha */}
      <Grid2 size={{ xs: 12, md: 8 }} sx={{ mt: 4, mr:14 }} style={{ display: 'flex', justifyContent: 'flex-end', padding: 10 }}>
        <Grid2 container spacing={2}>
            <Grid2 xs={2}>
            <strong>Tiempo Total:</strong>
            </Grid2>
            <Grid2 xs={20}>
            {tiempoTotal}
            </Grid2>
        </Grid2>
      </Grid2>

      {/* Selector de reserva */}
      <Grid2 size={{ xs: 12, md: 8 }} sx={{ mt: 4 }}>
        <FormControl sx={{ width: 300, marginRight: 6 }}>
          <InputLabel id="select-reserva-label">Asignar a un servicio</InputLabel>
          <Select
            labelId="select-reserva-label"
            value={reservaSeleccionada}
            onChange={(e) => setReservaSeleccionada(e.target.value)}
            label="Asignar a un servicio"
          >
            {reservas.map((reserva) => (
              <MenuItem key={reserva.id} value={reserva.id}>
                {`${reserva.ticket} --- ${reserva.razon_social}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleAsignarOrden}
        >
          Asignar Orden
        </Button>
      </Grid2>
    </>
  );
};

export default DetalleOrdenTrabajo;