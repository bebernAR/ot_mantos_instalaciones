import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  TextField, Box, Button, Typography, Container, Card, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function TablaMaquinas() {
  const [maquinas, setMaquinas] = useState([]);
  const [modelo, setModelo] = useState('');
  const [familia, setFamilia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Fetch para cargar las máquinas
  const fetchMaquinas = async () => {
    try {
      const response = await axios.get('https://teknia.app/api3/actividades_tecnicas/maquinas');
      setMaquinas(response.data);
    } catch (e) {
      console.log('Error al cargar los datos:', e);
    }
  };

  useEffect(() => {
    fetchMaquinas();
  }, []);

  // Enviar datos del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviar datos a la API
      const response = await axios.post('https://teknia.app/api3/nueva_maquina_db', {
        maquina: modelo,
        tipo: '',
        no_dias: '',
        activo: true,
        familia: familia,
      });
      setMensaje('Máquina agregada exitosamente');
      console.log(response.data);
      fetchMaquinas(); // Recargar la tabla
      setModelo('');
      setFamilia('');
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      setMensaje('Error al agregar la máquina');
    }
  };

  const handleDeletePlan = async (maquina, familia) => {
    try {
      await axios.delete(`https://teknia.app/api3/eliminar_maquina/${maquina}/${familia}`);
      fetchMaquinas();
    } catch (error) {
      console.error('Error al eliminar la máquina:', error);
    }
  };

  // Filtrar máquinas según la búsqueda
  const maquinasFiltradas = maquinas.filter((maquina) => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      maquina.maquina.toLowerCase().includes(textoBusqueda) ||
      maquina.familia.toLowerCase().includes(textoBusqueda)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      {/* Título */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Gestión de Máquinas
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Llena el formulario para agregar una nueva máquina o visualiza los datos existentes.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Columna Izquierda: Formulario */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, boxShadow: 3, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom textAlign="center">
              Agregar Máquina
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Selector de Familia */}
              <FormControl fullWidth>
                <InputLabel>Familia</InputLabel>
                <Select
                  value={familia}
                  onChange={(e) => setFamilia(e.target.value)}
                  style={{ marginBottom: 10 }}
                >
                  {['Router', 'Láser Co2', 'Láser Fibra Óptica', 'Plasma', 'Dobladora', 'Grua Neumática', 'Externa'].map((familia) => (
                    <MenuItem key={familia} value={familia}>
                      {familia}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Campo Modelo */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Modelo"
                  variant="outlined"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </FormControl>

              {/* Botón Enviar */}
              <Box textAlign="center">
                <Button type="submit" variant="contained" color="primary" sx={{ px: 4 }}>
                  Agregar Máquina
                </Button>
              </Box>

              {/* Mensaje de Confirmación/Error */}
              {mensaje && (
                <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mt: 3 }}>
                  {mensaje}
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Columna Derecha: Tabla */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom textAlign="center">
              Máquinas Registradas
            </Typography>

            {/* Buscador */}
            <TextField
              label="Buscar máquinas"
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Familia</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maquinasFiltradas.map((maquina, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{maquina.maquina}</TableCell>
                      <TableCell>{maquina.familia}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePlan(maquina.maquina, maquina.familia)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TablaMaquinas;
