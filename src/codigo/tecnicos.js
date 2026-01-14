import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, MenuItem, Select, FormControl, InputLabel, Link, Typography, Snackbar, Alert, TextField, Dialog, Chip, DialogTitle, DialogContent, Box, DialogActions, Autocomplete } from '@mui/material';
import { Build, Visibility, Done, CleaningServices, SwapHoriz, EngineeringOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from "../context/AuthContext"; // Ajusta la ruta según tu proyecto
import { use } from 'react';




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
        Orden de Trabajo
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

  const [titulo, setTitulo] = useState('');
  const [tecnicoAsignado, setTecnicoAsignado] = useState({ items: [] });
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [maquinas, setMaquinas] = useState([]);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState('');
  const [tipoServicio, setTipoServicio] = useState('');
  const [plazo, setPlazo] = useState('');
  const { currentUser } = useAuth();
  const [workOrders, setWorkOrders] = useState([]); // Almacena las órdenes de trabajo obtenidas
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mostrar el mensaje de error
  const [openSnackbar, setOpenSnackbar] = useState(false); // Control del Snackbar
  const { user } = useAuth();
  const theme = useTheme();
  const [openForm, setOpenForm] = useState(false);
  const [openActForm, setOpenActForm] = useState(false);
  const [idOrden, setidOrden] = useState('');
  const handleOpenForm = () => { setOpenForm(true); ordenesList(); };
  const handleCloseForm = () => setOpenForm(false);
  const handleOpenActForm = () => setOpenActForm(true);
  const handleCloseActForm = () => setOpenActForm(false);
  const [NewAct, setNewAct] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const isButtonDisabled = !idOrden;
  const [searchTermActividades, setSearchTermActividades] = useState('');
  const [newPlan, setNewPlan] = useState({
    numero_orden: '', tipo_servicio: '', actividad_id: [], estado: '',
    familia: '', maquina: '', plazo_servicio: ''
  });

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
    fetchActividades();
  }, []);

  useEffect(() => {
    if (familiaSeleccionada && maquinaSeleccionada && tipoServicio && plazo) {
      const fetchWorkOrders = async () => {
        try {
          const response = await fetch(
            `https://teknia.app/api3/obtener_planes_trabajo/${familiaSeleccionada}/${maquinaSeleccionada}/${tipoServicio}/${plazo}`
          );
          const data = await response.json();
          setWorkOrders(data); // Asegúrate de que `data` es un array antes de establecerlo en el estado
        } catch (error) {
          console.error('Error al obtener las órdenes de trabajo:', error);
        }
      };

      fetchWorkOrders();
    }


  }, [familiaSeleccionada, maquinaSeleccionada, tipoServicio, plazo]);

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

  const fetchActividades = async () => {
    try {
      const response = await fetch(`https://teknia.app/api3/obtener_actividades_mantto`);
      const data = await response.json();
      setActividades(data);
      console.log('Actividades cargadas con éxito:');
    } catch (error) {
      console.error('Error al obtener las actividades:', error);
    }
  };

  const crearOrdenTrabajo = async () => {
    // Validaciones antes de proceder
    if (
      !titulo.trim() ||
      !familiaSeleccionada ||
      !maquinaSeleccionada ||
      !tipoServicio ||
      !plazo ||
      tecnicoAsignado.items.length === 0 // Verifica que haya al menos una actividad
    ) {
      alert('Por favor, completa todos los campos y selecciona al menos una actividad.');
      return;
    }

    try {
      const response = await fetch(`https://teknia.app/api3/crear_orden_trabajo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_persona: currentUser.displayName,
          correo_persona: currentUser.email,
          version: 1,
          puede_editar: false,
          titulo: titulo.trim(), // Limpia espacios en blanco extra
        }),
      });

      if (!response.ok) {
        console.error('Error en la respuesta de crear la orden de trabajo:', response.status);
        alert('Hubo un error al crear la orden de trabajo.');
        return;
      }

      const nuevaOrden = await response.json();
      console.log('Orden de trabajo creada:', nuevaOrden);
      alert(`Orden de trabajo creada: ${nuevaOrden.id}`);

      // Llamar a la función para actualizar los planes de trabajo con la nueva orden creada
      await actualizarPlanesTrabajo(nuevaOrden.id);
    } catch (error) {
      console.error('Error al crear la orden de trabajo:', error);
      alert('Error en la creación de la orden.');
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

  const ordenesList = async () => {
    try {
      const response = await fetch(`https://teknia.app/api3/obtener_ordenes_trabajo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status == 200) {
        const data = await response.json();
        console.log('Ordenes de trabajo cargadas con éxito');
        setOrdenes(data);
      }


    } catch (e) {
      console.error('Error al obtener las órdenes de trabajo para el desplegable:', e);
    }
  };





  const clonarOrdenTrabajo = async (idOrden) => {
    try {
      const response = await fetch(`https://teknia.app/api3/obtener_planes_trabajo_por_orden/${idOrden}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status == 200) {
        const data = await response.json();
        console.log('Orden de trabajo clonada:', data);
        setWorkOrders(data);
      }


    } catch (e) {
      console.error('Error al clonar la orden de trabajo:', e);
    }
  };

  const handleSubmitForm = () => {
    clonarOrdenTrabajo(idOrden);
    handleCloseForm();
  }

  const linkAct = () => {
    if (workOrders.length > 0) {
      return (<h5><Link onClick={() => { setOpenActForm(true) }}>¿te faltó alguna actividad? ¡pulsa aquí!</Link></h5>);
    } else {
      return (<h5></h5>);
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.actividad_id.length) {
      alert('Debes seleccionar al menos una actividad.');
      return;
    }

    try {
      // Recorremos todas las actividades seleccionadas y enviamos cada una por separado
      const requests = newPlan.actividad_id.map(async (actividadId) => {
        const actividadSeleccionada = actividades.find((act) => act.id === actividadId);

        return fetch(`https://teknia.app/api3/crear_plan_trabajo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            numero_orden: workOrders[0].numero_orden, // Se mantiene igual
            tipo_servicio: workOrders[0].tipo_servicio, // Se mantiene igual
            actividad_id: actividadId, // Se cambia por la actividad seleccionada
            estado: 'Liberado', // Se puede cambiar según necesidad
            familia: workOrders[0].familia, // Se mantiene igual
            maquina: workOrders[0].maquina, // Se mantiene igual
            plazo_servicio: workOrders[0].plazo_servicio, // Se mantiene igual
            titulo: actividadSeleccionada.titulo, // Se cambia según la actividad
          }),

        });
      });

      await Promise.all(requests); // Esperamos que todas las peticiones se completen
      alert('Actividades agregadas con éxito.');


      // Opcional: Resetear el estado
      setNewPlan({
        numero_orden: '',
        tipo_servicio: '',
        actividad_id: [],
        estado: '',
        familia: '',
        maquina: '',
        plazo_servicio: '',
      });

      handleCloseActForm(); // Cerrar modal después de agregar
    } catch (error) {
      console.error('Error al agregar el plan de trabajo:', error);
      alert('Hubo un error al agregar las actividades.');
    }
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '30%' }}>
          <div style={{ padding: "5px" }}></div>
          <div style={{ padding: "5px" }}>
            <FormControl fullWidth>
              <TextField
                label="Titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Selecciona una familia</InputLabel>
              <Select
                value={familiaSeleccionada}
                onChange={(e) => setFamiliaSeleccionada(e.target.value)}
                label="Selecciona una familia"
                style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}
                sx={{ mb: 2 }}
                required
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
                    required
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
                required
              >
                <MenuItem value="Instalación">Instalación</MenuItem>
                <MenuItem value="Capacitación">Capacitación</MenuItem>
                <MenuItem value="Instalación/Capacitación">Instalación/Capacitación</MenuItem>
                <MenuItem value="Mantenimiento Básico">Mantenimiento Básico</MenuItem>
                <MenuItem value="Mantenimiento Estándar">Mantenimiento Estándar</MenuItem>
                <MenuItem value="Mantenimiento Completo">Mantenimiento Completo</MenuItem>
                <MenuItem value="Mantenimiento Correctivo">Mantenimiento Correctivo</MenuItem>
                <MenuItem value="Ensamble">Ensamble</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Plazo de Servicio</InputLabel>
              <Select
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
              >
                <MenuItem value="Trimestral">Trimestral</MenuItem>
                <MenuItem value="Cuatrimestral">Cuatrimestral</MenuItem>
                <MenuItem value="Semestral">Semestral</MenuItem>
                <MenuItem value="Octomestral">Octomestral</MenuItem>
                <MenuItem value="Anual">Anual</MenuItem>
                <MenuItem value="No Aplica">No Aplica</MenuItem>
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
            <div>
              <h3 style={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Actividades </h3>
              {linkAct()}


            </div>


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
      <div style={{ padding: '20px', justifyContent: 'center', display: 'flex', marginTop: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          style={{
            borderRadius: '20px',
            padding: '10px 20px',
            textTransform: 'none',
          }}
          onClick={crearOrdenTrabajo}
        >
          Guardar
        </Button>

        <Button
          variant="contained"
          color="success"
          style={{
            marginTop: '20px',
            borderRadius: '20px',
            padding: '10px 20px',
            textTransform: 'none',
            margin: '0 20px'

          }}
          onClick={handleOpenForm}
        >
          Clonar orden de trabajo
        </Button>
      </div>

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

      <Dialog open={openForm} onClose={handleCloseForm} >
        <DialogTitle textAlign="center">Clonar Orden de Trabajo</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmitForm}>
            <Select
              fullWidth
              name="id"
              value={idOrden}
              onChange={(e) => { setidOrden(e.target.value) }}
              displayEmpty
              required
            >
              <MenuItem value="" disabled>
                Selecciona una orden de trabajo
              </MenuItem>
              {ordenes.map((orden) => (
                <MenuItem key={orden.id} value={orden.id}>
                  {orden.titulo}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="">
            Cancelar
          </Button>
          <Button type="submit" color="secondary" disabled={isButtonDisabled} onClick={handleSubmitForm}>
            Clonar
          </Button>
        </DialogActions>
      </Dialog>



      {/* ########################################################################################################################################################## */}
      <Dialog open={openActForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle textAlign="center">Agregar Actividad</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              options={actividades.filter((option) =>
                option.titulo.toLowerCase().includes(searchTermActividades.toLowerCase())
              )}
              getOptionLabel={(option) => option.titulo}
              value={actividades.filter((actividad) => newPlan.actividad_id.includes(actividad.id))}
              onChange={(event, newValue) => {
                const selectedIds = newValue.map((actividad) => actividad.id);
                setNewPlan((prevPlan) => ({
                  ...prevPlan,
                  actividad_id: selectedIds,
                }));
              }}
              inputValue={searchTermActividades} // Controla el valor del input sin afectar la selección
              onInputChange={(event, newInputValue) => {
                setSearchTermActividades(newInputValue); // Mantiene el texto mientras se escribe
              }}
              filterOptions={(options, { inputValue }) => {
                return options.filter((option) =>
                  option.titulo.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip key={option.id} label={option.titulo} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Actividades"
                  placeholder="Selecciona una actividad"
                />
              )}
            />


          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActForm} color="error" variant='outlined'>
            Cancelar
          </Button>
          <Button type="submit" color="secondary" disabled={isButtonDisabled} onClick={handleAddPlan} variant='contained'>
            Agregar actividad
          </Button>
        </DialogActions>

      </Dialog>


    </DndProvider>
  );
};

export default Tecnicos;
