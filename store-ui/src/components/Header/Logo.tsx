import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Logo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        marginRight: 3,
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}
      onClick={() => navigate('/')}
      tabIndex={0}
      role="link"
      aria-label="Clusterly home page"
      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && navigate('/')}
    >
      <img
        src="/logo.png"
        alt="Clusterly"
        style={{
          height: '36px',
          width: 'auto',
          marginRight: '10px'
        }}
      />
      <Typography
        variant="h5"
        component="div"
        sx={{ 
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: '#fff',
          fontSize: '1.5rem',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }}
      >
        Clusterly
      </Typography>
    </Box>
  );
};

export default Logo;
