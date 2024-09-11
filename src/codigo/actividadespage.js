// ActivityPage.js
import React, { useState } from 'react';
import {
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useForm } from 'react-hook-form';

const ActivityPage = () => {
  const [data, setData] = useState([
    {
      código: 'MTP0001',
      título: 'Revisión de estado de baleros y guías lineales',
      objetivo: 'Establecer si las guías y baleros lineales se desplazan con poca fricción y sin brincos.',
      clasificación: 'Inspección',
      frecuencia: 30,
      tiempoEstimado: '01:20',
      procedimiento: 'https://google.com',
      otrosRecursos: 'https://google.com',
    },
  ]);

  const { register, handleSubmit, reset } = useForm();
  const [editingIndex, setEditingIndex] = useState(null);

  const onSubmit = (formData) => {
    if (editingIndex !== null) {
      const updatedData = data.map((item, index) =>
        index === editingIndex ? formData : item
      );
      setData(updatedData);
      setEditingIndex(null);
    } else {
      setData([...data, formData]);
    }
    reset();
  };

  const editRow = (index) => {
    setEditingIndex(index);
    reset(data[index]);
  };

  const deleteRow = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Actividades</h1>
      <Grid container spacing={3}>
        {/* Formulario a la izquierda */}
        <Grid item xs={12} md={4}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '20px' }}>
            <TextField {...register('código')} label="Código" variant="outlined" fullWidth margin="normal" />
            <TextField {...register('título')} label="Título" variant="outlined" fullWidth margin="normal" />
            <TextField {...register('objetivo')} label="Objetivo" variant="outlined" fullWidth margin="normal" />
            <TextField {...register('clasificación')} label="Clasificación" variant="outlined" fullWidth margin="normal" />
            <TextField {...register('frecuencia')} type="number" label="Frecuencia (Días)" variant="outlined" fullWidth margin="normal" />
            <TextField {...register('tiempoEstimado')} label="Tiempo Estimado (HH:MM)" variant="outlined" fullWidth margin="normal" />
            <TextField {...register('procedimiento')} label="Procedimiento (Liga PDF)" variant="outlined" fullWidth margin="normal" />
            <TextField {...register('otrosRecursos')} label="Otros Recursos (Liga Drive)" variant="outlined" fullWidth margin="normal" />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {editingIndex !== null ? 'Actualizar Actividad' : 'Agregar Actividad'}
            </Button>
          </form>
        </Grid>

        {/* Tabla de actividades a la derecha */}
        <Grid item xs={12} md={8}>
          <TextField label="Buscar" variant="outlined" fullWidth margin="normal" />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Objetivo</TableCell>
                  <TableCell>Clasificación</TableCell>
                  <TableCell>Frecuencia (Días)</TableCell>
                  <TableCell>Tiempo Estimado</TableCell>
                  <TableCell>Procedimiento</TableCell>
                  <TableCell>Otros Recursos</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.código}</TableCell>
                    <TableCell>{row.título}</TableCell>
                    <TableCell>{row.objetivo}</TableCell>
                    <TableCell>{row.clasificación}</TableCell>
                    <TableCell>{row.frecuencia}</TableCell>
                    <TableCell>{row.tiempoEstimado}</TableCell>
                    <TableCell>{row.procedimiento}</TableCell>
                    <TableCell>{row.otrosRecursos}</TableCell>
                    <TableCell>
                      <Button color="primary" onClick={() => editRow(index)}>Editar</Button>
                      <Button color="error" onClick={() => deleteRow(index)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  );
};

export default ActivityPage;
