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
  TableRow,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  Person,
  Phone,
  Email,
  Home,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantAPI, rentTrackAPI } from '../services/api';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tenant, setTenant] = useState(null);
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchTenantDetails();
    fetchTenantRents();
  }, [id]);

  const fetchTenantDetails = async () => {
    try {
      const response = await tenantAPI.getById(id);
      
      // Handle nested response structure - backend returns Result<T> wrapper
      const tenantData = response.data?.data || response.data;
      
      // Map backend field names to match CreateTenantDto structure
      if (tenantData) {
        const mappedTenant = {
          ...tenantData,
          // Use DTO-compliant field names
          id: tenantData.tenantId,
          tenantName: tenantData.tenantName,
          tenantEmail: tenantData.tenantEmail,
          tenantMobile: tenantData.tenantMobile,
          tenantAdharId: tenantData.tenantAdharId,
          tenantRoomNo: tenantData.tenantRoomNo,
          isActive: tenantData.isActive,
          boardingDate: tenantData.boardingDate,
          note: tenantData.note,
          deposited: tenantData.deposited,
          presentRentValue: tenantData.presentRentValue,
          lockInPeriod: tenantData.lockInPeriod,
          // Keep legacy fields for backward compatibility
          firstName: tenantData.tenantName?.split(' ')[0] || tenantData.tenantName || '',
          lastName: tenantData.tenantName?.split(' ').slice(1).join(' ') || '',
          email: tenantData.tenantEmail,
          mobile: tenantData.tenantMobile,
          phone: tenantData.tenantMobile,
          roomNo: tenantData.tenantRoomNo,
          // Keep original fields as well for compatibility
          tenantName: tenantData.tenantName,
          tenantEmail: tenantData.tenantEmail,
          tenantMobile: tenantData.tenantMobile
        };
        
        setTenant(mappedTenant);
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      setError('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantRents = async () => {
    try {
      const response = await rentTrackAPI.getByTenant(id);
      const tenantRents = response.data.data || response.data || [];
      setRents(tenantRents.sort((a, b) => new Date(b.rentPeriodStartDate) - new Date(a.rentPeriodStartDate)));
    } catch (error) {
      console.error('Failed to load tenant rents:', error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/tenants/edit/${id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await tenantAPI.delete(id);
      navigate('/tenants');
    } catch (error) {
      setError('Failed to delete tenant');
    }
    setDeleteDialogOpen(false);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 3: return 'success'; // Fully Paid
      case 2: return 'info';    // Partially Paid
      case 1: return 'warning'; // Pending
      default: return 'default';
    }
  };

  const calculateTenantStats = () => {
    const totalPaid = rents.filter(r => r.status === 3).reduce((sum, r) => sum + (r.receivedRentValue || 0), 0);
    const totalPending = rents.filter(r => r.status === 1).reduce((sum, r) => sum + ((r.expectedRentValue || 0) - (r.receivedRentValue || 0)), 0);
    const totalPartial = rents.filter(r => r.status === 2).reduce((sum, r) => sum + ((r.expectedRentValue || 0) - (r.receivedRentValue || 0)), 0);
    
    return { totalPaid, totalPending, totalOverdue: totalPartial };
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading tenant details...</Typography>
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

  if (!tenant) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Tenant not found</Alert>
      </Box>
    );
  }

  const stats = calculateTenantStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/tenants')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          {tenant.tenantName || 'Unknown Tenant'}
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
            <Edit sx={{ mr: 1 }} /> Edit Tenant
          </MenuItem>
          <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Delete Tenant
          </MenuItem>
        </Menu>
      </Box>

      <Grid container spacing={3}>
        {/* Tenant Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                {tenant.tenantName?.charAt(0) || 'T'}
                {tenant.tenantName?.split(' ')[1]?.charAt(0) || ''}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {tenant.tenantName || 'Unknown Tenant'}
                </Typography>
                <Typography color="text.secondary">
                  Tenant ID: {tenant.id || tenant.tenantId}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tenant.tenantEmail || 'Not provided'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Mobile Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tenant.tenantMobile || 'Not provided'}
                </Typography>
              </Grid>

              {tenant.tenantAdharId && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Aadhaar ID
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ****-****-{tenant.tenantAdharId.slice(-4)}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Room Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tenant.tenantRoomNo || 'Not assigned'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <Chip
                    label={tenant.isActive ? 'Active' : 'Inactive'}
                    color={tenant.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Boarding Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tenant.boardingDate ? 
                    new Date(tenant.boardingDate).toLocaleDateString() : 'Not specified'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Leaving Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tenant.leavingDate ? 
                    new Date(tenant.leavingDate).toLocaleDateString() : 'Not specified'}
                </Typography>
              </Grid>

              {tenant.note && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {tenant.note}
                  </Typography>
                </Grid>
              )}

              {tenant.deposited && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Deposit Amount
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, color: 'success.main', fontWeight: 'bold' }}>
                    ₹{tenant.deposited.toLocaleString()}
                  </Typography>
                </Grid>
              )}

              {tenant.presentRentValue && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Rent
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ₹{tenant.presentRentValue.toLocaleString()}
                  </Typography>
                </Grid>
              )}

              {tenant.lockInPeriod && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Lock-in Period
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {tenant.lockInPeriod}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Rent History */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Rent History
              </Typography>
              <Button 
                variant="contained"
                sx={{ bgcolor: 'black', '&:hover': { bgcolor: 'grey.800' } }}
                onClick={() => navigate('/rent-tracks/create')}
              >
                Add Rent Track
              </Button>
            </Box>
            
            {rents.length === 0 ? (
              <Typography color="text.secondary">
                No rent records found for this tenant.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Period Start</TableCell>
                      <TableCell>Expected</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Received</TableCell>
                      <TableCell>Period End</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rents.map((rent) => (
                      <TableRow key={rent.id}>
                        <TableCell>
                          {new Date(rent.rentPeriodStartDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>₹{rent.expectedRentValue || 0}</TableCell>
                        <TableCell>
                          <Chip 
                            label={rent.status === 3 ? 'Fully Paid' : rent.status === 2 ? 'Partially Paid' : 'Pending'} 
                            color={getPaymentStatusColor(rent.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>₹{rent.receivedRentValue || 0}</TableCell>
                        <TableCell>
                          {new Date(rent.rentPeriodEndDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small"
                            onClick={() => navigate(`/rent-tracks/${rent.id}`)}
                          >
                            View
                          </Button>
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
                    <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Payment Summary</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Paid
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'success.main', mb: 1 }}>
                    ${stats.totalPaid}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Pending Amount
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'warning.main', mb: 1 }}>
                    ${stats.totalPending}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Overdue Amount
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'error.main' }}>
                    ${stats.totalOverdue}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Lease Information</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Lease Duration
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {tenant.leaseStartDate && tenant.leaseEndDate ? 
                      `${Math.ceil((new Date(tenant.leaseEndDate) - new Date(tenant.leaseStartDate)) / (1000 * 60 * 60 * 24 * 30))} months` :
                      'N/A'
                    }
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Lease Status
                  </Typography>
                  <Chip 
                    label={tenant.leaseEndDate && new Date(tenant.leaseEndDate) > new Date() ? 'Active' : 'Expired'}
                    color={tenant.leaseEndDate && new Date(tenant.leaseEndDate) > new Date() ? 'success' : 'error'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>

            {tenant.room && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Home sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Current Room</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Room Number: {tenant.room.roomNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Property: {tenant.room.property?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Rent: ${tenant.room.rentAmount}
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => navigate(`/rooms/${tenant.room.id}`)}
                    >
                      View Room Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">Quick Actions</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mb: 1 }}
                    onClick={() => navigate(`/rent-tracks/create?tenantId=${tenant.id}`)}
                  >
                    Record Payment
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mb: 1 }}
                    onClick={() => navigate(`/tenants/edit/${tenant.id}`)}
                  >
                    Edit Tenant
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined"
                    href={`mailto:${tenant.email}`}
                  >
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Tenant</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {tenant.firstName} {tenant.lastName}? This action cannot be undone.
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

export default TenantDetails;
