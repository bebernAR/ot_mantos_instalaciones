import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Grid2, Card, Button, Select, MenuItem, InputLabel, FormControl, Typography,
  TextField, Alert, Link
} from '@mui/material';
import axios from 'axios';
import { db, auth } from '../firebase/firebase-config'
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Message } from '@mui/icons-material';

const DetalleOrdenPorduccion = () => {
  const { numeroOrden } = useParams();  // Número de orden desde la URL
  const location = useLocation();
  const folioSai = location.state?.folioSai
  const [planesTrabajo, setPlanesTrabajo] = useState([]);
  const [ordenTrabajo, setOrdenTrabajo] = useState({ fecha_creacion: "" });
  const [reservas, setReservas] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [operadorSeleccionado, setOperadorSeleccionado] = useState({ tecnico_asignado: '', correo_tecnico_asignado: '' });
  const [operadorApoyoSeleccionado, setOperadorApoyoSeleccionado] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState("");
  const [titulo, setTitulo] = useState("");  // Título de la orden
  const [prioridad, setPrioridad] = useState("");  // Prioridad
  const [statusInicial, setStatusInicial] = useState("");
  const [fechaEstimada, setFechaEstimada] = useState("");  // Fecha estimada
  const [tiempoTotal, setTiempoTotal] = useState(0);  // Tiempo acumulado
  const [serialNum, setSerialNum] = useState("");  // Número de serie
  const [custom, setCustom] = useState([]);
  const navigate = useNavigate();

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
    fetchUsuarios();
  }, [numeroOrden]);

  // Obtener usuarios de Firestore
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

  // Manejar la asignación de la orden y mostrar datos en consola
  const handleAsignarOrden = async () => {
    const datosOrden = {
      titulo: `Ensamble ${planesTrabajo[0]?.maquina} #${folioSai}`, 
      prioridad,
      fechaEstimada,
      reservaId: 0,
      ordenNumero: numeroOrden,
      tiempoTotal,
      creadoPor: ordenTrabajo.nombre_persona,
      familia: planesTrabajo[0]?.familia || "Sin familia",
      maquina: planesTrabajo[0]?.maquina || "Sin máquina",
      razon_social: '',
      username: '',
      email: '',
      contacto: '',
      correo_cliente: '',
      modelo: '',
      no_serie: '',
      tecnico_asignado: operadorSeleccionado.tecnico_asignado,
      correo_tecnico_asignado: operadorSeleccionado.correo_tecnico_asignado,
      operador_apoyo: operadorApoyoSeleccionado.tecnico_asignado,
      folio_sai: folioSai,
      status_inicial: statusInicial,
      numero_serie: serialNum,
      customizacion: custom
    };

    console.log("Datos para enviar a la API:", datosOrden);

    try {
      const response = await axios.post('https://teknia.app/api/orden_agendada', datosOrden);
      const idOrdenAgendada = response.data.id;
      const actividadesConId = planesTrabajo.map((plan) => ({
        id_orden_agendada: idOrdenAgendada,
        posicion: plan.posicion,
        codigo: plan.codigo,
        titulo: plan.titulo,
        objetivo: plan.objetivo,
        clasificacion: plan.clasificacion,
        tiempo_estimado: plan.tiempo_estimado,
        finalizado: false, // Siempre falso al crear

        
      }));
      const notif = {
        correoTecnico: operadorSeleccionado.correo_tecnico_asignado,
        ordenNumero: folioSai
      }
      await mandarNotificacion(notif)
      await postActividades(actividadesConId);
      alert("Orden y actividades guardadas correctamente.");
      navigate('/plantel_produccion');
  

    } catch (error) {
      console.error("Error al enviar los datos a la API:", error);
    }
  };

  const isButtonDisabled =  !statusInicial || !prioridad || !operadorSeleccionado || !fechaEstimada;

  const formatearFecha = (fecha) =>
    new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(fecha));
  const handleInputChange = (e) => {
    const selectedOperador = operadores.find(
      (operador) => operador.correo === e.target.value
    );
    setOperadorSeleccionado({
      tecnico_asignado: selectedOperador.nombre,
      correo_tecnico_asignado: selectedOperador.correo
    });


  }

  const mandarNotificacion = async (notif)  => {
    try{
      const response = await axios.post('https://desarrollotecnologicoar.com/api5/enviarNotificacion/', notif);
      console.log('Notificación enviada con éxito!')
    } catch (error){
      console.error("Error al enviar las actividades: ", error);
    }
  }

  const postActividades = async (actividades) => {
    try {
      const response = await axios.post('https://teknia.app/api3/nueva_actividad_realizada', actividades);
      console.log("Actividades enviadas con éxito:", response.data);
    } catch (error) {
      console.error("Error al enviar las actividades:", error);
      alert("No se pudieron guardar las actividades.");
    }
  };
  



  return (
    <>
      <Grid2 size={{ xs: 12, md: 8 }} style={{ padding: 10 }}>
        <Card>
          <Grid2 container spacing={2}>
            <Grid2 xs={1}><strong>Orden #:</strong></Grid2>
            <Grid2 xs={11}>{planesTrabajo[0]?.numero_orden}</Grid2>

            <Grid2 xs={1}><strong>Numero orden SAI:</strong></Grid2>
            <Grid2 xs={11}>{folioSai}</Grid2>

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
        <Typography variant= 'h4' gutterBottom align = 'center'>
           Ensamble {planesTrabajo[0]?.maquina} #{folioSai}
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-estado-label">Estatus inicial</InputLabel>
          <Select
            labelId="select-estado-label"
            value={statusInicial}
            onChange={(e) => setStatusInicial(e.target.value)}
            label="Status Inicial"
          >
            <MenuItem value="Equipo Nuevo">Equipo Nuevo</MenuItem>
            <MenuItem value="Equipo Remanufacturado">Equipo Remanufacturado</MenuItem>
          </Select>
        </FormControl>


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
          <InputLabel id="select-operador-label">Asignar a un operador</InputLabel>
          <Select
            labelId="select-operador-label"
            value={operadorSeleccionado.correo_tecnico_asignado} // Muestra el valor actual (correo)
            onChange={(e) => {
              const selectedOperador = operadores.find(
                (operador) => operador.correo === e.target.value
              );
              setOperadorSeleccionado({
                tecnico_asignado: selectedOperador.nombre,
                correo_tecnico_asignado: selectedOperador.correo,
              });
            }}
            label="Asignar a un operador."
          >
            {operadores.map((operador) => (
              <MenuItem key={operador.correo} value={operador.correo}>
                {`${operador.nombre}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-operador-apoyo-label">Asignar a un operador de apoyo</InputLabel>
          <Select
            labelId="select-operador-apoyo-label"
            value={operadorApoyoSeleccionado}
            onChange={(e) => setOperadorApoyoSeleccionado(e.target.value)}
            label="Asignar a un operador de apoyo"
          >
            {operadores.map((operador) => (
              <MenuItem key={operador.correo} value={operador.nombre}>
                {operador.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            id="input-serialnum"
            value={serialNum}
            onChange={(e) => setSerialNum(e.target.value)}
            label="Número de serie"
            variant='outlined'
          ></TextField>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-custom-label">Asigna una customización</InputLabel>
          <Select
            multiple
            labelId="select-custom-label"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            label="Asignar a un operador de apoyo"
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


        <Button
          variant="contained"
          color="primary"
          disabled={isButtonDisabled}
          onClick={handleAsignarOrden}
        >
          Asignar Orden

        </Button>
        <Link component="button" variant="body2" onClick={() => { navigate('/tabla_operadores') }}>   ¿No aparece el operador necesario? Pulsa aquí</Link>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 8 }} sx={{ mt: 2 }} style={{ padding: 10 }}>
        <Typography variant="h6" align="center">
          Tiempo Total Estimado : {tiempoTotal + ' min'}
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

export default DetalleOrdenPorduccion;
