import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button, Modal, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { NextArrow, PrevArrow } from './flechas';
import { Build, Visibility, Done, CleaningServices, SwapHoriz, EngineeringOutlined } from '@mui/icons-material'; 
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'; //
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
const ItemType = 'ACTIVITY';

const getIconByClassification = (classification) => {
  switch (classification.trim()) { // Usa trim para eliminar espacios en blanco si los hubiera
    case 'Inspección':
      return <Visibility style={{ marginRight: '2px', color: 'black', justifyItems:'flex-end'}} />; // Ícono de inspección
    case 'Limpieza':
      return <CleaningServices style={{ marginRight: '2px', color: '#0e6f27' }} />; // Ícono de limpieza
    case 'Ajuste':
      return <SwapHoriz style={{ marginRight: '2px', color: '#73732b' }} />; // Ícono de ajuste
    case 'Remplazo Definitivo':
      return <Build style={{ marginRight: '2px', color: 'grey' }} />; // Ícono de reemplazo definitivo
    case 'Instalación':
      return <EngineeringOutlined style={{ marginRight: '2px', color: 'grey'}} />
    default:
      return <Done style={{ marginRight: '2px', color: '#9e9e9e' }} />; // Ícono por defecto
  }
};


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
        display: 'flex', // Flexbox para alinear los elementos
        justifyContent: 'space-between', // Alinea los elementos en los extremos (texto a la izquierda y icono a la derecha)
        alignItems: 'center', // Asegura que estén alineados verticalmente
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

    
      <div
        style={{
          maxHeight: '200px', // Limita la altura máxima a 200px (ajusta según prefieras)
          overflowY: 'auto',  // Habilita el scroll vertical si se excede la altura
          paddingRight: '10px',  // Añade un pequeño padding para evitar que el scroll tape el contenido
        }}
      >
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
  const [activities, setActivities] = useState([]);
  const [machines, setMachines] = useState({});
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [duplicateActivity, setDuplicateActivity] = useState(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  const familias = ['Router', 'Láser Co2', 'Láser Fibra Óptica', 'Plasma', 'Dobladora', 'Grua Neumática', 'Externa'];

  // Hacer la solicitud a la API cuando se seleccione una familia
  useEffect(() => {
    if (familiaSeleccionada) {
      const fetchMachines = async () => {
        try {
          const response = await fetch(`https://teknia.app/api/actividades_tecnicas/maquinas/${familiaSeleccionada}`);
          const data = await response.json();

          data.forEach((machine) => {
            console.log(machine.maquina);
          });

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

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <PrevArrow/>,
    nextArrow: <NextArrow/>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f4f6f9' }}>
        {/* Lista de actividades */}
        <div style={{ width: '30%', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
          <h3 style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>Actividades</h3>
         
          <div>
          <Button variant="" startIcon={<FontAwesomeIcon icon={faInfoCircle} onClick={handleOpen} />}>    </Button> 
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
              {/* Iterar sobre las clasificaciones únicas y mostrar el icono y la clasificación */}
              {uniqueClassifications.map((classification, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  {getIconByClassification(classification)} 
                  <strong> <span style={{ marginLeft: '8px', fontSize: '16px' }}>{classification}</span></strong>
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
              backgroundColor: '#f9f9f9',
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
                <div key={machine.name}>
                  <MachineDropZone
                    machine={machine}
                    moveActivity={moveActivity}
                    handleSave={handleSave}
                    removeActivity={removeActivity}
                  />
                </div>
              ))
            ) : (
              <p>No hay máquinas para la familia seleccionada</p>
            )}
          </Slider>
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

      {/* Modal de actividades duplicadas */}
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
