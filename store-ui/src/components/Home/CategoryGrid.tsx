import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import data from '../../utils/assets';

interface Category {
  name: string;
  image: string;
}

const CategoryGrid: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Grid 
        container 
        spacing={isMobile ? 1 : 2}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // 2 columns for mobile
            sm: 'repeat(4, 1fr)', // 4 columns for tablet
            md: 'repeat(4, 1fr)', // 4 columns for desktop
          },
          gap: { xs: 1, sm: 2 }
        }}
      >
        {(data['categories'] as Category[]).map((category: Category, index: number) => (
          <Box key={index}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: 'none',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: 1,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 20px rgba(255,255,255,0.1)' 
                    : '0 4px 20px rgba(0,0,0,0.1)',
                  borderColor: theme.palette.primary.main,
                }
              }}
              onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
              role="button"
              tabIndex={0}
              aria-label={`Browse ${category.name} category`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/category/${category.name.toLowerCase()}`);
                }
              }}
            >
              <CardContent sx={{ p: isMobile ? 1 : 1.5, textAlign: 'center' }}>
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    mb: 1, 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {category.name}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    height: isMobile ? 80 : 120,
                    overflow: 'hidden',
                    borderRadius: 1
                  }}
                > 
                  <img 
                    src={category.image} 
                    height="100%" 
                    alt={`${category.name} category`}
                    style={{ 
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }}
                    loading="lazy"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryGrid;
