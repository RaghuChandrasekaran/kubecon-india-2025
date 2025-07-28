import React from 'react';
import { Grid, Paper, useMediaQuery, useTheme } from '@mui/material';
import Deals from '../Deals/Deals';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={isMobile ? 1 : 2}>
      <Grid item xs={12}>
        <Paper 
          elevation={isDarkMode ? 2 : 1}
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkMode 
                ? 'linear-gradient(45deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)'
                : 'linear-gradient(45deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
              pointerEvents: 'none',
              zIndex: 1
            }
          }}
        >
          <Deals />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HeroSection;
