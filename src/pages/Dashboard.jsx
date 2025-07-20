import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button
} from '@mui/material';
import {
  Home,
  People,
  AttachMoney,
  Room,
  Visibility,
  Edit,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  propertyAPI, 
  tenantAPI, 
  rentTrackAPI, 
  roomAPI 
} from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    totalRooms: 0,
    monthlyRevenue: 0
  });
  const [recentRents, setRecentRents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      // Fetch all data in parallel using owner-specific endpoints
      const [properties, tenants, rooms, rentTracks] = await Promise.all([
        propertyAPI.getByOwner(ownerId),
        tenantAPI.getByOwner(ownerId),
        roomAPI.getByOwner(ownerId),
        rentTrackAPI.getByOwner(ownerId)
      ]);

      // Check if the response has data property or if the data is directly in response.data.data
      const propertiesData = properties.data?.data || properties.data || [];
      const tenantsData = tenants.data?.data || tenants.data || [];
      const roomsData = rooms.data?.data || rooms.data || [];
      const rentTracksData = rentTracks.data?.data || rentTracks.data || [];

      // Calculate stats
      setStats({
        totalProperties: Array.isArray(propertiesData) ? propertiesData.length : 0,
        totalTenants: Array.isArray(tenantsData) ? tenantsData.length : 0,
        totalRooms: Array.isArray(roomsData) ? roomsData.length : 0,
        monthlyRevenue: Array.isArray(rentTracksData) ? rentTracksData.reduce((total, rentTrack) => total + (rentTrack.receivedRentValue || 0), 0) : 0
      });

      // Set recent rent tracks (last 5)
      setRecentRents(Array.isArray(rentTracksData) ? rentTracksData.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = '#000' }) => (
    <Card sx={{ height: '100%', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color} fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickAction = ({ title, description, onClick, icon }) => (
    <Card sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }} onClick={onClick}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          {icon}
          <Typography variant="h6" ml={1}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom color="#000" fontWeight="bold">
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={<Home sx={{ fontSize: 40 }} />}
            color="#000"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tenants"
            value={stats.totalTenants}
            icon={<People sx={{ fontSize: 40 }} />}
            color="#000"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon={<Room sx={{ fontSize: 40 }} />}
            color="#000"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="#000"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <QuickAction
                title="Add Property"
                description="Create a new property listing"
                onClick={() => navigate('/properties/create')}
                icon={<Add />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <QuickAction
                title="Add Tenant"
                description="Register a new tenant"
                onClick={() => navigate('/tenants/create')}
                icon={<People />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <QuickAction
                title="Add Room"
                description="Create a new room"
                onClick={() => navigate('/rooms/create')}
                icon={<Room />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <QuickAction
                title="Record Rent"
                description="Record rent payment"
                onClick={() => navigate('/rent-tracks/create')}
                icon={<AttachMoney />}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Rent Tracks */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
            Recent Rent Tracks
          </Typography>
          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Expected</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRents.length > 0 ? (
                  recentRents.map((rentTrack) => (
                    <TableRow key={rentTrack.id}>
                      <TableCell>{rentTrack.tenant?.tenantName || 'N/A'}</TableCell>
                      <TableCell>₹{rentTrack.expectedRentValue || 0}</TableCell>
                      <TableCell>₹{rentTrack.receivedRentValue || 0}</TableCell>
                      <TableCell>
                        {rentTrack.rentPeriodStartDate ? 
                          new Date(rentTrack.rentPeriodStartDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            rentTrack.status === 3 ? 'Fully Paid' : 
                            rentTrack.status === 2 ? 'Partially Paid' : 'Pending'
                          }
                          color={
                            rentTrack.status === 3 ? 'success' : 
                            rentTrack.status === 2 ? 'info' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/rent-tracks/${rentTrack.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/rent-tracks/edit/${rentTrack.id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data">
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">
                        No recent rent tracks found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;