import React from 'react';
import './Home.css';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import SEO from '../../components/SEO';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// Import new modular components
import HeroSection from '../../components/Home/HeroSection';
import CategoryGrid from '../../components/Home/CategoryGrid';

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <SEO
        title="Clusterly | Shop Online for the Best Deals"
        description="Shop online at Clusterly for electronics, fashion, groceries, mobiles, appliances, and more. Best deals and discounts available daily."
        keywords="clusterly, e-commerce, online shopping, electronics, fashion, groceries, deals"
      />
      
      {/* Hero Section with Deals */}
      <HeroSection />

      {/* Categories Section */}
      <Grid container sx={{ mt: isMobile ? 2 : 3 }}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            <Box sx={{ 
              p: isMobile ? 1 : 1.5,
              borderBottom: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                component="h2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary
                }}
              >
                Shop by Category
              </Typography>
            </Box>
            <CategoryGrid />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
