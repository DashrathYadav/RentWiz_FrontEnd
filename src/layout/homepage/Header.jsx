import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Grid, Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLoginClick = () => {
        navigate('/login');
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const drawerContent = (
        <List>
            {['Blog', 'Free Tools', 'Resources', 'About Us'].map((text) => (
                <ListItem button key={text} component={Link} to="/" onClick={handleDrawerClose}>
                    <ListItemText primary={text} />
                </ListItem>
            ))}
        </List>
    );

    return (
        <AppBar sx={{ backgroundColor: '#ffffff', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
            <Toolbar>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
                            RentWiz
                        </Typography>
                    </Grid>
                    <Grid item sx={{ display: { xs: 'none', md: 'flex' }, gap: '2rem' }}>
                        <Link to="/" style={{ color: '#000000', textDecoration: 'none' }}>
                            Blog
                        </Link>
                        <Link to="/" style={{ color: '#000000', textDecoration: 'none' }}>
                            Free Tools
                        </Link>
                        <Link to="/" style={{ color: '#000000', textDecoration: 'none' }}>
                            Resources
                        </Link>
                        <Link to="/" style={{ color: '#000000', textDecoration: 'none' }}>
                            About Us
                        </Link>
                    </Grid>
                    <Grid item sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <Button
                            variant="contained"
                            onClick={handleLoginClick}
                            sx={{
                                backgroundColor: '#002856',
                                color: '#ffffff',
                                '&:hover': {
                                    backgroundColor: '#001a40',
                                },
                            }}
                        >
                            Login
                        </Button>
                    </Grid>
                    <Grid item sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton edge="start" color="red" aria-label="menu" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                            {drawerContent}
                        </Drawer>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
