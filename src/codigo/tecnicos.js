import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography, Snackbar, Alert } from '@mui/material';
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
const Activity = ({ activity, index, moveActivity, origin, removeActivity }) => {
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
      <strong>{activity.id} - {activity.titulo} ({activity.maquina})</strong>
      {getIconByClassification(activity.estado)}
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

// Componente para el dropzone del técnico
const TecnicoDropZone = ({ tecnicoAsignado, moveActivity, removeActivity }) => {
  const theme = useTheme();
  const [, dropRef] = useDrop({
    accept: ItemType,
    drop: (item) => {
      moveActivity(item.index, tecnicoAsignado.items.length, item.origin);
    },
  });

  return (
    <div
      ref={dropRef}
      style={{
        padding: '20px',
        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9',
        minHeight: '100%',
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
        Orden de Servicio
      </Typography>

      <div
        style={{
          marginTop: '20px',
          maxHeight: '500px',
          overflowY: 'auto',
          paddingRight: '10px',
        }}
      >
        {tecnicoAsignado.items.length > 0 ? (
          tecnicoAsignado.items.map((order, index) => (
            <Activity
              key={order.id}
              activity={order}
              index={index}
              moveActivity={moveActivity}
              origin="assignedActivities"
              removeActivity={removeActivity}
            />
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
  const [tecnicoAsignado, setTecnicoAsignado] = useState({ items: [] });
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [maquinas, setMaquinas] = useState([]);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState('');
  const [tipoServicio, setTipoServicio] = useState('');
  const [workOrders, setWorkOrders] = useState([]); // Almacena las órdenes de trabajo obtenidas
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mostrar el mensaje de error
  const [openSnackbar, setOpenSnackbar] = useState(false); // Control del Snackbar

  const theme = useTheme();

  // Fetch de máquinas según la familia seleccionada
  useEffect(() => {
    if (familiaSeleccionada) {
      const fetchMaquinas = async () => {
        try {
          const response = await fetch(`https://teknia.app/api3/actividades_tecnicas/maquinas_actividades/${familiaSeleccionada}`);
          const data = await response.json();
          setMaquinas(data); // Guardamos las máquinas relacionadas con la familia seleccionada
        } catch (error) {
          console.error('Error al obtener las máquinas:', error);
        }
      };

      fetchMaquinas();
    }
  }, [familiaSeleccionada]);

  useEffect(() => {
    if (familiaSeleccionada && maquinaSeleccionada && tipoServicio) {
      const fetchWorkOrders = async () => {
        try {
          const response = await fetch(
            `https://teknia.app/api3/obtener_planes_trabajo/${familiaSeleccionada}/${maquinaSeleccionada}/${tipoServicio}`
          );
          const data = await response.json();
          setWorkOrders(data); // Asegúrate de que `data` es un array antes de establecerlo en el estado
        } catch (error) {
          console.error('Error al obtener las órdenes de trabajo:', error);
        }
      };

      fetchWorkOrders();
    }
  }, [familiaSeleccionada, maquinaSeleccionada, tipoServicio]);

  const moveActivity = (sourceIndex, destinationIndex, origin) => {
    if (origin === 'activities') {
      const activity = workOrders[sourceIndex];
      const activityAlreadyExists = tecnicoAsignado.items.some((item) => item.id === activity.id);

      if (!activityAlreadyExists) {
        // Mover de la lista de actividades a la lista asignada
        const updatedActivities = [...tecnicoAsignado.items, activity];
        setTecnicoAsignado({ items: updatedActivities });
      } else {
        // Mostrar el mensaje de error si la actividad ya está agregada
        setErrorMessage(`La actividad ya está agregada a la Orden de Servicio.`);
        setOpenSnackbar(true);
      }
    } else if (origin === 'assignedActivities') {
      // Mover dentro de la lista de asignaciones (reorganización)
      const updatedItems = [...tecnicoAsignado.items];
      const [movedItem] = updatedItems.splice(sourceIndex, 1);
      updatedItems.splice(destinationIndex, 0, movedItem);
      setTecnicoAsignado({ items: updatedItems });
    }
  };

  const removeActivity = (index, origin) => {
    if (origin === 'assignedActivities') {
      // Elimina de las actividades asignadas
      setTecnicoAsignado((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const crearOrdenTrabajo = async () => {
    console.log(tecnicoAsignado.items);
    try {
      const response = await fetch(`https://teknia.app/api3/crear_orden_trabajo`, {
        method: 'POST',  // Método de la solicitud
        headers: {
          'Content-Type': 'application/json',  // Indicamos que estamos enviando JSON
        },
        body: JSON.stringify({
          nombre_persona: 'Developer AR',  // Reemplaza con el valor correspondiente
          correo_persona: 'developer@asiarobotica.com',  // Reemplaza con el valor correspondiente
          version: 1,
          puede_editar: false,
        }),
      });
  
      if (response.ok) {  // Verifica si la respuesta fue exitosa (código 200 o 201)
        const nuevaOrden = await response.json();  // Convertir la respuesta en JSON
        console.log('Orden de trabajo creada:', nuevaOrden);
  
        // Actualiza los planes de trabajo con el ID de la orden creada
        actualizarPlanesTrabajo(nuevaOrden.id);
      } else {
        console.error('Error en la respuesta de crear la orden de trabajo:', response.status);
      }
    } catch (error) {
      console.error('Error al crear la orden de trabajo:', error);
    }
  };

  const actualizarPlanesTrabajo = async (nuevaOrdenId) => {
    
    for (let i = 0; i < tecnicoAsignado.items.length; i++) {
      const plan = tecnicoAsignado.items[i];
  
      try {
        const response = await fetch(`https://teknia.app/api3/actualizar_orden_plan_trabajo/${plan.id}`, {
          method: 'PUT',  // Método de la solicitud
          headers: {
            'Content-Type': 'application/json',  // Indicamos que estamos enviando JSON
          },
          body: JSON.stringify({
            numero_orden: nuevaOrdenId,
            posicion: i + +1
          }),
        });
  
        if (response.status === 200) {
          console.log(`Plan de trabajo ${plan.id} actualizado con éxito`, response.data);
        }
      } catch (error) {
        console.error(`Error al actualizar el plan de trabajo ${plan.id}:`, error);
      }
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
              <>
                <FormControl fullWidth>
                  <InputLabel style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Selecciona una máquina</InputLabel>
                  <Select
                    value={maquinaSeleccionada}
                    onChange={(e) => setMaquinaSeleccionada(e.target.value)}
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
              </>
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

          <div
            style={{
              marginTop: '20px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Actividades</h3>

            {workOrders.map((workOrder, index) => (
              <Activity
                key={workOrder.id}
                activity={workOrder}
                index={index}
                moveActivity={moveActivity}
                origin="activities"
                removeActivity={removeActivity}
              />
            ))}
          </div>
        </div>

        <div style={{ width: '65%' }}>
          <TecnicoDropZone
            tecnicoAsignado={tecnicoAsignado}
            moveActivity={moveActivity}
            removeActivity={removeActivity}
          />
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
        onClick={crearOrdenTrabajo} 
      >
        Guardar
      </Button>

      {/* Snackbar para mostrar el mensaje de error */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </DndProvider>
  );
};

export default Tecnicos;
