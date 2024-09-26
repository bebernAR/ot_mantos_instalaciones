import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography, Box } from '@mui/material';
import { Build, Visibility, Done, CleaningServices, SwapHoriz, EngineeringOutlined } from '@mui/icons-material'; 
import { useTheme } from '@mui/material/styles'; // Importar useTheme para acceder al tema actual

const ItemType = 'ACTIVITY';

// Función que retorna un icono basado en la clasificación
const getIconByClassification = (classification) => {
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

// Componente de actividad arrastrable
const Activity = ({ activity, index, moveActivity, origin, removeActivity }) => {
  const theme = useTheme(); // Accede al tema actual
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemType,
    item: { index, origin },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
//ESTILOS PARA LA LISTA DRAGEABLE DE LAS ACTIVIDADES 
  return (
    <div
      ref={dragRef}
      style={{
        padding: '15px',
        margin: '8px 0',
        backgroundColor: isDragging ? '#f0f0f0' : theme.palette.mode === 'dark' ? '#333' : '#fff',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',  // Cambia el color del texto según el tema
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        cursor: 'grab',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <strong>{activity.codigo + " - "}</strong>
      {activity.titulo}
      {getIconByClassification(activity.clasificacion)}
    </div>
  );
};

// Zona de caída de técnicos
const TecnicoDropZone = ({ tecnico, moveActivity, removeActivity }) => {
  const theme = useTheme(); // Accede al tema actual
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemType,
    drop: (item) => moveActivity(item.index, tecnico.id, item.origin),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={dropRef}
      style={{
        padding: '20px',
        backgroundColor: isOver ? '#e3f2fd' : theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9',
        minHeight: '300px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease',
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
        {tecnico.nombre_tecnico}
      </Typography>

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
          boxShadow: '0 4px 8px rgba(25, 118, 210, 0.4)',
        }}
        onClick={() => null}
      >
        Guardar
      </Button>

      <div
        style={{
          marginTop: '20px',
          maxHeight: tecnico.items.length > 3 ? '200px' : 'auto',  // Limita la altura del contenedor de actividades
          overflowY: tecnico.items.length > 3 ? 'auto' : 'hidden', // Scroll solo si hay más de 3 actividades
          paddingRight: '10px', // Añadir espacio para el scrollbar
        }}
      >
        {tecnico.items && tecnico.items.length > 0 ? (
          tecnico.items.map((item, index) => (
            <Activity
              key={item.id}
              activity={item}
              index={index}
              moveActivity={moveActivity}
              origin={tecnico.id}
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
            No hay actividades asignadas.
          </Typography>
        )}
      </div>
    </div>
  );
};

// Componente principal
const Tecnicos = () => {
  const [activities, setActivities] = useState([]);  // Actividades obtenidas de la API
  const [tecnicos, setTecnicos] = useState([]);  // Técnicos obtenidos de la API
  const [selectedTecnico, setSelectedTecnico] = useState('');  // Técnico seleccionado
  const [tecnicoAsignado, setTecnicoAsignado] = useState(null);
  
  const theme = useTheme();  // Técnico asignado con actividades

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('https://teknia.app/api3/obtener_actividades_mantto');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error al obtener las actividades:', error);
      }
    };

    const fetchTecnicos = async () => {
      try {
        const response = await fetch('https://teknia.app/api4/bonos_istp/tecnicos_status/Activo');
        const data = await response.json();
        setTecnicos(data);
      } catch (error) {
        console.error('Error al obtener los técnicos:', error);
      }
    };

    fetchActivities();
    fetchTecnicos();
  }, []);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '30%' }}>
          <FormControl fullWidth>
            <InputLabel>Técnico</InputLabel>
            <Select
              value={selectedTecnico}
              onChange={handleTecnicoChange}
              label="Técnico"
              style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }} // Cambia el color del texto en el selector
            >
              {tecnicos.map((tecnico) => (
                <MenuItem key={tecnico.id} value={tecnico.id}>
                  {tecnico.nombre_tecnico}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '10px', padding: '10px', backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff' }}>
            <h3 style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' ,overflowY: 'scroll !important',  }}>Actividades</h3>
            
            {activities.map((activity, index) => (
              <Activity
                key={activity.id}
                activity={activity}
                index={index}
                moveActivity={moveActivity}
                origin="activities"
              />
            ))}

          </div>
        </div>

        <div 
        style={{
          width: '65%',
        }}>
          {tecnicoAsignado && (
            <TecnicoDropZone
              tecnico={tecnicoAsignado}
              moveActivity={moveActivity}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default Tecnicos;
