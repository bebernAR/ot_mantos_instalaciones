import React from 'react';

const PrevArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'block',
      background: 'grey', 
      borderRadius: '50%',
      marginRight: '10px',
    }}
    onClick={onClick}
  />
);

const NextArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'block',
      background: 'grey', 
      borderRadius: '50%',
      marginRight: '20px',
    }}
    onClick={onClick}
  />
);

export { PrevArrow, NextArrow };
