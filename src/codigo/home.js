import React from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, Button, Grid, Card, CardContent
} from '@mui/material';

const Home = () => {
  return (
    <>
      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent>
                <Box textAlign="center" py={5}>
                  <Typography variant="h3" gutterBottom>
                    Bienvenido a la Plataforma de Órdenes de Trabajo
                  </Typography>
                  <Typography variant="h6" color="textSecondary" paragraph>
                    Gestiona todas las órdenes de trabajo de Asia Robótica de manera fácil y eficiente.
                  </Typography>
                  <Button variant="contained" color="primary" size="large" sx={{ mt: 4 }}>
                    Comenzar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Home;