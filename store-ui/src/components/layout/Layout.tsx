import React from "react"
import Header from "./Header/Header"
import Footer from "./Footer/Footer"
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ThemeContext from "./ThemeContext";
import GlobalContext from "./GlobalContext";
import { CartProvider } from "./CartContext";

const Layout = (props: any) => {
    const [mode, setMode] = React.useState<'light' | 'dark'>('light');

    const [data, setData] = React.useState({});
    const value = React.useMemo(
        () => ({ data, setData }),
        [data]
    );

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );

    return (
        <ThemeContext.Provider value={colorMode}>
            <GlobalContext.Provider value={value}>
                <CartProvider>
                    <ThemeProvider theme={theme}>
                        <Header />
                        <Box
                            sx={{
                                width: '100%',
                                bgcolor: 'background.default',
                                minHeight: 'calc(100vh - 128px)',
                                paddingBottom: '64px'
                            }}>
                            {props.children}
                        </Box>
                        <Footer />
                    </ThemeProvider>
                </CartProvider>
            </GlobalContext.Provider>
        </ThemeContext.Provider>
    )
}
export default Layout