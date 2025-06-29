import React, { useState } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import { useNavigate } from 'react-router-dom';
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

const Header = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const theme = useTheme();
    const colorMode = React.useContext(ThemeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        navigate(categories[newValue].path);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

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
            <MuiAppBar 
                position="static" 
                elevation={4}
                sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
                    color: '#fff'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar>
                        {isMobile && (
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
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
                                    inputProps={{ 'aria-label': 'search' }}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearch}
                                />
                            </Search>
                        )}

                        <Box sx={{ flexGrow: 1 }} />

                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={colorMode.toggleColorMode}
                            sx={{ ml: 1 }}
                            aria-label="toggle dark mode"
                        >
                            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>

                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={() => navigate('/cart')}
                            sx={{ ml: 1 }}
                            aria-label="shopping cart"
                        >
                            <Badge badgeContent={cartCount} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>

                        <Button 
                            color="inherit" 
                            onClick={() => navigate('/login')}
                            startIcon={<PersonIcon />}
                            sx={{ ml: 1, display: { xs: 'none', sm: 'flex' } }}
                        >
                            Login
                        </Button>
                    </Toolbar>
                </Container>

                {!isMobile && (
                    <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#121858' : '#1565c0' }}>
                        <Container maxWidth="xl">
                            <Tabs 
                                value={currentTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                textColor="inherit"
                                indicatorColor="secondary"
                                aria-label="category navigation"
                                sx={{
                                    '& .MuiTab-root': {
                                        minWidth: 100,
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#ffffff',
                                    }
                                }}
                            >
                                {categories.map((category, index) => (
                                    <Tab key={index} label={category.name} />
                                ))}
                            </Tabs>
                        </Container>
                    </Box>
                )}
            </MuiAppBar>

            {/* Mobile Navigation Drawer */}
            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={toggleMobileMenu}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleMobileMenu}
                >
                    <List>
                        <ListItem>
                            <Search sx={{ width: '100%' }}>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search products…"
                                    inputProps={{ 'aria-label': 'search' }}
                                    sx={{ width: '100%' }}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearch}
                                />
                            </Search>
                        </ListItem>
                        <Divider />
                        {categories.map((category, index) => (
                            <ListItem button key={category.name} onClick={() => navigate(category.path)}>
                                <ListItemText primary={category.name} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </Box>
    );
}

export default Header;