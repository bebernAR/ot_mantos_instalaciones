// Login.js
import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Divider 
} from "@mui/material";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { auth } from "../../firebase/firebase-config";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); // Modo de registro o login
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirige al dashboard tras login exitoso
    } catch (err) {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirige al dashboard tras registro exitoso
    } catch (err) {
      setError("Error al registrarse. Verifica tus datos e intenta de nuevo.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/"); // Redirige al dashboard tras login exitoso
    } catch (err) {
      setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5">
          {isRegistering ? "Registrarse" : "Iniciar Sesión"}
        </Typography>
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <TextField
            fullWidth
            label="Correo"
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
          >
            {isRegistering ? "Registrarse" : "Ingresar"}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>O</Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleLogin}
          sx={{ mt: 2 }}
        >
          Iniciar sesión con Google
        </Button>

        <Button
          fullWidth
          onClick={() => setIsRegistering(!isRegistering)}
          sx={{ mt: 2 }}
        >
          {isRegistering
            ? "¿Ya tienes una cuenta? Inicia sesión"
            : "¿No tienes una cuenta? Regístrate"}
        </Button>
      </Box>
    </Container>
  );
};

export default Login;