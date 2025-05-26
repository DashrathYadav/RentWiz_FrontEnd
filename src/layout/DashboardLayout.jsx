import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    Hotel as RoomIcon,
    People as TenantsIcon,
    Payment as RentIcon,
    AccountCircle,
    Logout,
    Add as AddIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const DashboardLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Properties', icon: <HomeIcon />, path: '/properties' },
        { text: 'Rooms', icon: <RoomIcon />, path: '/rooms' },
        { text: 'Tenants', icon: <TenantsIcon />, path: '/tenants' },
        { text: 'Rents', icon: <RentIcon />, path: '/rents' }
    ];

    const createItems = [
        { text: 'New Property', path: '/properties/create' },
        { text: 'New Room', path: '/rooms/create' },
        { text: 'New Tenant', path: '/tenants/create' },
        { text: 'New Rent', path: '/rents/create' }
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const drawer = (
        <Box sx={{ bgcolor: '#000', height: '100%', color: '#fff' }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    RentWiz
                </Typography>
            </Toolbar>
            <Divider sx={{ borderColor: '#333' }} />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton 
                            onClick={() => handleNavigate(item.path)}
                            sx={{ 
                                color: '#fff',
                                '&:hover': { 
                                    backgroundColor: '#333' 
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: '#fff' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ borderColor: '#333' }} />
            <List>
                <ListItem>
                    <ListItemText 
                        primary="Quick Create" 
                        sx={{ color: '#fff', fontWeight: 'bold' }} 
                    />
                </ListItem>
                {createItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton 
                            onClick={() => handleNavigate(item.path)}
                            sx={{ 
                                color: '#fff',
                                '&:hover': { 
                                    backgroundColor: '#333' 
                                },
                                pl: 4
                            }}
                        >
                            <ListItemIcon sx={{ color: '#fff' }}>
                                <AddIcon />
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: '#000',
                    boxShadow: 'none',
                    borderBottom: '1px solid #333'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Property Management
                    </Typography>
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-controls="primary-search-account-menu"
                        aria-haspopup="true"
                        onClick={handleMenuOpen}
                        color="inherit"
                    >
                        <Avatar sx={{ bgcolor: '#333', width: 32, height: 32 }}>
                            {user.fullName?.charAt(0) || 'U'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        id="primary-search-account-menu"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                            <AccountCircle sx={{ mr: 1 }} />
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayout;