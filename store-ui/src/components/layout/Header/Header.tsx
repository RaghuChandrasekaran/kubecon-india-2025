import React, { useState, useRef, useEffect } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@mui/material/styles';
import ThemeContext from '../ThemeContext';
import { Container, Tabs, Tab, useMediaQuery, Menu, MenuItem, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { styled, alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';

// Styled search component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// Styled skip link that properly handles focus state
const SkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  '&:focus': {
    position: 'fixed',
    top: '0',
    left: '0',
    width: 'auto',
    height: 'auto',
    padding: '12px',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    zIndex: 9999,
    textDecoration: 'none',
    fontWeight: 'bold',
    borderRadius: '0 0 4px 0',
  }
}));

// Styled enhanced cart badge wrapper with improved touch target
const EnhancedCartBadge = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Larger touch target area (44px is accessibility recommendation)
  minWidth: '44px',
  minHeight: '44px',
  borderRadius: '50%',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Pulse animation when cart has items
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.2)',
    },
    '70%': {
      boxShadow: '0 0 0 8px rgba(255, 255, 255, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
    },
  },
}));

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount } = useCart();
    const theme = useTheme();
    const colorMode = React.useContext(ThemeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const firstFocusableElementRef = useRef<HTMLInputElement>(null);

    const categories = [
        { name: 'Top Offers', path: '/' },
        { name: 'Electronics', path: '/category/electronics' },
        { name: 'Fashion', path: '/category/fashion' },
        { name: 'Grocery', path: '/category/grocery' },
        { name: 'Mobiles', path: '/category/mobiles' },
        { name: 'Appliances', path: '/category/appliances' },
        { name: 'Home', path: '/category/home' },
        { name: 'Toys', path: '/category/toys' }
    ];

    // Set active tab based on current route
    useEffect(() => {
        const currentPath = location.pathname;
        
        // Find the matching category index
        const activeTabIndex = categories.findIndex(category => 
            // Check for exact match or if we're on the home page
            category.path === currentPath || 
            // Special case for home page
            (category.path === '/' && currentPath === '/')
        );
        
        // If found, set it as current tab
        if (activeTabIndex !== -1) {
            setCurrentTab(activeTabIndex);
        } else {
            // If on a product page or other page, try to match the category from URL
            const categoryMatch = categories.findIndex(category => 
                currentPath.includes(category.path) && category.path !== '/'
            );
            
            if (categoryMatch !== -1) {
                setCurrentTab(categoryMatch);
            } else {
                // Default to home tab if no match
                setCurrentTab(0);
            }
        }
    }, [location.pathname]);

    // Store tab state in session storage
    useEffect(() => {
        try {
            sessionStorage.setItem('lastActiveTab', currentTab.toString());
        } catch (error) {
            console.error('Failed to save tab state:', error);
        }
    }, [currentTab]);

    // Load tab state from session storage on initial render
    useEffect(() => {
        try {
            const savedTab = sessionStorage.getItem('lastActiveTab');
            if (savedTab !== null) {
                const tabIndex = parseInt(savedTab, 10);
                // Only set if it's a valid index and not already set by the route matching
                if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < categories.length) {
                    setCurrentTab(tabIndex);
                }
            }
        } catch (error) {
            console.error('Failed to load tab state:', error);
        }
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        navigate(categories[newValue].path);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setMobileMenuOpen(false);
        }
    };

    // Focus management for mobile drawer
    useEffect(() => {
        if (mobileMenuOpen && firstFocusableElementRef.current) {
            // Focus first element when drawer opens
            firstFocusableElementRef.current.focus();
        } else if (!mobileMenuOpen && menuButtonRef.current) {
            // Return focus to menu button when drawer closes
            menuButtonRef.current.focus();
        }
    }, [mobileMenuOpen]);

    const handleSearch = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Skip to content link for accessibility */}
            <SkipLink href="#main-content">
                Skip to main content
            </SkipLink>
            <MuiAppBar 
                position="static" 
                elevation={4}
                sx={{
                    backgroundColor: '#232F3E', // Amazon's dark navy color
                    color: '#fff'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar>
                        {isMobile && (
                            <IconButton
                                ref={menuButtonRef}
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="Main menu"
                                aria-controls="mobile-navigation-drawer"
                                aria-expanded={mobileMenuOpen}
                                onClick={toggleMobileMenu}
                                sx={{ mr: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ 
                                flexGrow: isMobile ? 1 : 0, 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                letterSpacing: '0.5px',
                                marginRight: 2
                            }}
                            onClick={() => navigate('/')}
                            tabIndex={0}
                            role="link"
                            aria-label="Home page"
                            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && navigate('/')}
                        >
                            E-Commerce Store
                        </Typography>

                        {!isMobile && (
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search products…"
                                    inputProps={{ 'aria-label': 'search products' }}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearch}
                                    ref={searchInputRef}
                                />
                            </Search>
                        )}

                        <Box sx={{ flexGrow: 1 }} />

                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={colorMode.toggleColorMode}
                            sx={{ ml: 1 }}
                            aria-label={theme.palette.mode === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>

                        {/* Enhanced Cart Badge */}
                        <EnhancedCartBadge>
                            <IconButton
                                size="large"
                                color="inherit"
                                onClick={() => navigate('/cart')}
                                aria-label={`Shopping cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
                                sx={{
                                    position: 'relative',
                                    animation: cartCount > 0 ? 'pulse 2s infinite' : 'none',
                                    minWidth: '44px',
                                    minHeight: '44px',
                                }}
                            >
                                <Badge 
                                    badgeContent={cartCount} 
                                    color="error"
                                    showZero
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            minWidth: '22px',
                                            height: '22px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            borderRadius: '11px',
                                            // Improved visibility with larger offset and outline
                                            transform: 'scale(1.2) translate(30%, -30%)',
                                            padding: '0 6px',
                                            // Add white outline for better contrast
                                            border: theme.palette.mode === 'dark' ? '2px solid #1a237e' : '2px solid #1976d2',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        }
                                    }}
                                    // Improved position for badge
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    // Using component prop for accessibility instead of slotProps
                                    componentsProps={{
                                        badge: { 'aria-live': 'polite' }
                                    }}
                                >
                                    <ShoppingCartIcon fontSize="medium" />
                                </Badge>
                            </IconButton>
                        </EnhancedCartBadge>

                        <Button 
                            color="inherit" 
                            onClick={() => navigate('/login')}
                            startIcon={<PersonIcon />}
                            sx={{ 
                                ml: 1, 
                                display: { xs: 'none', sm: 'flex' },
                                // Add minimum touch target size for button
                                minHeight: '44px',
                            }}
                            aria-label="Login or view account"
                        >
                            Login
                        </Button>
                    </Toolbar>
                </Container>

                {!isMobile && (
                    <Box sx={{ backgroundColor: '#37474F' }}> {/* Darker grey-blue instead of bright blue */}
                        <Container maxWidth="xl">
                            <Tabs 
                                value={currentTab}
                                onChange={handleTabChange}
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
                                        backgroundColor: '#FF9800', // Orange indicator instead of white
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
                )}
            </MuiAppBar>

            {/* Mobile Navigation Drawer with improved accessibility */}
            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Main navigation menu"
                onKeyDown={handleKeyDown}
                id="mobile-navigation-drawer"
                ModalProps={{
                    // Trap focus within the drawer
                    disableEnforceFocus: false,
                    // Return focus to menu button when closed
                    onClose: () => {
                        setMobileMenuOpen(false);
                        if (menuButtonRef.current) {
                            menuButtonRef.current.focus();
                        }
                    }
                }}
            >
                <Box
                    sx={{ width: 250 }}
                    role="navigation"
                    aria-label="Main navigation"
                >
                    <List component="nav" aria-label="Category navigation">
                        <ListItem>
                            <Search sx={{ width: '100%' }}>
                                <SearchIconWrapper>
                                    <SearchIcon aria-hidden="true" />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search products…"
                                    inputProps={{ 
                                        'aria-label': 'search products',
                                        'aria-describedby': 'mobile-search-help'
                                    }}
                                    sx={{ width: '100%' }}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearch}
                                    ref={firstFocusableElementRef}
                                />
                                {/* Hidden help text for screen readers */}
                                <Box 
                                    id="mobile-search-help" 
                                    sx={{ 
                                        position: 'absolute', 
                                        left: '-10000px',
                                        top: 'auto',
                                        width: '1px',
                                        height: '1px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    Press Enter to search for products
                                </Box>
                            </Search>
                        </ListItem>
                        <Divider />
                        {categories.map((category, index) => (
                            <ListItem 
                                key={category.name} 
                                disablePadding
                            >
                                <Button
                                    fullWidth
                                    onClick={() => {
                                        navigate(category.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    role="menuitem"
                                    aria-label={`Navigate to ${category.name} category`}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        textTransform: 'none',
                                        py: 1.5,
                                        px: 2,
                                        color: 'text.primary',
                                        '&:focus-visible': {
                                            outline: `2px solid ${theme.palette.primary.main}`,
                                            outlineOffset: '-2px',
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        }
                                    }}
                                >
                                    {category.name}
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <main id="main-content" tabIndex={-1}>
                {/* Main content will be here */}
            </main>
        </Box>
    );
}

export default Header;