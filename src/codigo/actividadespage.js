import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableSortLabel, TablePagination,
  TableHead, TableRow, Paper, TextField, Grid2, Box, MenuItem, InputLabel, Select,
  Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';

const API_URL = 'https://teknia.app/api3';

function ActivityPage() {
  const [actividades, setActividades] = useState([]);
  const [newActividad, setNewActividad] = useState({ codigo: '', titulo: '', objetivo: '' });
  const [editActividad, setEditActividad] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const [order, setOrder] = useState('');
  const [orderBy, setOrderBy] = useState('');

  const [clasificacion, setClasificacion] = useState("");
  const [clasification, setClasification] = useState("");

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const response = await axios.get(`${API_URL}/obtener_actividades_mantto`);
      setActividades(response.data);
    } catch (error) {
      console.error('Error fetching Actividades:', error);
    }
  };

  const handleAddActividad = async () => {
    var data = {
      ...newActividad,
      clasificacion: clasificacion,
      activo: true
    }
    try {
      await axios.post(`${API_URL}/crear_actividad_mantto`, data);
      fetchActividades();
      setNewActividad({ codigo: '', titulo: '', objetivo: '' });
      setClasificacion("");
    } catch (error) {
      console.error('Error adding Actividad:', error);
    }
  };

  const handleEditActividad = async () => {
    var data = {
      ...editActividad,
      clasificacion: clasification,
      activo: true
    }
    try {
      await axios.put(`${API_URL}/actualizar_actividad_mantto/${editActividad.id}`, data);
      fetchActividades();
      setDialogOpen(false);
      setEditActividad(null);
      setClasification("");
    } catch (error) {
      console.error('Error editing Actividad:', error);
    }
  };

  const handleDeleteActividad = async (id) => {
    try {
      await axios.delete(`${API_URL}/eliminar_actividad_mantto/${id}`);
      fetchActividades();
    } catch (error) {
      console.error('Error deleting Actividad:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Filtrar los productos según el término de búsqueda
  const filteredActividad = actividades.filter((actividad) =>
    String(actividad.codigo).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(actividad.titulo).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(actividad.objetivo).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(actividad.clasificacion).toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedActividad = [...filteredActividad].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });


  // Calcular el índice de los productos que se mostrarán en la página actual
  const displayedActividades = sortedActividad.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div>
      <h1>Actividades de Mantenimiento</h1>
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
                <TextField
                    label="Codigo"
                    value={newActividad.codigo}
                    onChange={(e) => setNewActividad({ ...newActividad, codigo: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Titulo"
                    value={newActividad.titulo}
                    onChange={(e) => setNewActividad({ ...newActividad, titulo: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Objetivo"
                    value={newActividad.objetivo}
                    onChange={(e) => setNewActividad({ ...newActividad, objetivo: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <InputLabel>Clasificación</InputLabel>
                <Select
                    value={clasificacion}
                    onChange={(e) => setClasificacion(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="Inspección">
                      Inspección
                    </MenuItem>
                    <MenuItem value="Lubricación">
                      Lubricación
                    </MenuItem>
                    <MenuItem value="Limpieza">
                      Limpieza
                    </MenuItem>
                    <MenuItem value="Ajuste">
                      Ajuste
                    </MenuItem>
                    <MenuItem value="Remplazo Definitivo">
                      Remplazo Definitivo
                    </MenuItem>
                    <MenuItem value="Sustitución Temporal">
                      Sustitución Temporal
                    </MenuItem>
                </Select>
                <Button variant="contained" color="primary" onClick={handleAddActividad}>
                    Agregar Actividad
                </Button>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
                    <TextField
                    label="Buscar"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    sx={{ mr: 2 }}
                    />
                </Box>
                <TableContainer component={Paper}>
                    <Table>
                    <TableHead>
                        <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'codigo'}
                            direction={orderBy === 'codigo' ? order : 'asc'}
                            onClick={() => handleRequestSort('codigo')}
                          >
                            Codigo
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'titulo'}
                            direction={orderBy === 'titulo' ? order : 'asc'}
                            onClick={() => handleRequestSort('titulo')}
                          >
                            Titulo
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'objetivo'}
                            direction={orderBy === 'objetivo' ? order : 'asc'}
                            onClick={() => handleRequestSort('objetivo')}
                          >
                            Objetivo
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'clasificacion'}
                            direction={orderBy === 'clasificacion' ? order : 'asc'}
                            onClick={() => handleRequestSort('clasificacion')}
                          >
                            Clasificación
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedActividades.map((actividad) => (
                        <TableRow key={actividad.id}>
                            <TableCell>{actividad.codigo}</TableCell>
                            <TableCell>{actividad.titulo}</TableCell>
                            <TableCell>{actividad.objetivo}</TableCell>
                            <TableCell>{actividad.clasificacion}</TableCell>
                            <TableCell>
                            <Button onClick={() => {
                                setEditActividad(actividad);
                                setClasification(actividad.clasificacion);
                                setDialogOpen(true);
                            }}>
                                Editar
                            </Button>
                            <Button color="error" onClick={() => handleDeleteActividad(actividad.id)}>
                                Eliminar
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredActividad.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                />
            </Grid2>
        </Grid2>            
      {editActividad && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogContent>
            <TextField
              label="Codigo"
              value={editActividad.codigo}
              onChange={(e) => setEditActividad({ ...editActividad, codigo: e.target.value })}
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              label="Titulo"
              value={editActividad.titulo}
              onChange={(e) => setEditActividad({ ...editActividad, titulo: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Objetivo"
              value={editActividad.objetivo}
              onChange={(e) => setEditActividad({ ...editActividad, objetivo: e.target.value })}
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            />
            <InputLabel>Clasificación</InputLabel>
            <Select
                value={clasification}
                onChange={(e) => setClasification(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            >
                <MenuItem value="Inspección">
                  Inspección
                </MenuItem>
                <MenuItem value="Lubricación">
                  Lubricación
                </MenuItem>
                <MenuItem value="Limpieza">
                  Limpieza
                </MenuItem>
                <MenuItem value="Ajuste">
                  Ajuste
                </MenuItem>
                <MenuItem value="Remplazo Definitivo">
                  Remplazo Definitivo
                </MenuItem>
                <MenuItem value="Sustitución Temporal">
                  Sustitución Temporal
                </MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
                fetchActividades();
                setDialogOpen(false);
                setEditActividad(null);
                setClasification("");
            }}>Cancelar</Button>
            <Button onClick={handleEditActividad} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      )}
      </Box>
    </div>
  );
}

export default ActivityPage;
