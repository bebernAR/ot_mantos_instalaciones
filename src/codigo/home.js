import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button, Modal, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, FormControl, InputLabel, Typography, Box } from '@mui/material';
import { NextArrow, PrevArrow } from './flechas';
import { Build, Visibility, Done, CleaningServices, SwapHoriz, EngineeringOutlined } from '@mui/icons-material'; 
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@mui/material/styles';

const ItemType = 'ACTIVITY';

const getIconByClassification = (classification) => {
  switch (classification.trim()) {
    case 'Inspección':
      return <Visibility style={{ marginRight: '2px', color: '#246eb8' }} />;
    case 'Limpieza':
      return <CleaningServices style={{ marginRight: '2px', color: '#0e6f27' }} />;
    case 'Ajuste':
      return <Build style={{ marginRight: '2px', color: 'grey' }} />;
    case 'Remplazo Definitivo':
      return <SwapHoriz style={{ marginRight: '2px', color: '#73732b' }} />;
    case 'Instalación':
      return <EngineeringOutlined style={{ marginRight: '2px', color: 'black'}} />;
    default:
      return <Done style={{ marginRight: '2px', color: 'black' }} />;
  }
};

const Activity = ({ activity, index, moveActivity, origin, removeActivity, moveItemWithinMachine }) => {
  const theme = useTheme(); // Obtén el tema actual (oscuro o claro)
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
        moveItemWithinMachine(draggedItem.index, index, origin);
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
  const theme = useTheme();
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemType,
    drop: (item) => moveActivity(item.index, machine.name, item.origin),
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
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', // Ajuste del color del texto
      }}
    >
      <Typography variant="h5" style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>
        {machine.name}
      </Typography>

      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          paddingRight: '10px',
        }}
      >
        {machine.items.map((item, index) => (
          <Activity
            key={item.id}
            activity={item}
            index={index}
            moveActivity={moveActivity}
            moveItemWithinMachine={() => {}}
            origin={machine.name}
            removeActivity={removeActivity}
          />
        ))}
      </div>

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
  const theme = useTheme(); // Obtén el tema actual (oscuro o claro)
  const [activities, setActivities] = useState([]);
  const [machines, setMachines] = useState({});
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [duplicateActivity, setDuplicateActivity] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (familiaSeleccionada) {
      const fetchMachines = async () => {
        try {
          const response = await fetch(`https://teknia.app/api/actividades_tecnicas/maquinas/${familiaSeleccionada}`);
          const data = await response.json();

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

    fetchActivities();
  }, []);

  const moveActivity = (index, destinationId, originId) => {
    const activity = originId === 'activities' ? activities[index] : machines[originId].items[index];
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
      setDuplicateActivity(activity);
      setModalOpen(true);
    }
  };

  const removeActivity = (index, originId) => {
    if (originId !== 'activities') {
      setMachines((prev) => ({
        ...prev,
        [originId]: {
          ...prev[originId],
          items: prev[originId].items.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleSave = async (machineId) => {
    const machine = machines[machineId];
    if (!machine || !machine.items || machine.items.length === 0) {
      console.log("No hay actividades para guardar.");
      return;
    }

    const payload = {
      familia: familiaSeleccionada,
      equipo: machine.name,
      actividades: machine.items.map((item) => ({
        actividad: item.titulo,
        id_actividad: item.id,
      })),
    };

    try {
      const response = await fetch('https://teknia.app/api3/crear_equipo_mantto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Datos guardados con éxito:', result);
      } else {
        console.error('Error al guardar los datos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al hacer la solicitud a la API:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDuplicateActivity(null);
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '0px solid #000',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
  };

  const uniqueClassifications = Array.from(new Set(activities.map(activity => activity.clasificacion.trim())));

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: theme.palette.mode === 'dark' ? '#1c1c1c' : '#f4f6f9' }}>
        {/* Lista de actividades */}
        <div style={{ width: '30%', padding: '10px', border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#ddd'}`, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff' }}>
          <h3 style={{ fontFamily: 'Arial, sans-serif', color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>Actividades</h3>

          <div>
            <Button startIcon={<FontAwesomeIcon icon={faInfoCircle} />} onClick={handleOpen} style={{cursor: 'help'}}>Guía de Iconos</Button>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Guía de Iconos
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  {uniqueClassifications.map((classification, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      {getIconByClassification(classification)}
                      <strong><span style={{ marginLeft: '8px', fontSize: '16px' }}>{classification}</span></strong>
                    </div>
                  ))}
                </Typography>
              </Box>
            </Modal>
          </div>

          <div
            style={{
              minHeight: '300px',
              maxHeight: '500px',
              overflowY: 'auto',
              backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9',
              padding: '10px',
              borderRadius: '10px',
            }}
          >
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

        {/* Carrusel de máquinas */}
        <div style={{ width: '65%' }}>
          <Slider {...settings}>
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
              <p style={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                No hay máquinas para la familia seleccionada
              </p>
            )}
          </Slider>
        </div>
      </div>

      {/* Selector de familia */}
      <FormControl fullWidth style={{ marginBottom: '20px' }}>
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

      {/* Modal de actividades duplicadas */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>{"Actividad duplicada"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            La actividad "{duplicateActivity?.titulo}" ya está agregada a la máquina.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};

export default Home;
