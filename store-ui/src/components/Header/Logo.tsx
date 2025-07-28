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
        marginRight: 2
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
          height: '40px',
          width: 'auto',
          marginRight: '12px'
        }}
      />
      <Typography
        variant="h6"
        component="div"
        sx={{ 
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          color: '#fff'
        }}
      >
        Clusterly
      </Typography>
    </Box>
  );
};

export default Logo;
