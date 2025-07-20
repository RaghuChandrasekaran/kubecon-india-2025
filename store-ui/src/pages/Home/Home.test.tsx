import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HelmetProvider } from 'react-helmet-async';
import Home from './Home';

// Create a test wrapper component with all necessary providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

test('renders home page with deals and categories', () => {
  render(
    <TestWrapper>
      <Home />
    </TestWrapper>
  );
  
  // Test for key elements that should be present
  expect(screen.getByText(/Shop by Category/i)).toBeInTheDocument();
});
