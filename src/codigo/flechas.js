import React from 'react';

// Flecha personalizada para "anterior"
const PrevArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'block',
      background: 'grey', // Cambia este color al que desees
      borderRadius: '50%',
      marginRight: '10px',
      // Opcional: un estilo redondeado
    }}
    onClick={onClick}
  />
);

// Flecha personalizada para "siguiente"
const NextArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'block',
      background: 'grey', // Cambia este color al que desees
      borderRadius: '50%',
      marginRight: '20px',
      // Opcional: un estilo redondeado
    }}
    onClick={onClick}
  />
);

export { PrevArrow, NextArrow };
