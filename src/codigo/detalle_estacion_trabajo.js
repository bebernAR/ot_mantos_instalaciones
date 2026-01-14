import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Typography, Container, Box, Grid, Card, CardContent, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, TextField, Select, MenuItem, Link, LinearProgress,
    DialogContentText, FormControl, InputLabel, List, ListItem,
    ListItemText
} from '@mui/material';
import { db, auth } from '../firebase/firebase-config'
import { collection, getDocs } from 'firebase/firestore';
import { useTheme } from '@emotion/react';


function DetallesEstacion() {
    const { id } = useParams();
    const [Orden, setOrden] = useState([]);
    const [Actividades, setActividades] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [formData, setFormData] = useState({
        titulo: Orden.titulo,
        prioridad: Orden.prioridad,
        tecnico_asignado: Orden.tecnico_asignado,
        correo_tecnico_asignado: Orden.tecnico_asignado,
        fecha_estimada: Orden.fecha_estimada,
        operador_secundario: Orden.operador_secundario,
        numero_serie: Orden.numero_serie,
        customizacion: Orden.customizacion
    })
    const [openEraseDialog, setOpenEraseDialog] = useState(false);
    const [operadores, setOperadores] = useState([]);
    const [operadorSeleccionado, setOperadorSeleccionado] = useState({ tecnico_asignado: '', correo_tecnico_asignado: '' });
    const [operadorApoyoSeleccionado, setOperadorApoyoSeleccionado] = useState('');
    const theme = useTheme();


    const navigate = useNavigate();
    useEffect(() => {
        const fetchOrdenTrabajo = async () => {
            try {
                const response = await axios.get(`https://teknia.app/api3/obtener_orden_trabajo_agendadas/${id}`);
                const response_actividades = await axios.get(`https://teknia.app/api3/obtener_actividades_realizadas/${id}`);
                setOrden(response.data);
                setActividades(response_actividades.data); // Asegúrate de acceder a `.data` para guardar los datos correctamente
            } catch (error) {
                console.error(`Error al cargar datos: ${error}`);
            }
        };

        fetchOrdenTrabajo();
    }, [id]); // Agrega `id` como dependencia porque lo usas en la URL
    // Abrir y cerrar modal de edición y eliminación
    const handleOpenEditDialog = () => setOpenEditDialog(true);
    const handleCloseEditDialog = () => setOpenEditDialog(false);

    const handleOpenEraseDialog = () => setOpenEraseDialog(true);
    const handleCloseEraseDialog = () => setOpenEraseDialog(false);

    // Actualizar datos de formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    // Mandar datos editados a la API
    const GuardarCambios = async () => {
        // Rellena campos vacíos con los valores originales
        const datosActualizados = {
            titulo: formData.titulo || Orden.titulo,
            prioridad: formData.prioridad || Orden.prioridad,
            tecnico_asignado: formData.tecnico_asignado || Orden.tecnico_asignado,
            correo_tecnico_asignado: formData.correo_tecnico_asignado || Orden.correo_tecnico_asignado,
            fecha_estimada: formData.fecha_estimada || Orden.fecha_estimada,
            operador_secundario: formData.operador_secundario || Orden.operador_secundario,
            numero_serie: formData.numero_serie || Orden.numero_serie,
            customizacion: formData.customizacion || Orden.customizacion
        };

        const match = datosActualizados.titulo.match(/#(\d+)/);
        if (match) {
            datosActualizados.folio_sai = match[1];
        }   

        console.log('Datos a enviar:', datosActualizados);

        try {
            await axios.put(`https://teknia.app/api3/actualizar_orden_agendada/${id}`, datosActualizados);
            alert('¡Orden actualizada satisfactoriamente! :)  número de folio sai: ' + datosActualizados.folio_sai);
            setOrden((prev) => ({ ...prev, ...datosActualizados }));
            handleCloseEditDialog();
        } catch (error) {
            console.error('Error al actualizar la orden:', error);
            alert('No se pudo actualizar la orden:', error);
        }
    };


    const BorrarOrden = async () => {
        try {
            await axios.delete(`https://teknia.app/api3/eliminar_orden_trabajo_agendada/${id}`);
            alert('¡Orden eliminada satisfactoriamente! :S');
            handleCloseEditDialog();
            setTimeout(function () {
                navigate('/plantel_produccion')
            }, 1000)

        } catch (error) {
            console.error('Error al eliminar la orden:', error);
            alert('No se pudo eliminar la orden:', error);
        }
    }
    // Traer los usuarios de firebase para los desplegables
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'operadores'));
                const usuariosData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOperadores(usuariosData);
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
            }
        };

        fetchUsuarios();
    }, []);




    // Función para mostrar o no si es que hay operador secundario
    const OperadorSecundario = () => {
        if (Orden.OperadorSecundario) {
            return (
                <Typography variant="h6" gutterBottom textAlign={'center'}>
                    Modelo: {Orden.operador_secundario}
                </Typography>
            );
        }
    };
    // Función para hacer la fecha más legible
    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        return new Intl.DateTimeFormat('es-ES', {
            hour: 'numeric',
            minute: 'numeric',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(fecha));
    };

    // Función para cambiar el color del status y la prioridad
    const obtenerColorEstatus = (estatus) => {
        switch (estatus) {
            case 'En progreso':
                return 'orange';
            case 'Completado':
                return 'green';
            case 'Pendiente':
                return 'red';
            default:
                return 'gray';
        }
    };

    const obtenerColorPrioridad = (prioridad) => {
        switch (prioridad) {
            case 'Alta':
                return 'red';
            case 'Media':
                return 'orange';
            case 'Baja':
                return 'green';
            default:
                return 'gray';
        }
    };


    const StatusOrNot = (actividad) => {
        if (actividad.started_at != null && actividad.finished_at != null) {
            return `Actividad iniciada el ${formatearFecha(actividad.started_at)} y finalizada el ${formatearFecha(actividad.finished_at)}`
        } else if (actividad.started_at != null && actividad.finished_at == null) {
            return `Actividad iniciada el ${actividad.started_at} y está en proceso`
        } else {
            return 'Actividad pendiente'
        }
    }

    const isFinished = (actividad) => {
        if (actividad.finalizado == false) {
            return 'En progreso'
        } else {
            return 'Completado'
        }
    }



    if (!Orden || Object.keys(Orden).length === 0) {
        return <Typography textAlign={'center'}>Cargando datos...</Typography>;
    }
    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Box textAlign="center" mb={4}>

            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Información general
                    </Typography>
                    <Card sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>

                        <Typography variant="body1" gutterBottom>
                            <strong>Título:</strong> {Orden.titulo || 'N/A'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Folio de SAI:</strong> {Orden.folio_sai || <Typography component="span" style={{ color: 'red' }}>SIN FOLIO SAI</Typography>}
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ color: obtenerColorPrioridad(Orden.prioridad), fontWeight: 'bold' }}>
                            <strong>Prioridad:</strong> {Orden.prioridad || 'N/A'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Técnico asignado:</strong> {Orden.tecnico_asignado || 'N/A'}
                        </Typography>
                        {OperadorSecundario()}
                        <Typography variant="body1" gutterBottom>
                            <strong>Fecha estimada:</strong> {formatearFecha(Orden.fecha_estimada)}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Familia:</strong> {Orden.familia || 'N/A'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Modelo:</strong> {Orden.maquina || 'N/A'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Creado el:</strong> {formatearFecha(Orden.created_at)}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Última actualización:</strong> {formatearFecha(Orden.updated_at)}
                        </Typography>
                        <Typography
                            variant="body1"
                            gutterBottom
                            sx={{ color: obtenerColorEstatus(Orden.estatus), fontWeight: 'bold' }}
                        >
                            <strong>Estatus de máquina:</strong> {Orden.estatus || 'N/A'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Avance:</strong> {Orden.avance != null ? Orden.avance.toFixed() + '%' : '0%'}
                        </Typography>

                        <Typography variant="body1" gutterBottom>
                            <strong>Número de serie:</strong> {Orden.numero_serie || 'N/A'} 
                        </Typography>

                        <Typography variant="body1" gutterBottom>
                            <strong>Customización:</strong> {Orden.customizacion || 'Sin customización'}   
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={handleOpenEditDialog}
                        >
                            Editar información
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={handleOpenEraseDialog}
                        >
                            Eliminar orden
                        </Button>
                    </Card>
                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                        <DialogTitle>Editar Información de la Orden</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Título"
                                name="titulo"
                                fullWidth
                                value={formData.titulo}
                                onChange={handleInputChange}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Número de serie"
                                name="numero_serie"
                                fullWidth
                                value={formData.numero_serie}
                                onChange={handleInputChange}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="select-custom-label">Customizacion</InputLabel>
                                <Select
                                    labelId="select-custom-label"
                                    name="customizacion" // Necesario para identificar el campo en el estado
                                    value={formData.customizacion}
                                    onChange={handleInputChange}
                                    label="Customización"
                                >
                                    <MenuItem value="Desmontar Press Roller Shop">Desmontar Press Roller Shop</MenuItem>
                                    <MenuItem value="Press Roller Works">Press Roller Works</MenuItem>
                                    <MenuItem value="Motor spindle 8/9hp HSD Shop">Motor spindle 8/9hp HSD Shop</MenuItem>
                                    <MenuItem value="Motor spindle semi-auto 7hp (misil)">Motor spindle semi-auto 7hp (misil)</MenuItem>
                                    <MenuItem value="Sistema rotativo de mesa (Router)">Sistema rotativo de mesa (Router)</MenuItem>
                                    <MenuItem value="FB X0/X3 bifásica a trifásica">FB X0/X3 bifásica a trifásica</MenuItem>
                                    <MenuItem value="Acc. Rotativo Chuck (Creator)">Acc. Rotativo Chuck (Creator)</MenuItem>
                                    <MenuItem value="Acc. Rotativo Rodillos (Creator)">Acc. Rotativo Rodillos (Creator)</MenuItem>
                                    <MenuItem value="Aumento Creator 100W a 130W">Aumento Creator 100W a 130W</MenuItem>
                                    <MenuItem value="Doble Bomba">Doble Bomba</MenuItem>
                                    <MenuItem value="Aumento FiberGraver 30 a 50W">Aumento FiberGraver 30 a 50W</MenuItem>
                                    <MenuItem value="Incremento tamaño 1 mesa">Incremento tamaño 1 mesa</MenuItem>
                                    <MenuItem value="Incremento tamaño doble mesa">Incremento tamaño doble mesa</MenuItem>
                                    <MenuItem value="Sistema de lubricacion">Sistema de lubricacion</MenuItem>
                                    <MenuItem value="Cambio de modulo">Cambio de modulo</MenuItem>
                                    <MenuItem value="Sistema Rodillos Router">Sistema Rodillos Router</MenuItem>
                                    <MenuItem value="Cambio de Servos a Steppers">Cambio de Servos a Steppers</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="select-prioridad-label">Prioridad</InputLabel>
                                <Select
                                    labelId="select-prioridad-label"
                                    name="prioridad" // Necesario para identificar el campo en el estado
                                    value={formData.prioridad}
                                    onChange={handleInputChange}
                                    label="Prioridad"
                                >
                                    <MenuItem value="Alta">Alta</MenuItem>
                                    <MenuItem value="Media">Media</MenuItem>
                                    <MenuItem value="Baja">Baja</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="select-tecnico-label">Técnico Asignado</InputLabel>
                                <Select
                                    labelId="select-tecnico-label"
                                    name="tecnico_asignado"
                                    value={formData.tecnico_asignado}
                                    onChange={(e) => {
                                        const selectedOperador = operadores.find(
                                            (operador) => operador.nombre === e.target.value
                                        );
                                        setFormData({
                                            ...formData,
                                            tecnico_asignado: selectedOperador.nombre,
                                            correo_tecnico_asignado: selectedOperador.correo,
                                        });
                                    }}
                                    label="Técnico Asignado"
                                >
                                    {operadores.map((operador) => (
                                        <MenuItem key={operador.id} value={operador.nombre}>
                                            {operador.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Fecha Estimada"
                                name="fecha_estimada"
                                type="date"
                                fullWidth
                                value={formData.fecha_estimada}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="select-operador-apoyo-label">Operador Secundario</InputLabel>
                                <Select
                                    labelId="select-operador-apoyo-label"
                                    name="operador_secundario"
                                    value={formData.operador_secundario}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            operador_secundario: e.target.value,
                                        });
                                    }}
                                    label="Operador Secundario"
                                >
                                    {operadores.map((operador) => (
                                        <MenuItem key={operador.id} value={operador.nombre}>
                                            {operador.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEditDialog} color="secondary">
                                Cancelar
                            </Button>
                            <Button onClick={GuardarCambios} color="primary">
                                Guardar Cambios
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openEraseDialog} onClose={handleCloseEraseDialog}>
                        <DialogTitle>¿Estás seguro que deseas borrar la orden?</DialogTitle>
                        <DialogContentText textAlign={'center'}>Esta acción no se podrá deshacer...</DialogContentText>

                        <DialogActions>
                            <Button onClick={handleCloseEraseDialog} color="secondary">
                                Cancelar
                            </Button>
                            <Button onClick={BorrarOrden} color="error">
                                Borrar orden
                            </Button>
                        </DialogActions>


                    </Dialog>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Listado de actividades
                    </Typography>
                    <List
                        sx={{
                            width: '100%',
                            maxWidth: '100%', // Ajusta el ancho máximo
                            bgcolor: theme.palette.background.paper, // Cambia el fondo según el tema
                            alignItems: 'center',
                        }}
                    >
                        {Array.isArray(Actividades) && Actividades.length > 0 ? (
                            Actividades.sort((a, b) => a.id - b.id).map((actividad) => (
                                <ListItem
                                    key={actividad.id}
                                    disableGutters
                                    sx={{
                                        width: '90%',
                                        margin: '10px auto',
                                        boxShadow: theme.palette.mode === 'dark' ? 3 : 1, // Sombra más pronunciada en modo oscuro
                                        padding: '10px 15px',
                                        borderRadius: 2,
                                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'white', // Fondo oscuro o claro
                                        color: theme.palette.mode === 'dark' ? 'white' : 'black', // Texto claro en modo oscuro
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%',
                                        }}
                                    >
                                        <ListItemText
                                            primary={actividad.titulo}
                                            secondary={StatusOrNot(actividad)}
                                            sx={{
                                                wordWrap: 'break-word',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'normal',
                                                color: theme.palette.text.primary, // Usa el color de texto principal del tema
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                color: obtenerColorEstatus(isFinished(actividad)),
                                                textAlign: 'right',
                                                marginLeft: '15px',
                                            }}
                                        >
                                            {isFinished(actividad)}
                                        </Typography>
                                    </Box>
                                </ListItem>
                            ))
                        ) : (
                            <Typography textAlign="center">No hay actividades disponibles</Typography>
                        )}
                    </List>



                </Grid>

            </Grid>


        </Container>



    );
}
export default DetallesEstacion;