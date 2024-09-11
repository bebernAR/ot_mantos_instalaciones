import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@mui/material';

const initialActivities = [
  { id: 'MTP0001', content: 'Revisión de estado de baleros y guías lineales' },
  { id: 'MTP0002', content: 'Cambio de agua de chiller (Fiber)' },
  { id: 'MTP0003', content: 'Limpieza guías lineales' },
  { id: 'MTP0004', content: 'Limpieza cremalleras' },
];

const initialMachines = {
  shop: {
    name: 'Shop',
    items: [],
  },
  maker: {
    name: 'Maker',
    items: [],
  },
  fiber: {
    name: 'Fiber',
    items: [],
  },
};

const Home = () => {
  const [activities, setActivities] = useState(initialActivities);
  const [machines, setMachines] = useState(initialMachines);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const newItems = Array.from(
        source.droppableId === 'activities'
          ? activities
          : machines[source.droppableId].items
      );
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      if (source.droppableId === 'activities') {
        setActivities(newItems);
      } else {
        setMachines({
          ...machines,
          [source.droppableId]: {
            ...machines[source.droppableId],
            items: newItems,
          },
        });
      }
    } else {
      const sourceItems = Array.from(
        source.droppableId === 'activities'
          ? activities
          : machines[source.droppableId].items
      );
      const [removed] = sourceItems.splice(source.index, 1);
      const destItems = Array.from(machines[destination.droppableId].items);
      destItems.splice(destination.index, 0, removed);

      if (source.droppableId === 'activities') {
        setActivities(sourceItems);
      } else {
        setMachines({
          ...machines,
          [source.droppableId]: {
            ...machines[source.droppableId],
            items: sourceItems,
          },
        });
      }
      setMachines({
        ...machines,
        [destination.droppableId]: {
          ...machines[destination.droppableId],
          items: destItems,
        },
      });
    }
  };

  const handleSave = (machineId) => {
    console.log(`Actividades guardadas para ${machines[machineId].name}: `, machines[machineId].items);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tabla de Asignación de Actividades a Equipos</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex' }}>
          <Droppable droppableId="activities">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  marginRight: '20px',
                  minWidth: '200px',
                  padding: '10px',
                  backgroundColor: '#f0f0f0',
                }}
              >
                <h3>Actividades</h3>
                {activities.map((activity, index) => (
                  <Draggable key={activity.id} draggableId={activity.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          margin: '8px 0',
                          padding: '10px',
                          backgroundColor: '#fff',
                          border: '1px solid #ddd',
                          ...provided.draggableProps.style,
                        }}
                      >
                        {activity.content}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
            {Object.keys(machines).map((machineId) => (
              <Droppable key={machineId} droppableId={machineId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      width: '200px',
                      minHeight: '300px',
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #ddd',
                    }}
                  >
                    <h3>{machines[machineId].name}</h3>
                    {machines[machineId].items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              margin: '8px 0',
                              padding: '10px',
                              backgroundColor: '#fff',
                              border: '1px solid #ddd',
                              ...provided.draggableProps.style,
                            }}
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleSave(machineId)}
                      style={{ marginTop: '20px' }}
                    >
                      Guardar {machines[machineId].name}
                    </Button>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Home;
