import React, { useState, useEffect } from 'react';
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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';

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

    const { register, handleSubmit, reset, setValue } = useForm();
    const [editingIndex, setEditingIndex] = useState(null);
    const [familia, setFamilia] = useState('');
    const [maquinas, setMaquinas] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState('');

    useEffect(() => {
        if (familia) {
            axios.get(`https://teknia.app/api/actividades_tecnicas/maquinas/${familia}`)
                .then(response => {
                    setMaquinas(response.data.map(machine => machine.maquina));
                })
                .catch(error => {
                    console.error('Error fetching machine data:', error);
                });
        } else {
            setMaquinas([]);
        }
    }, [familia]);

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
        setFamilia('');
        setSelectedMachine('');
    };

    const editRow = (index) => {
        setEditingIndex(index);
        const item = data[index];
        setFamilia(item.familia);
        setSelectedMachine(item.nombreMáquina);
        reset(item);
    };

    const deleteRow = (index) => {
        const updatedData = data.filter((_, i) => i !== index);
        setData(updatedData);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Gestión de Equipos</h1>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '20px' }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Familia del Equipo</InputLabel>
                            <Select
                                {...register('familia')}
                                value={familia}
                                onChange={(e) => {
                                    setFamilia(e.target.value);
                                    setValue('familia', e.target.value);
                                }}
                                label="Familia del Equipo"
                            >
                                {['Router', 'Láser Co2', 'Láser Fibra Óptica', 'Plasma', 'Dobladora', 'Grua Neumática', 'Externa'].map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Nombre de la Máquina</InputLabel>
                            <Select
                                {...register('nombreMáquina')}
                                value={selectedMachine}
                                onChange={(e) => {
                                    setSelectedMachine(e.target.value);
                                    setValue('nombreMáquina', e.target.value);
                                }}
                                label="Nombre de la Máquina"
                            >
                                {maquinas.map(machine => (
                                    <MenuItem key={machine} value={machine}>{machine}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
