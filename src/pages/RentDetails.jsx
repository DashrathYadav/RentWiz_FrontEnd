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
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  AttachMoney,
  Person,
  Home,
  CalendarToday,
  Receipt,
  Payment
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { rentAPI } from '../services/api';

const RentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rent, setRent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchRentDetails();
  }, [id]);

  const fetchRentDetails = async () => {
    try {
      const response = await rentAPI.getById(id);
      setRent(response.data);
    } catch (error) {
      setError('Failed to load rent details');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/rents/edit/${id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await rentAPI.delete(id);
      navigate('/rents');
    } catch (error) {
      setError('Failed to delete rent record');
    }
    setDeleteDialogOpen(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <Payment sx={{ color: 'success.main' }} />;
      case 'Pending': return <CalendarToday sx={{ color: 'warning.main' }} />;
      case 'Overdue': return <Receipt sx={{ color: 'error.main' }} />;
      case 'Partial': return <AttachMoney sx={{ color: 'info.main' }} />;
      default: return <Receipt />;
    }
  };

  const isOverdue = () => {
    if (!rent) return false;
    const dueDate = new Date(rent.dueDate);
    const today = new Date();
    return dueDate < today && rent.paymentStatus !== 'Paid';
  };

  const getDaysUntilDue = () => {
    if (!rent) return 0;
    const dueDate = new Date(rent.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading rent details...</Typography>
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

  if (!rent) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Rent record not found</Alert>
      </Box>
    );
  }

  const daysUntilDue = getDaysUntilDue();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/rents')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Rent Payment Details
          </Typography>
          <Typography color="text.secondary">
            Payment ID: {rent.id}
          </Typography>
        </Box>
        <IconButton onClick={handleMenuClick}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} /> Edit Payment
          </MenuItem>
          <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Delete Payment
          </MenuItem>
        </Menu>
      </Box>

      <Grid container spacing={3}>
        {/* Payment Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {getStatusIcon(rent.paymentStatus)}
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6">
                  Payment Information
                </Typography>
                <Chip 
                  label={rent.paymentStatus} 
                  color={getPaymentStatusColor(rent.paymentStatus)}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Rent Amount
                </Typography>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                  ${rent.amount}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Date
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {new Date(rent.rentDate).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, color: isOverdue() ? 'error.main' : 'inherit' }}>
                  {new Date(rent.dueDate).toLocaleDateString()}
                  {isOverdue() && ' (Overdue)'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {rent.paymentMethod || 'Not specified'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {rent.transactionId || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Late Fee
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  ${rent.lateFee || 0}
                </Typography>
              </Grid>

              {rent.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1">
                      {rent.notes}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Tenant and Room Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Related Information
            </Typography>
            
            <Grid container spacing={3}>
              {rent.tenant && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            Tenant
                          </Typography>
                          <Typography color="text.secondary">
                            {rent.tenant.firstName} {rent.tenant.lastName}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Email: {rent.tenant.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {rent.tenant.phoneNumber}
                      </Typography>
                      <Button 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/tenants/${rent.tenant.id}`)}
                      >
                        View Tenant
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {rent.room && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                          <Home />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            Room
                          </Typography>
                          <Typography color="text.secondary">
                            Room {rent.room.roomNumber}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Property: {rent.room.property?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Rent: ${rent.room.rentAmount}
                      </Typography>
                      <Button 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/rooms/${rent.room.id}`)}
                      >
                        View Room
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Receipt sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Payment Summary</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Base Amount
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    ${rent.amount}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Late Fee
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, color: rent.lateFee > 0 ? 'error.main' : 'inherit' }}>
                    ${rent.lateFee || 0}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${(rent.amount + (rent.lateFee || 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Due Date Status</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {rent.paymentStatus === 'Paid' ? (
                    <Typography variant="body1" sx={{ color: 'success.main' }}>
                      ✓ Payment completed
                    </Typography>
                  ) : isOverdue() ? (
                    <Typography variant="body1" sx={{ color: 'error.main' }}>
                      ⚠ {Math.abs(daysUntilDue)} days overdue
                    </Typography>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'warning.main' }}>
                      📅 Due in {daysUntilDue} days
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Due: {new Date(rent.dueDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Quick Actions</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {rent.paymentStatus !== 'Paid' && (
                    <Button 
                      fullWidth 
                      variant="contained"
                      sx={{ mb: 1, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                      onClick={() => {
                        // Mark as paid functionality
                        const updatedRent = { ...rent, paymentStatus: 'Paid' };
                        rentAPI.update(rent.id, updatedRent).then(() => {
                          setRent(updatedRent);
                        });
                      }}
                    >
                      Mark as Paid
                    </Button>
                  )}
                  
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mb: 1 }}
                    onClick={() => navigate(`/rents/edit/${rent.id}`)}
                  >
                    Edit Payment
                  </Button>
                  
                  <Button 
                    fullWidth 
                    variant="outlined"
                    onClick={() => window.print()}
                  >
                    Print Receipt
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {rent.paymentStatus === 'Overdue' && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="body2">
                    This payment is overdue. Consider sending a reminder to the tenant or applying late fees.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Rent Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this rent payment record? This action cannot be undone.
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

export default RentDetails;
