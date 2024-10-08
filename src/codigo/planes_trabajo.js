import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Grid2, Box, MenuItem, InputLabel, Select, Button, Dialog,
  DialogActions, DialogContent, DialogTitle, TablePagination, FormControl
} from '@mui/material';

const API_URL = 'https://teknia.app/api3';

function PlanTrabajoPage() {
  const [planes, setPlanes] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [newPlan, setNewPlan] = useState({
    numero_orden: '', tipo_servicio: '', actividad_id: '', estado: '',
    familia: '', maquina: '', plazo_servicio: ''
  });
  const [editPlan, setEditPlan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const [maquinasEdit, setMaquinasEdit] = useState([]);

  useEffect(() => {
    fetchPlanes();
    fetchActividades();
  }, []);

  const fetchPlanes = async () => {
    try {
      const response = await axios.get(`${API_URL}/obtener_planes_trabajo`);
      setPlanes(response.data);
    } catch (error) {
      console.error('Error al obtener planes de trabajo:', error);
    }
  };

  const fetchActividades = async () => {
    try {
      const response = await axios.get(`${API_URL}/obtener_actividades_mantto`);
      setActividades(response.data);
    } catch (error) {
      console.error('Error al obtener actividades de mantenimiento:', error);
    }
  };

  const fetchMaquinasPorFamilia = async (familia) => {
    try {
      const response = await axios.get(`https://teknia.app/api/actividades_tecnicas/maquinas/${familia}`);
      setMaquinas(response.data);
    } catch (error) {
      console.error('Error al obtener máquinas:', error);
    }
  };

  const handleAddPlan = async () => {
    try {
      const response = await axios.post(`${API_URL}/crear_plan_trabajo`, newPlan);
      alert(`Plan de trabajo creado: ${response.data.numero_orden}`);
      fetchPlanes();
      setNewPlan({
        numero_orden: '', tipo_servicio: '', actividad_id: '', estado: 'En edición',
        familia: '', maquina: '', plazo_servicio: 'Trimestral'
      });
    } catch (error) {
      console.error('Error al crear el plan de trabajo:', error);
    }
  };

  const handleEditPlan = async () => {
    try {
      await axios.put(`${API_URL}/actualizar_plan_trabajo/${editPlan.id}`, editPlan);
      alert('Plan de trabajo actualizado');
      fetchPlanes();
      setDialogOpen(false);
      setEditPlan(null);
    } catch (error) {
      console.error('Error al actualizar el plan de trabajo:', error);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await axios.delete(`${API_URL}/eliminar_plan_trabajo/${id}`);
      fetchPlanes();
    } catch (error) {
      console.error('Error al eliminar el plan de trabajo:', error);
    }
  };

  const handleFamiliaChange = (familia) => {
    setFamiliaSeleccionada(familia);
    setNewPlan({ ...newPlan, familia, maquina: '' });
    fetchMaquinasPorFamilia(familia); // Cargar las máquinas asociadas a la familia seleccionada
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredPlanes = planes.filter((plan) =>
    String(plan.numero_orden).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(plan.tipo_servicio).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(plan.estado).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPlanes = filteredPlanes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div>
      <h1>Planes de Trabajo</h1>
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
                <InputLabel style={{padding: 10}}>Selecciona la actividad relacionada</InputLabel>
                <Select
                    value={newPlan.actividad_id}
                    onChange={(e) => setNewPlan({ ...newPlan, actividad_id: e.target.value })}
                    style={{marginBottom: 10}}
                    fullWidth
                >
                    {actividades.map((actividad) => (
                    <MenuItem key={actividad.id} value={actividad.id}>
                        {actividad.titulo}
                    </MenuItem>
                    ))}
                </Select>
                <FormControl fullWidth>
                    <InputLabel>Tipo de Servicio</InputLabel>
                    <Select
                        value={newPlan.tipo_servicio}
                        onChange={(e) => setNewPlan({ ...newPlan, tipo_servicio: e.target.value })}
                        style={{marginBottom: 10}}
                        >
                        <MenuItem value="Instalación">Instalación</MenuItem>
                        <MenuItem value="Capacitación">Capacitación</MenuItem>
                        <MenuItem value="Instalación/Capacitación">Instalación/Capacitación</MenuItem>
                        <MenuItem value="Mantenimiento Estándar">Mantenimiento Estándar</MenuItem>
                        <MenuItem value="Mantenimiento Completo">Mantenimiento Completo</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={newPlan.estado}
                        onChange={(e) => setNewPlan({ ...newPlan, estado: e.target.value })}
                        style={{marginBottom: 10}}
                        >
                        <MenuItem value="En edición">En edición</MenuItem>
                        <MenuItem value="Liberado">Liberado</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Familia</InputLabel>
                    <Select
                        value={familiaSeleccionada}
                        onChange={(e) => handleFamiliaChange(e.target.value)}
                        style={{marginBottom: 10}}
                        >
                        {['Router', 'Láser Co2', 'Láser Fibra Óptica', 'Plasma', 'Dobladora', 'Grua Neumática', 'Externa'].map((familia) => (
                            <MenuItem key={familia} value={familia}>
                            {familia}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Máquina</InputLabel>
                    <Select
                        value={newPlan.maquina}
                        onChange={(e) => setNewPlan({ ...newPlan, maquina: e.target.value })}
                        style={{marginBottom: 10}}
                        disabled={!maquinas.length}
                        >
                        {maquinas.map((maquina, index) => (
                            <MenuItem key={index} value={maquina.maquina}>
                            {maquina.maquina}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Plazo de Servicio</InputLabel>
                    <Select
                        value={newPlan.plazo_servicio}
                        onChange={(e) => setNewPlan({ ...newPlan, plazo_servicio: e.target.value })}
                        style={{marginBottom: 10}}
                        >
                        <MenuItem value="Trimestral">Trimestral</MenuItem>
                        <MenuItem value="Semestral">Semestral</MenuItem>
                        <MenuItem value="Anual">Anual</MenuItem>
                        <MenuItem value="No Aplica">No Aplica</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleAddPlan} sx={{ ml: 2 }}>
                    Agregar Plan de Trabajo
                </Button>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 8 }}>
                <TextField
                    label="Buscar Plan"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>Número de Orden</TableCell>
                        <TableCell>Tipo de Servicio</TableCell>
                        <TableCell>Actividad</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {displayedPlanes.map((plan) => (
                        <TableRow key={plan.id}>
                        <TableCell>{plan.numero_orden == "" ? "Pendiente" : plan.numero_orden}</TableCell>
                        <TableCell>{plan.tipo_servicio}</TableCell>
                        <TableCell>
                            {actividades.find((act) => act.id === plan.actividad_id)?.titulo || 'No disponible'}
                        </TableCell>
                        <TableCell>{plan.estado}</TableCell>
                        <TableCell>
                            <Button onClick={async() => {
                                const response = await axios.get(`https://teknia.app/api/actividades_tecnicas/maquinas/${plan.familia}`);
                                setMaquinasEdit(response.data);

                                setEditPlan(plan);
                                setDialogOpen(true);
                            }}>
                            Editar
                            </Button>
                            <Button color="error" onClick={() => handleDeletePlan(plan.id)}>
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
                count={filteredPlanes.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                />
            </Grid2>
        </Grid2>

        {editPlan && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Editar Plan de Trabajo</DialogTitle>
            <DialogContent>
                <InputLabel style={{padding: 10}}>Selecciona la actividad relacionada</InputLabel>
                <Select
                value={editPlan.actividad_id}
                onChange={(e) => setEditPlan({ ...editPlan, actividad_id: e.target.value })}
                style={{marginBottom: 10}}
                fullWidth
                sx={{ mb: 2 }}
                >
                {actividades.map((actividad) => (
                    <MenuItem key={actividad.id} value={actividad.id}>
                    {actividad.titulo}
                    </MenuItem>
                ))}
                </Select>
                {/* Tipo de Servicio */}
                <FormControl fullWidth sx={{ mb: 2 }}>  {/* Añadir validación */}
                    <InputLabel>Tipo de Servicio</InputLabel>
                    <Select
                        value={editPlan.tipo_servicio}
                        onChange={(e) => setEditPlan({ ...editPlan, tipo_servicio: e.target.value })}
                        fullWidth
                    >
                        <MenuItem value="Instalación">Instalación</MenuItem>
                        <MenuItem value="Capacitación">Capacitación</MenuItem>
                        <MenuItem value="Instalación/Capacitación">Instalación/Capacitación</MenuItem>
                        <MenuItem value="Mantenimiento Estándar">Mantenimiento Estándar</MenuItem>
                        <MenuItem value="Mantenimiento Completo">Mantenimiento Completo</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={editPlan.estado}
                        onChange={(e) => setEditPlan({ ...editPlan, estado: e.target.value })}
                        style={{marginBottom: 10}}
                        >
                        <MenuItem value="En edición">En edición</MenuItem>
                        <MenuItem value="Liberado">Liberado</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Familia</InputLabel>
                    <Select
                        value={editPlan.familia}
                        onChange={async(e) => {
                            setEditPlan({ ...editPlan, familia: e.target.value })
                            const response = await axios.get(`https://teknia.app/api/actividades_tecnicas/maquinas/${e.target.value}`);
                            setMaquinasEdit(response.data);
                        }}
                        style={{marginBottom: 10}}
                        >
                        {['Router', 'Láser Co2', 'Láser Fibra Óptica', 'Plasma', 'Dobladora', 'Grua Neumática', 'Externa'].map((familia) => (
                            <MenuItem key={familia} value={familia}>
                            {familia}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Máquina</InputLabel>
                    <Select
                        value={editPlan.maquina}
                        onChange={(e) => setEditPlan({ ...editPlan, maquina: e.target.value })}
                        style={{marginBottom: 10}}
                        disabled={!maquinasEdit.length}
                        >
                        {maquinasEdit.map((maquina, index) => (
                            <MenuItem key={index} value={maquina.maquina}>
                            {maquina.maquina}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Plazo de Servicio */}
                <FormControl fullWidth sx={{ mb: 2 }}>  {/* Añadir validación */}
                    <InputLabel>Plazo de Servicio</InputLabel>
                    <Select
                        value={editPlan.plazo_servicio}
                        onChange={(e) => setEditPlan({ ...editPlan, plazo_servicio: e.target.value })}
                        style={{marginBottom: 10}}
                    >
                        <MenuItem value="Trimestral">Trimestral</MenuItem>
                        <MenuItem value="Semestral">Semestral</MenuItem>
                        <MenuItem value="Anual">Anual</MenuItem>
                        <MenuItem value="No Aplica">No Aplica</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                setDialogOpen(false);
                setEditPlan(null);
                }}>
                Cancelar
                </Button>
                <Button onClick={handleEditPlan} variant="contained" color="primary">
                Guardar
                </Button>
            </DialogActions>
        </Dialog>
        )}
      </Box>
    </div>
  );
}

export default PlanTrabajoPage;
                