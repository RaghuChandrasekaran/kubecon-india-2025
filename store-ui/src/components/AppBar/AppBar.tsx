import React, { useEffect } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../layout/CartContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@mui/material/styles';
import ThemeContext from '../layout/ThemeContext';

const AppBar = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const theme = useTheme();
    const colorMode = React.useContext(ThemeContext);
    
    useEffect(() => {
        console.log("AppBar loaded with user icon - version 2");
    }, []);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <MuiAppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        E-Commerce Store
                    </Typography>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        onClick={colorMode.toggleColorMode}
                    >
                        {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/cart')}
                    >
                        <Badge badgeContent={cartCount} color="error">
                            <ShoppingCartIcon />
                        </Badge>
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/users')}
                    >
                        <PersonIcon />
                    </IconButton>
                    <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                </Toolbar>
            </MuiAppBar>
        </Box>
    );
}

export default AppBar;
