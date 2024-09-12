import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const ItemType = 'ACTIVITY';

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
        position: 'relative',
        transition: 'background-color 0.2s ease',
        cursor: 'grab',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      }}
    >
      {activity.titulo}
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

const MachineDropZone = ({ machine, moveActivity, handleSave, removeActivity }) => {
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemType,
    drop: (item) => moveActivity(item.index, machine.name, item.origin),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const items = machine.items || [];

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
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease',
        textAlign: 'center',
      }}
    >
      <h3 style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>{machine.name}</h3>
      {items.map((item, index) => (
        <Activity
          key={item.id}
          activity={item}
          index={index}
          moveActivity={moveActivity}
          origin={machine.name}
          removeActivity={removeActivity}
        />
      ))}
      <Button
        variant="contained"
        color="primary"
        style={{
          marginTop: '20px',
          backgroundColor: '#007bff',
          color: '#fff',
          borderRadius: '20px',
          padding: '10px 20px',
          textTransform: 'none',
          boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)',
        }}
        onClick={() => handleSave(machine.name)}
      >
        Guardar
      </Button>
    </div>
  );
};

const Home = () => {
  const [activities, setActivities] = useState([]);
  const [machines, setMachines] = useState({});
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [duplicateActivity, setDuplicateActivity] = useState(null);

  // Familias para el select
  const familias = ['Router', 'Láser Co2', 'Láser Fibra Óptica', 'Plasma', 'Dobladora', 'Grua Neumática', 'Externa'];

  // Hacer la solicitud a la API cuando se seleccione una familia
  useEffect(() => {
    if (familiaSeleccionada) {
      const fetchMachines = async () => {
        try {
          const response = await fetch(`https://teknia.app/api/actividades_tecnicas/maquinas/${familiaSeleccionada}`);
          const data = await response.json();

          // Mostrar los nombres de las máquinas en la consola
          data.forEach((machine) => {
            console.log(machine.maquina);
          });

          // Asegúrate de que las máquinas obtenidas tengan una estructura válida
          const updatedMachines = data.reduce((acc, machine) => {
            acc[machine.maquina] = { name: machine.maquina, items: [] };
            return acc;
          }, {});

          setMachines(updatedMachines);
        } catch (error) {
          console.error('Error al obtener las máquinas:', error);
        }
      };

      fetchMachines();
    }
  }, [familiaSeleccionada]);

  // Hacer la solicitud a la API para obtener actividades
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('https://teknia.app/api3/obtener_actividades_mantto');
        const data = await response.json();
        setActivities(data); // Establecer las actividades obtenidas de la API en el estado
      } catch (error) {
        console.error('Error al obtener las actividades:', error);
      }
    };

    fetchActivities();
  }, []);

  const moveActivity = (index, destinationId, originId) => {
    const activity = originId === 'activities' ? activities[index] : machines[originId].items[index];

    // Verificar si la actividad ya existe en la máquina de destino
    const activityAlreadyExists = machines[destinationId]?.items.some((item) => item.id === activity.id);

    if (!activityAlreadyExists) {
      setMachines((prev) => ({
        ...prev,
        [destinationId]: {
          ...prev[destinationId],
          items: [...(prev[destinationId]?.items || []), activity],
        },
      }));
    } else {
      // Mostrar el modal si la actividad ya está agregada
      setDuplicateActivity(activity);
      setModalOpen(true);
    }
  };

  const removeActivity = (index, originId) => {
    if (originId !== 'activities') {
      const activity = machines[originId].items[index];
      setMachines((prev) => ({
        ...prev,
        [originId]: {
          ...prev[originId],
          items: prev[originId].items.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleSave = (machineId) => {
    console.log(`Actividades guardadas para ${machines[machineId]?.name}:`, machines[machineId]?.items);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDuplicateActivity(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f4f6f9' }}>
        {/* Lista de actividades */}
        <div style={{ width: '30%', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
          <h3 style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>Actividades</h3>
          <div style={{ minHeight: '300px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '10px' }}>
            {activities.map((activity, index) => (
              <Activity
                key={activity.id}
                activity={activity}
                index={index}
                moveActivity={moveActivity}
                origin="activities"
                removeActivity={removeActivity}
              />
            ))}
          </div>
        </div>

        {/* Tarjetas de máquinas */}
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '65%' }}>
          {Object.values(machines).length > 0 ? (
            Object.values(machines).map((machine) => (
              <MachineDropZone
                key={machine.name}
                machine={machine}
                moveActivity={moveActivity}
                handleSave={handleSave}
                removeActivity={removeActivity}
              />
            ))
          ) : (
            <p>No hay máquinas para la familia seleccionada</p>
          )}
        </div>
      </div>

      {/* Selector de familia */}
      <FormControl fullWidth style={{ marginBottom: '20px' }}>
        <InputLabel>Selecciona una familia</InputLabel>
        <Select
          value={familiaSeleccionada}
          onChange={(e) => setFamiliaSeleccionada(e.target.value)}
          label="Selecciona una familia"
        >
          {familias.map((familia) => (
            <MenuItem key={familia} value={familia}>
              {familia}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Actividad duplicada"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            La actividad "{duplicateActivity?.titulo}" ya está agregada a la máquina.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};

export default Home;
