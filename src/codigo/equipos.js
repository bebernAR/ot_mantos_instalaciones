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

const Equipos = () => {
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
            familia: 'Mecánica',
            nombreMáquina: 'Torno CNC',
        },
        // Agrega más datos aquí según lo necesites
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
                <Grid item xs={12} md={4}>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '20px' }}>
                        <TextField {...register('familia')} label="Familia del Equipo" variant="outlined" fullWidth margin="normal" />
                        <TextField {...register('nombreMáquina')} label="Nombre de la Máquina" variant="outlined" fullWidth margin="normal" />
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            {editingIndex !== null ? 'Actualizar Equipo' : 'Agregar Equipo'}
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

                                    <TableCell>Familia</TableCell>
                                    <TableCell>Nombre de la Máquina</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>

                                        <TableCell>{row.familia}</TableCell>
                                        <TableCell>{row.nombreMáquina}</TableCell>
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

export default Equipos;
