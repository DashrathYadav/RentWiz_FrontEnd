import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  Bed,
  AttachMoney,
  Person,
  CalendarToday
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI, rentAPI } from '../services/api';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
    fetchRoomRents();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const response = await roomAPI.getById(id);
      setRoom(response.data);
    } catch (error) {
      setError('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomRents = async () => {
    try {
      const response = await rentAPI.getAll();
      const roomRents = response.data.filter(rent => rent.roomId === parseInt(id));
      setRents(roomRents);
    } catch (error) {
      console.error('Failed to load room rents:', error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/rooms/edit/${id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await roomAPI.delete(id);
      navigate('/rooms');
    } catch (error) {
      setError('Failed to delete room');
    }
    setDeleteDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Occupied': return 'primary';
      case 'Maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      case 'Partial': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading room details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Room not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/rooms')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Room {room.roomNumber}
        </Typography>
        <IconButton onClick={handleMenuClick}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} /> Edit Room
          </MenuItem>
          <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Delete Room
          </MenuItem>
        </Menu>
      </Box>

      <Grid container spacing={3}>
        {/* Room Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Room Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Room Number
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {room.roomNumber}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={room.status} 
                  color={getStatusColor(room.status)}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Rent Amount
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  ${room.rentAmount}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Property
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {room.property?.name || 'N/A'}
                </Typography>
              </Grid>

              {room.tenant && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Tenant
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {room.tenant.firstName} {room.tenant.lastName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Lease Start Date
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {room.tenant.leaseStartDate ? 
                        new Date(room.tenant.leaseStartDate).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                </>
              )}

              {room.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {room.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Rent History */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Rent History
            </Typography>
            
            {rents.length === 0 ? (
              <Typography color="text.secondary">
                No rent records found for this room.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rents.map((rent) => (
                      <TableRow key={rent.id}>
                        <TableCell>
                          {new Date(rent.rentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${rent.amount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={rent.paymentStatus} 
                            color={getPaymentStatusColor(rent.paymentStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{rent.paymentMethod || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(rent.dueDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Bed sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Room Details</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Type: Standard Room
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Floor: {room.floor || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Size: {room.size || 'N/A'} sq ft
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Financial</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Monthly Rent: ${room.rentAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Collected: ${rents.reduce((sum, rent) => 
                      rent.paymentStatus === 'Paid' ? sum + rent.amount : sum, 0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Amount: ${rents.reduce((sum, rent) => 
                      rent.paymentStatus === 'Pending' ? sum + rent.amount : sum, 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {room.tenant && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="h6">Tenant Info</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Name: {room.tenant.firstName} {room.tenant.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {room.tenant.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {room.tenant.phoneNumber}
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => navigate(`/tenants/${room.tenant.id}`)}
                    >
                      View Tenant Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete room {room.roomNumber}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomDetails;
