import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase-config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Typography,
  Container,
  Box,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

function TablaOperadores() {
  const [operadores, setOperadores] = useState([]); // Estado para almacenar operadores
  const [nuevoOperador, setNuevoOperador] = useState({ nombre: '', correo: '', token: '' }); // Estado para nuevo operador
  const [editId, setEditId] = useState(null); // Para manejar la edición
  const [editData, setEditData] = useState({ nombre: '', correo: '', token: '' });
  const navigate = useNavigate();
  const operadoresCollection = collection(db, 'operadores'); // Referencia a la colección de Firestore

  // Leer datos de Firestore
  const getOperadores = async () => {
    const data = await getDocs(operadoresCollection);
    setOperadores(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    getOperadores();
  }, []);

  // Crear nuevo operador
  const handleAddOperador = async () => {
    if (nuevoOperador.nombre && nuevoOperador.correo && nuevoOperador.token) {
      try {
        // Registrar el usuario en Firebase Authentication
        const apiKey = 'AIzaSyBGB6jHNXRKIif9vUSR6ogtDIcCJpnqCrU'; // Tu API Key de Firebase
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: nuevoOperador.correo,
            password: nuevoOperador.token, // Usamos el token como contraseña
            returnSecureToken: false, // No autenticar automáticamente
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error al registrar el usuario:', errorData.error.message);
          alert('Error al registrar el usuario: ' + errorData.error.message);
          return;
        }

        // Guardar el operador en Firestore
        await addDoc(operadoresCollection, nuevoOperador);

        // Limpiar el formulario
        setNuevoOperador({ nombre: '', correo: '', token: '' });

        // Actualizar la lista
        getOperadores();
      } catch (error) {
        console.error('Error al agregar el operador:', error);
        alert('Error al agregar el operador.');
      }
    } else {
      alert('Por favor completa todos los campos.');
    }
  };

  // Actualizar operador
  const handleUpdateOperador = async () => {
    if (editData.nombre && editData.correo) {
      const operadorDoc = doc(db, 'operadores', editId);
      await updateDoc(operadorDoc, editData);
      setEditId(null);
      setEditData({ nombre: '', correo: '' });
      getOperadores();
    }
  };

  // Eliminar operador
  const handleDeleteOperador = async (id) => {
    const operadorDoc = doc(db, 'operadores', id);
    await deleteDoc(operadorDoc);
    getOperadores();
  };

  return (
    <Container>
      <IconButton onClick={() => navigate(-1)}>
        <ArrowBack></ArrowBack>

      </IconButton>
      <Typography variant="h4" align="center" gutterBottom>
        Operadores en planta
      </Typography>

      {/* Formulario para agregar nuevo operador */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Nombre"
          variant="outlined"
          value={nuevoOperador.nombre}
          required={true}
          onChange={(e) =>
            setNuevoOperador({ ...nuevoOperador, nombre: e.target.value })

          }
        />
        <TextField
          label="Correo"
          variant="outlined"
          value={nuevoOperador.correo}
          required={true}
          onChange={(e) =>
            setNuevoOperador({ ...nuevoOperador, correo: e.target.value })
          }
        />
        <TextField
          label="Código de acceso"
          variant="outlined"
          value={nuevoOperador.token}
          required={true}
          onChange={(e) =>
            setNuevoOperador({ ...nuevoOperador, token: e.target.value })
          }
        />
        <Button variant="contained" color="primary" onClick={handleAddOperador}>
          Agregar Operador
        </Button>
      </Box>

      {/* Tabla de operadores */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {operadores.map((operador) => (
            <TableRow key={operador.id}>
              <TableCell>
                {editId === operador.id ? (
                  <TextField
                    value={editData.nombre}
                    onChange={(e) =>
                      setEditData({ ...editData, nombre: e.target.value })
                    }
                  />
                ) : (
                  operador.nombre
                )}
              </TableCell>
              <TableCell>
                {editId === operador.id ? (
                  <TextField
                    value={editData.correo}
                    onChange={(e) =>
                      setEditData({ ...editData, correo: e.target.value })
                    }
                  />
                ) : (
                  operador.correo
                )}
              </TableCell>
              <TableCell>
                {editId === operador.id ? (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleUpdateOperador}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setEditId(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setEditId(operador.id);
                        setEditData({
                          nombre: operador.nombre,
                          correo: operador.correo,
                        });
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteOperador(operador.id)}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default TablaOperadores;
