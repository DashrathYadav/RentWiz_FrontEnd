import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Add,
  Room,
  People,
  AttachMoney,
  Home,
  LocationOn,
  Visibility
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI, roomAPI } from '../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      fetchPropertyRooms();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await propertyAPI.getById(id);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property details:', error);
    }
  };

  const fetchPropertyRooms = async () => {
    try {
      // Get all rooms and filter by property ID
      const response = await roomAPI.getAll();
      const propertyRooms = response.data?.filter(room => room.propertyId === parseInt(id)) || [];
      setRooms(propertyRooms);
    } catch (error) {
      console.error('Error fetching property rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await propertyAPI.delete(id);
      navigate('/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const getPropertyTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'apartment': return 'primary';
      case 'house': return 'success';
      case 'condo': return 'warning';
      case 'commercial': return 'error';
      default: return 'default';
    }
  };

  const getRoomStatusColor = (isOccupied) => {
    return isOccupied ? 'error' : 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading property details...</Typography>
      </Box>
    );
  }

  if (!property) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Property not found
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/properties')}>
          Back to Properties
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/properties')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" color="#000" fontWeight="bold">
            {property.name}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/properties/${id}/edit`)}
            sx={{ mr: 1, borderColor: '#000', color: '#000' }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={() => setDeleteDialog(true)}
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Property Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                Property Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Property Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Type
                  </Typography>
                  <Box mb={2}>
                    <Chip
                      label={property.type || 'Unknown'}
                      color={getPropertyTypeColor(property.type)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.description || 'No description available'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn sx={{ mr: 1, color: '#666' }} />
                    <Typography variant="body1">
                      {property.address || 'No address provided'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Property Value
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.value ? `$${property.value.toLocaleString()}` : 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Box>
                    <Chip
                      label={property.isActive ? 'Active' : 'Inactive'}
                      color={property.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Rooms Section */}
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="#000" fontWeight="bold">
                  Rooms ({rooms.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate(`/rooms/create?propertyId=${id}`)}
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#333' }
                  }}
                >
                  Add Room
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {rooms.length > 0 ? (
                <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>Room Number</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Rent Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Room sx={{ mr: 1, color: '#666' }} />
                              {room.roomNumber}
                            </Box>
                          </TableCell>
                          <TableCell>{room.type || 'Standard'}</TableCell>
                          <TableCell>
                            ${room.rentAmount?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={room.isOccupied ? 'Occupied' : 'Available'}
                              color={getRoomStatusColor(room.isOccupied)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/rooms/${room.id}`)}
                              title="View Room"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/rooms/${room.id}/edit`)}
                              title="Edit Room"
                            >
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Room sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No rooms added yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Add rooms to this property to start managing tenants and rent
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate(`/rooms/create?propertyId=${id}`)}
                    sx={{
                      backgroundColor: '#000',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#333' }
                    }}
                  >
                    Add First Room
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                Quick Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" alignItems="center" mb={2}>
                <Room sx={{ mr: 2, color: '#666' }} />
                <Box>
                  <Typography variant="h6">{rooms.length}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Rooms
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <People sx={{ mr: 2, color: '#666' }} />
                <Box>
                  <Typography variant="h6">
                    {rooms.filter(room => room.isOccupied).length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Occupied Rooms
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoney sx={{ mr: 2, color: '#666' }} />
                <Box>
                  <Typography variant="h6">
                    ${rooms.reduce((total, room) => total + (room.rentAmount || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Monthly Rent
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center">
                <Home sx={{ mr: 2, color: '#666' }} />
                <Box>
                  <Typography variant="h6">
                    {rooms.length > 0 ? Math.round((rooms.filter(room => room.isOccupied).length / rooms.length) * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Occupancy Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{property.name}"? 
            This action cannot be undone and will also delete all associated rooms.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyDetails;
