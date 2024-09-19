import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography, Box } from '@mui/material';
import { Build, Visibility, Done, CleaningServices, SwapHoriz, EngineeringOutlined } from '@mui/icons-material'; 

const ItemType = 'ACTIVITY';

// Función que retorna un icono basado en la clasificación
const getIconByClassification = (classification) => {
  switch (classification.trim()) {
    case 'Inspección':
      return <Visibility style={{ marginRight: '2px', color: 'black' }} />;
    case 'Limpieza':
      return <CleaningServices style={{ marginRight: '2px', color: '#0e6f27' }} />;
    case 'Ajuste':
      return <SwapHoriz style={{ marginRight: '2px', color: '#73732b' }} />;
    case 'Remplazo Definitivo':
      return <Build style={{ marginRight: '2px', color: 'grey' }} />;
    case 'Instalación':
      return <EngineeringOutlined style={{ marginRight: '2px', color: 'grey'}} />;
    default:
      return <Done style={{ marginRight: '2px', color: '#9e9e9e' }} />;
  }
};

// Componente de actividad arrastrable
const Activity = ({ activity, index, moveActivity, origin, removeActivity }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemType,
    item: { index, origin },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      style={{
        padding: '15px',
        margin: '8px 0',
        backgroundColor: isDragging ? '#f0f0f0' : '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        cursor: 'grab',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {getIconByClassification(activity.clasificacion)}
      <strong>{activity.titulo}</strong>
    
    </div>
  );
};

// Zona de caída de técnicos
const TecnicoDropZone = ({ tecnico, moveActivity, removeActivity }) => {
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
        backgroundColor: isOver ? '#e3f2fd' : '#f9f9f9',
        minHeight: '300px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center',
      }}
    >
      <h3>{tecnico.nombre_tecnico}</h3>
      {tecnico.items && tecnico.items.map((item, index) => (
        <Activity
          key={item.id}
          activity={item}
          index={index}
          moveActivity={moveActivity}
          origin={tecnico.id}
          removeActivity={removeActivity}
        />
      ))}
    </div>
  );
};

// Componente principal
const Tecnicos = () => {
  const [activities, setActivities] = useState([]);  // Actividades obtenidas de la API
  const [tecnicos, setTecnicos] = useState([]);  // Técnicos obtenidos de la API
  const [selectedTecnico, setSelectedTecnico] = useState('');  // Técnico seleccionado
  const [tecnicoAsignado, setTecnicoAsignado] = useState(null);  // Técnico asignado con actividades

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
            >
              {tecnicos.map((tecnico) => (
                <MenuItem key={tecnico.id} value={tecnico.id}>
                  {tecnico.nombre_tecnico}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '10px', padding: '10px' }}>
            <h3>Actividades</h3>
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

        <div style={{ width: '65%' }}>
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
