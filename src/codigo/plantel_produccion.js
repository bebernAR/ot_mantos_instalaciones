import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import {
  Typography, Container, Box, Grid, Card, CardContent, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Select, MenuItem, Link, LinearProgress,
  FormControl
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Para acceder al tema
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const API_URL = 'https://teknia.app/api3';

function PlantelProduccion() {
  const { currentUser } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesAgendadas, setOrdenesAgendadas] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ id: '' });
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrdenesTrabajo = async () => {
      try {
        const response = await axios.get(`${API_URL}/obtener_ordenes_trabajo`);
        const response2 = await axios.get(`${API_URL}/obtener_ordenes_trabajo_agendada`);

        const filteredOrdenes = response.data.filter((orden) =>
          orden.titulo.toLowerCase().includes('ensamble')
        );
        const filteredOrdenesAgendadas = response2.data.filter((orden) =>
          orden.reserva_id === 0 && orden.estatus !== "Finalizado"
        );

        // Ordenar por fecha_estimada ascendente
        filteredOrdenesAgendadas.sort((a, b) => new Date(a.fecha_estimada) - new Date(b.fecha_estimada));

        

        setOrdenes(filteredOrdenes);
        setOrdenesAgendadas(filteredOrdenesAgendadas);
      } catch (error) {
        console.error('Error al cargar las órdenes de trabajo:', error);
      }
    };

    fetchOrdenesTrabajo();
  }, []);

  const cardColor = theme.palette.mode === 'dark' ? 'grey' : '#6eb2ff';
  const isButtonDisabled = !formData.id

  const detallesOrden = (id) => navigate(`/estacion_detalle/${id}`)

  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
//  Función para navegar con el ID de la orden mediante parámetro en url y el id de SAI mediante un estado.
  const handleSubmitForm = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    navigate(`/detalle_orden_produccion/${formData.id}`, {state: {folioSai: formData.folio_sai}});
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Bienvenido {currentUser ? currentUser.email : 'Invitado'}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Crea órdenes y administra tu plantel de producción.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Información de la planta
          </Typography>

          <Button variant="contained" color="primary" onClick={handleOpenForm}>
            Asignar Orden
          </Button>
        </Grid>

        {/* Cards con órdenes filtradas */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom textAlign={'center'}>
            Órdenes de trabajo: Ensamble
          </Typography>

          <Grid container spacing={2}>
            {ordenesAgendadas.slice(0,15).map((orden) => (
              <Grid item xs={12} sm={6} md={4} key={orden.id}>
                <Card
                  variant="outlined"
                  sx={{
                    backgroundColor: cardColor,
                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                    transition: '0.3s',
                    cursor: 'pointer',
                    height:'100%',
                    '&:hover': {
                      backgroundColor: '#629fc8 ', // Cambia el color de fondo al pasar el cursor
                      transform: 'scale(1.03)', // Agranda ligeramente el card
                      boxShadow: `0px 4px 20px ${theme.palette.primary.main}`,
                      color: 'black'
                    },

                  }}
                  onClick={() => { detallesOrden(orden.id) }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {orden.titulo}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Operador asignado: {orden.tecnico_asignado}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Equipo: {orden.maquina}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Terminar antes de: {new Date(orden.fecha_estimada).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Progreso:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={orden.avance ? orden.avance : 0}
                        sx={{ height: 10, borderRadius: 5, backgroundColor: theme.palette.grey[300] }}
                      />
                      <Typography variant="caption" display="block" textAlign="right">
                        {orden.avance ? orden.avance.toFixed(2) : 0}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Formulario dentro de un Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle textAlign="center">Asignar Orden </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitForm} sx={{ mt: 2 }}>

            {/* Select para mostrar las órdenes */}
            <TextField
              label="Número de orden"
              type="number"
              name="folio_sai"
              placeholder="Ingresa el número de orden del SAI"
              value={formData.folio_sai || ''}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />

            <Select
              fullWidth
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              displayEmpty
              disabled={!formData.folio_sai}
              required
            >
              <MenuItem value="" disabled>
                Selecciona una equipo
              </MenuItem>
              {ordenes.map((orden) => (
                <MenuItem key={orden.id} value={orden.id}>
                  {orden.titulo}
                </MenuItem>
              ))}
            </Select>

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="secondary">
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmitForm} color="primary" disabled={isButtonDisabled}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PlantelProduccion;
