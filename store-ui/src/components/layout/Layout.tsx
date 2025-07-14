import React, { useContext } from "react"
import Header from "./Header/Header"
import Footer from "./Footer/Footer"
import Box from '@mui/material/Box';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ThemeContext, { ThemeProvider } from "./ThemeContext";
import GlobalContext from "./GlobalContext";
import { CartProvider } from "./CartContext";
import CssBaseline from '@mui/material/CssBaseline';

// Skip link component for keyboard accessibility
const SkipLink = () => {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '0',
        padding: '8px',
        zIndex: 9999,
        backgroundColor: '#1976d2',
        color: 'white',
        textDecoration: 'none',
        transition: 'top 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
    >
      Skip to main content
    </a>
  );
};

const Layout = (props: any) => {
    const [data, setData] = React.useState({});
    const value = React.useMemo(
        () => ({ data, setData }),
        [data]
    );

    return (
        <GlobalContext.Provider value={value}>
            <ThemeProvider>
                <LayoutContent {...props} />
            </ThemeProvider>
        </GlobalContext.Provider>
    );
};

// Separate component to consume the theme context
const LayoutContent = (props: any) => {
    const themeContext = useContext(ThemeContext);
    
    // Detect system preference for dark mode
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    
    // Use system preference if mode hasn't been set by user
    React.useEffect(() => {
        if (themeContext.mode === 'light' && prefersDarkMode) {
            // Only auto-switch to dark if user hasn't explicitly set light mode
            const userPreference = localStorage.getItem('themeMode');
            if (!userPreference) {
                themeContext.toggleColorMode();
            }
        }
    }, [prefersDarkMode, themeContext]);

    const theme = React.useMemo(
        () => createTheme({
            palette: {
                mode: themeContext.mode,
                primary: {
                    main: '#FF9800', // Orange from screenshot
                    light: '#FFB74D',
                    dark: '#F57C00',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: '#263238', // Dark blue/gray from screenshot header
                    light: '#4F5B62',
                    dark: '#000A12',
                    contrastText: '#FFFFFF',
                },
                background: {
                    default: themeContext.mode === 'dark' ? '#121212' : '#F5F5F5',
                    paper: themeContext.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
                },
                text: {
                    primary: themeContext.mode === 'dark' ? '#FFFFFF' : '#212121',
                    secondary: themeContext.mode === 'dark' ? '#B0BEC5' : '#757575',
                },
                divider: themeContext.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                error: {
                    main: '#F44336', // Error red
                },
                warning: {
                    main: '#FFC107', // Warning yellow
                },
                info: {
                    main: '#2196F3', // Info blue
                },
                success: {
                    main: '#4CAF50', // Success green
                },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            scrollbarColor: themeContext.mode === 'dark' ? "#6b6b6b #2b2b2b" : "#959595 #f5f5f5",
                            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                                backgroundColor: themeContext.mode === 'dark' ? "#2b2b2b" : "#f5f5f5",
                                width: '8px',
                            },
                            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                                borderRadius: 4,
                                backgroundColor: themeContext.mode === 'dark' ? "#6b6b6b" : "#959595",
                                minHeight: 24,
                            }
                        },
                    },
                },
                MuiAppBar: {
                    styleOverrides: {
                        root: {
                            backgroundColor: '#263238', // Dark color from screenshot header
                            color: '#ffffff',
                        },
                    },
                },
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: '4px',
                            textTransform: 'none',
                            fontWeight: 500,
                        },
                        contained: {
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            },
                        },
                        containedPrimary: {
                            backgroundColor: '#FF9800', // Orange button from screenshot
                            color: '#FFFFFF',
                            '&:hover': {
                                backgroundColor: '#F57C00',
                            },
                        },
                        outlined: {
                            borderColor: themeContext.mode === 'dark' ? 'rgba(255,255,255,0.23)' : 'rgba(0,0,0,0.23)',
                        },
                    },
                },
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            backgroundImage: 'none',
                        },
                        elevation1: {
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            backgroundImage: 'none',
                        },
                    },
                },
                MuiTextField: {
                    styleOverrides: {
                        root: {
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                            },
                        },
                    },
                },
            },
            typography: {
                fontFamily: [
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    'sans-serif',
                ].join(','),
                h1: {
                    fontWeight: 500,
                },
                h2: {
                    fontWeight: 500,
                },
                h3: {
                    fontWeight: 500,
                },
                h4: {
                    fontWeight: 500,
                },
                h5: {
                    fontWeight: 500,
                },
                h6: {
                    fontWeight: 500,
                },
                button: {
                    fontWeight: 500,
                },
            },
            shape: {
                borderRadius: 4,
            },
        }),
        [themeContext.mode]
    );

    return (
        <CartProvider>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                <SkipLink />
                <Header />
                <Box
                    component="main"
                    id="main-content"
                    sx={{
                        width: '100%',
                        bgcolor: 'background.default',
                        minHeight: 'calc(100vh - 128px)',
                        paddingBottom: '64px',
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    {props.children}
                </Box>
                <Footer />
            </MuiThemeProvider>
        </CartProvider>
    );
};

export default Layout