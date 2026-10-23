import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import GavelIcon from '@mui/icons-material/Gavel';
import QueueIcon from '@mui/icons-material/Queue';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import LogoutIcon from '@mui/icons-material/Logout';

const DRAWER_WIDTH = 260;

const navItems = [
  { path: '/employee/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/employee/customers', label: 'Customers', icon: <PeopleIcon /> },
  { path: '/employee/approvals', label: 'Pending Approvals', icon: <CheckCircleIcon /> },
  { path: '/employee/transactions', label: 'Transactions', icon: <ReceiptIcon /> },
  { path: '/employee/disputes', label: 'Disputes', icon: <GavelIcon /> },
  { path: '/employee/queue', label: 'Branch Queue', icon: <QueueIcon /> },
  { path: '/employee/service-requests', label: 'Service Requests', icon: <SupportAgentIcon /> },
  { path: '/employee/feedback', label: 'Feedback', icon: <ThumbUpIcon /> },
];

export default function EmployeeLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawer = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        maxWidth: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font)',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'var(--font)' }}>
          Smart Fin Hub
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'var(--font)' }}>
          Employee Portal
        </Typography>
      </Box>
      <List sx={{ flex: 1, px: 1, py: 2, overflow: 'auto', minHeight: 0 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => isMobile && setDrawerOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              fontFamily: 'var(--font)',
              '&.active': {
                bgcolor: 'primary.main',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, flexShrink: 0 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ noWrap: true, fontFamily: 'var(--font)' }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom noWrap sx={{ fontFamily: 'var(--font)' }}>
          {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom noWrap sx={{ fontFamily: 'var(--font)' }}>
          {user?.employee_id || 'Employee'}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
          sx={{ fontFamily: 'var(--font)' }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', maxHeight: '100vh', bgcolor: '#f8fafc', overflow: 'hidden', fontFamily: 'var(--font)' }}>
      {/* Mobile AppBar */}
      <AppBar position="fixed" sx={{ display: { md: 'none' }, fontFamily: 'inherit' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontFamily: 'var(--font)' }}>Employee Portal</Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            maxWidth: '85vw',
            height: '100vh',
            maxHeight: '100vh',
            overflowX: 'hidden',
            fontFamily: 'var(--font)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            maxWidth: '100%',
            borderRight: 1,
            borderColor: 'divider',
            top: 0,
            height: '100vh',
            maxHeight: '100vh',
            overflowX: 'hidden',
            fontFamily: 'var(--font)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content - margin so it never sits behind the fixed sidebar */}
      <Box
        ref={mainRef}
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: 0,
          p: 3,
          width: '100%',
          maxWidth: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: { xs: 7, md: 0 },
          maxHeight: { xs: 'calc(100vh - 56px)', md: '100%' },
          overflowY: 'auto',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
