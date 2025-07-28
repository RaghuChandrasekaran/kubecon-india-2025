import React from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Category {
  name: string;
  path: string;
}

interface NavigationTabsProps {
  categories: Category[];
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({
  categories,
  currentTab,
  onTabChange
}) => {
  return (
    <Box sx={{ 
      backgroundColor: '#2a2a2a',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        maxWidth: '100%',
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        <Tabs 
          value={currentTab}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          textColor="inherit"
          aria-label="Category navigation tabs"
          sx={{
            minHeight: '48px',
            width: '100%',
            '& .MuiTab-root': {
              minWidth: 100,
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              textTransform: 'none',
              padding: '8px 20px',
              minHeight: '48px',
              transition: 'all 0.3s ease',
              letterSpacing: '0.3px',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                color: '#FFB74D',
              },
              '&.Mui-selected': {
                color: '#FF9800',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 152, 0, 0.08)',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FF9800',
              height: '3px',
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTabScrollButton-root': {
              color: 'rgba(255, 255, 255, 0.8)',
              width: '40px',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                color: '#FF9800',
              },
              '&.Mui-disabled': {
                opacity: 0.3
              }
            }
          }}
        >
          {categories.map((category, index) => (
            <Tab 
              key={index} 
              label={category.name} 
              aria-label={`View ${category.name} category`}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export default NavigationTabs;
