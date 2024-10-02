import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography } from '@mui/material';
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

  const handleGuardar = () => {
    const actividadConDetalles = {
      ...activity,
      tecnico: tecnicoAsignado?.nombre_tecnico || "Ningún técnico seleccionado",
      maquina: maquinaSeleccionada || "Ninguna máquina seleccionada",
    };

    console.log("Actividad guardada con detalles de técnico y máquina:", actividadConDetalles);
  };

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

const TecnicoDropZone = ({ tecnico, moveActivity, removeActivity }) => {
  const theme = useTheme();
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
        onClick={() => console.log("Actividades guardadas: ", tecnico.items)}
      >
        Guardar
      </Button>

      <div
        style={{
          marginTop: '20px',
          maxHeight: tecnico.items && tecnico.items.length > 3 ? '200px' : 'auto',
          overflowY: tecnico.items && tecnico.items.length > 3 ? 'auto' : 'hidden',
          paddingRight: '10px',
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

const Tecnicos = () => {
  const [activities, setActivities] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [tecnicoAsignado, setTecnicoAsignado] = useState(null);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [maquinas, setMaquinas] = useState([]);
  const [actividadesMaquina, setActividadesMaquina] = useState([]);

  const theme = useTheme();

  // Fetch de técnicos
  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const response = await fetch('https://teknia.app/api4/bonos_istp/tecnicos_status/Activo');
        const data = await response.json();
        setTecnicos(data);
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

  // Filtrar actividades para la máquina seleccionada
  useEffect(() => {
    if (tecnicoAsignado?.maquina) {
      const fetchActividadesMaquina = async () => {
        const maquinaSeleccionada = tecnicoAsignado.maquina;
        const maquina = maquinas.find(m => m.maquina === maquinaSeleccionada);

        if (maquina && maquina.actividades) {
          setActivities(maquina.actividades);
        } else {
          setActivities([]);
        }
      };

      fetchActividadesMaquina();
    }
  }, [tecnicoAsignado?.maquina, maquinas]);

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
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '30%' }}>
          <div style={{ padding: "5px" }}>
            <FormControl fullWidth>
              <InputLabel>Técnico</InputLabel>
              <Select
                value={selectedTecnico}
                onChange={handleTecnicoChange}
                label="Técnico"
                style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}
              >
                {tecnicos.map((tecnico) => (
                  <MenuItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre_tecnico}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
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
          </div>

          {familiaSeleccionada && (
            <div style={{ padding: "5px" }}>
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
    </DndProvider>
  );
};

export default Tecnicos;
