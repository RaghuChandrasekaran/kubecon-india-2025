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
    <Box sx={{ backgroundColor: '#37474F' }}>
      <Container maxWidth="xl">
        <Tabs 
          value={currentTab}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          indicatorColor="secondary"
          aria-label="Category navigation tabs"
          sx={{
            '& .MuiTab-root': {
              minWidth: 100,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
              },
              '&.Mui-selected': {
                color: '#FF9800',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FF9800',
              height: '3px'
            },
            '& .MuiTabScrollButton-root': {
              color: '#FFFFFF',
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
      </Container>
    </Box>
  );
};

export default NavigationTabs;
