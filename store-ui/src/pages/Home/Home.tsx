import data from '../../utils/assets'
import './Home.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Deals from '../../components/Deals/Deals'
import { useNavigate } from "react-router-dom";
import SEO from '../../components/SEO';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div>
      <SEO
        title="E-Commerce Store | Shop Online for the Best Deals"
        description="Shop online for electronics, fashion, groceries, mobiles, appliances, and more. Best deals and discounts available daily."
        keywords="e-commerce, online shopping, electronics, fashion, groceries, deals"
      />
      
      <Grid container spacing={isMobile ? 1 : 2}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Deals />
          </Paper>
        </Grid>
      </Grid>

      <Grid container sx={{ mt: isMobile ? 2 : 3 }}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            <Box sx={{ 
              p: isMobile ? 1 : 1.5,
              borderBottom: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} component="h2">Shop by Category</Typography>
            </Box>
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
                {
                  data['categories'].map((category, index) => (
                    <Box key={index}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          boxShadow: 'none',
                          border: '1px solid',
                          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          borderRadius: 1,
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
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
                              height: isMobile ? 80 : 120
                            }}
                          > 
                            <img 
                              src={category.image} 
                              height="100%" 
                              alt={category.name}
                              style={{ objectFit: 'contain' }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))
                }
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Home;
