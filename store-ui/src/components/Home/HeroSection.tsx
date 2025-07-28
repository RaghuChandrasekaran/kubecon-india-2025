import React from 'react';
import { Grid, Paper, useMediaQuery, useTheme } from '@mui/material';
import Deals from '../Deals/Deals';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container spacing={isMobile ? 1 : 2}>
      <Grid item xs={12}>
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 1, 
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
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
