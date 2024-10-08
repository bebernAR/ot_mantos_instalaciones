import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Build, Visibility, Done, CleaningServices, SwapHoriz, EngineeringOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ItemType = 'ACTIVITY';
const getIconByClassification = (classification) => {
  if (!classification) {
    return <Done style={{ marginRight: '8px', color: '#9e9e9e' }} />; // Valor predeterminado si no hay clasificación
  }

  switch (classification.trim()) {
    case 'Inspección':
      return <Visibility style={{ marginRight: '8px', color: '#1976d2' }} />;
    case 'Limpieza':
      return <CleaningServices style={{ marginRight: '8px', color: '#43a047' }} />;
    case 'Ajuste':
      return <SwapHoriz style={{ marginRight: '8px', color: '#ffb300' }} />;
    case 'Remplazo Definitivo':
      return <Build style={{ marginRight: '8px', color: '#757575' }} />;
    case 'Instalación':
      return <EngineeringOutlined style={{ marginRight: '8px', color: '#ef6c00' }} />;
    default:
      return <Done style={{ marginRight: '8px', color: '#9e9e9e' }} />;
  }
};

// Componente para renderizar una actividad
const Activity = ({ activity, index, moveActivity, origin, removeActivity, tecnicoAsignado, maquinaSeleccionada }) => {
  const theme = useTheme();
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemType,
    item: { index, origin },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: ItemType,
    hover(draggedItem) {
      if (draggedItem.index !== index && draggedItem.origin === origin) {
        moveActivity(draggedItem.index, index, origin);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      style={{
        padding: '15px',
        margin: '8px 0',
        backgroundColor: isDragging ? '#f0f0f0' : theme.palette.mode === 'dark' ? '#333' : '#f9f9f9',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        maxHeight: '300px',
        overflowY: 'auto',
        cursor: 'grab',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <strong>{activity.id} - {activity.actividad}</strong>
      {getIconByClassification(activity.clasificacion)}
      {origin !== 'activities' && (
        <span
          onClick={() => removeActivity(index, origin)}
          style={{
            position: 'absolute',
            top: '5px',
            right: '10px',
            cursor: 'pointer',
            color: 'red',
            fontSize: '14px',
          }}
        >
          ✖
        </span>
      )}
    </div>
  );
};

const TecnicoDropZone = ({ tecnico, moveActivity, removeActivity, workOrders }) => {
  const theme = useTheme();

  return (
    <div
      ref={null} // No es necesario usar `dropRef` si no se arrastran elementos aquí
      style={{
        padding: '20px',
        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9',
        minHeight: '300px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      <Typography
        variant="h5"
        component="h3"
        style={{
          color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
          marginBottom: '20px'
        }}
      >
        {tecnico?.nombre_tecnico || "Orden de Servicio"}
      </Typography>

      <div
        style={{
          marginTop: '20px',
          maxHeight: '200px',
          overflowY: 'auto',
          paddingRight: '10px',
        }}
      >
        {workOrders && workOrders.length > 0 ? (
          workOrders.map((order) => (
            <div key={order.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
              <Typography variant="body1">
                {`Paso No.${order.numero_orden} - ${order.tipo_servicio} (${order.maquina})`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {`Estado: ${order.estado}, Versión: ${order.version}`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {`Fecha de creación: ${new Date(order.fecha_creacion).toLocaleDateString()}`}
              </Typography>
            </div>
          ))
        ) : (
          <Typography
            variant="body1"
            style={{
              textAlign: 'center',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              marginTop: '20px',
            }}
          >
            No hay órdenes de trabajo asignadas.
          </Typography>
        )}
      </div>
    </div>
  );
};

const Tecnicos = () => {
  const [activities, setActivities] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [tecnicoAsignado, setTecnicoAsignado] = useState(null);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [maquinas, setMaquinas] = useState([]);
  const [actividadesMaquina, setActividadesMaquina] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reservas, setReservas] = useState([]);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [tipoServicio, setTipoServicio] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [workOrders, setWorkOrders] = useState([]); // Almacena las órdenes de trabajo obtenidas

  const theme = useTheme();

  // Fetch de técnicos
  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const response = await fetch('https://teknia.app/api4/bonos_istp/tecnicos_status/Activo');
        const data = await response.json();
        setTecnicos(data);

        const response1 = await fetch('https://teknia.app/api/reservas_agendadas/');
        const data1 = await response1.json();
        setReservas(data1);
      } catch (error) {
        console.error('Error al obtener los técnicos:', error);
      }
    };

    fetchTecnicos();
  }, []);

  // Fetch de máquinas según la familia seleccionada
  useEffect(() => {
    if (familiaSeleccionada) {
      const fetchMaquinas = async () => {
        try {
          const response = await fetch(`https://teknia.app/api3/actividades_tecnicas/maquinas_actividades/${familiaSeleccionada}`);
          const data = await response.json();
          setMaquinas(data);
        } catch (error) {
          console.error('Error al obtener las máquinas:', error);
        }
      };

      fetchMaquinas();
    }
  }, [familiaSeleccionada]);

  // Fetch de órdenes de trabajo basadas en familia, máquina y tipo de servicio
  useEffect(() => {
    if (familiaSeleccionada && tecnicoAsignado?.maquina && tipoServicio) {
      const fetchWorkOrders = async () => {
        try {
          const response = await fetch(
            `https://teknia.app/api3/obtener_planes_trabajo/${familiaSeleccionada}/${tecnicoAsignado.maquina}/${tipoServicio}`
          );
          const data = await response.json();
          setWorkOrders(data); // Almacena las órdenes de trabajo en el estado
        } catch (error) {
          console.error('Error al obtener las órdenes de trabajo:', error);
        }
      };

      fetchWorkOrders();
    }
  }, [familiaSeleccionada, tecnicoAsignado?.maquina, tipoServicio]);

  const moveActivity = (index, destinationId, originId) => {
    const activity = originId === 'activities' ? activities[index] : tecnicoAsignado.items[index];

    if (!tecnicoAsignado.items.some((item) => item.id === activity.id)) {
      setTecnicoAsignado((prev) => ({
        ...prev,
        items: [...prev.items, activity],
      }));
    }
  };

  const removeActivity = (index, originId) => {
    if (originId !== 'activities') {
      setTecnicoAsignado((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleTecnicoChange = (event) => {
    const tecnico = tecnicos.find(t => t.id === event.target.value);
    setSelectedTecnico(event.target.value);
    setTecnicoAsignado({ ...tecnico, items: [] });
  };

  const handleGuardar = () => {
    const actividadesActuales = tecnicoAsignado?.items || [];
    const maquinaSeleccionada = tecnicoAsignado?.maquina || "Ninguna máquina seleccionada";
    const tecnicoSeleccionado = tecnicoAsignado?.nombre_tecnico || "Ningún técnico seleccionado";

    const actividadesConDetalles = actividadesActuales.map(actividad => ({
      ...actividad,
      maquina: maquinaSeleccionada,
      tecnico: tecnicoSeleccionado
    }));

    console.log("Actividades con detalles de máquina y técnico:", actividadesConDetalles);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleConfirmar = () => {
    console.log('ID:', selectedId);
    console.log('Ticket:', selectedTicket);
    console.log('Fecha de Inicio:', startDate);
    console.log('Fecha de Fin:', endDate);
    setOpenModal(false);
  };

  const handleTicketChange = (event) => {
    const ticketSeleccionado = event.target.value;
    setSelectedTicket(ticketSeleccionado);

    const reservaSeleccionada = reservas.find((reserva) => reserva.ticket === ticketSeleccionado);
    setSelectedReserva(reservaSeleccionada);

    if (reservaSeleccionada) {
      setTipoServicio(reservaSeleccionada.tipo_servicio);
      setStartDate(reservaSeleccionada.fecha_inicio.substring(0, 10));
      setEndDate(reservaSeleccionada.fecha_final.substring(0, 10));
      setSelectedId(reservaSeleccionada.id);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '30%' }}>
          <div style={{ padding: "5px" }}></div>
          <div style={{ padding: "5px" }}>
            <FormControl fullWidth>
              <InputLabel style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Selecciona una familia</InputLabel>
              <Select
                value={familiaSeleccionada}
                onChange={(e) => setFamiliaSeleccionada(e.target.value)}
                label="Selecciona una familia"
                style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}
              >
                {['Router', 'Láser Co2', 'Láser Fibra Óptica', 'Plasma', 'Dobladora', 'Grua Neumática', 'Externa'].map((familia) => (
                  <MenuItem key={familia} value={familia}>
                    {familia}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {familiaSeleccionada && (
              <div style={{ padding: "0px", alignItems: 'end' }}>
                <FormControl fullWidth>
                  <InputLabel style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Selecciona una máquina</InputLabel>
                  <Select
                    value={tecnicoAsignado?.maquina || ''}
                    onChange={(e) => setTecnicoAsignado((prev) => ({ ...prev, maquina: e.target.value }))}
                    label="Selecciona una máquina"
                    style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}
                  >
                    {maquinas.map((maquina) => (
                      <MenuItem key={maquina.maquina} value={maquina.maquina}>
                        {maquina.maquina}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Tipo de Servicio</InputLabel>
              <Select
                value={tipoServicio}
                onChange={(e) => setTipoServicio(e.target.value)}
                label="Tipo de Servicio"
                style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}
              >
                <MenuItem value="Instalación">Instalación</MenuItem>
                <MenuItem value="Capacitación">Capacitación</MenuItem>
                <MenuItem value="Instalación/Capacitación">Instalación/Capacitación</MenuItem>
                <MenuItem value="Mantenimiento Estándar">Mantenimiento Estándar</MenuItem>
                <MenuItem value="Mantenimiento Completo">Mantenimiento Completo</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div style={{
            marginTop: '20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '10px',
            backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <h3 style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Actividades</h3>

            {activities.map((activity, index) => (
              <Activity
                key={activity.id}
                activity={activity}
                index={index}
                moveActivity={moveActivity}
                origin="activities"
                removeActivity={removeActivity}
                tecnicoAsignado={tecnicoAsignado}
                maquinaSeleccionada={tecnicoAsignado?.maquina}
              />
            ))}
          </div>
        </div>

        <div style={{ width: '65%' }}>
          {tecnicoAsignado && (
            <TecnicoDropZone
              tecnico={tecnicoAsignado}
              moveActivity={moveActivity}
              removeActivity={removeActivity}
              workOrders={workOrders}
            />
          )}
        </div>
      </div>

      <Button
        variant="contained"
        color="primary"
        style={{
          marginTop: '20px',
          backgroundColor: theme.palette.mode === 'dark' ? '#1976d2' : '#007bff',
          color: '#fff',
          borderRadius: '20px',
          padding: '10px 20px',
          textTransform: 'none',
        }}
        onClick={handleGuardar}
      >
        Guardar
      </Button>

      {/* Modal para pedir ticket y fechas */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Datos del Ticket</DialogTitle>
        <DialogContent>
          {/* Select para escoger el ticket */}
          <FormControl fullWidth style={{ marginBottom: '20px' }}>
            <InputLabel>Ticket</InputLabel>
            <Select
              value={selectedTicket}
              onChange={handleTicketChange}
              label="Ticket"
            >
              {reservas.map((reserva, index) => (
                <MenuItem key={`${reserva.id}-${index}`} value={reserva.ticket}>
                  {`${reserva.ticket} --- ${reserva.razon_social}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Input para fecha de inicio (se llena automáticamente) */}
          <TextField
            label="Fecha de Inicio"
            type="date"
            fullWidth
            value={startDate}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: '20px' }}
            InputProps={{
              readOnly: true, // Campo de solo lectura
            }}
          />

          {/* Input para fecha de fin (se llena automáticamente) */}
          <TextField
            label="Fecha de Fin"
            type="date"
            fullWidth
            value={endDate}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              readOnly: true, // Campo de solo lectura
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button onClick={handleConfirmar} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};

export default Tecnicos;
