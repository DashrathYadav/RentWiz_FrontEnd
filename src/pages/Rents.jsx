import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  AttachMoney,
  FilterList,
  Payment,
  TrendingUp,
  AccountBalance,
  CalendarMonth
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { rentAPI, tenantAPI } from '../services/api';

const Rents = () => {
  const navigate = useNavigate();
  const [rents, setRents] = useState([]);
  const [filteredRents, setFilteredRents] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rent: null });
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingAmount: 0,
    thisMonthTotal: 0,
    overdueCount: 0
  });

  useEffect(() => {
    fetchRents();
    fetchTenants();
  }, []);

  useEffect(() => {
    filterRents();
    calculateStats();
  }, [searchTerm, filterStatus, filterMonth, rents]);

  const fetchRents = async () => {
    try {
      setLoading(true);
      const response = await rentAPI.getAll();
      setRents(response.data || []);
    } catch (error) {
      console.error('Error fetching rents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await tenantAPI.getAll();
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const filterRents = () => {
    let filtered = rents;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(rent => {
        const tenant = getTenantName(rent.tenantId);
        return tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
               rent.amount?.toString().includes(searchTerm);
      });
    }

    // Status filter
    if (filterStatus) {
      if (filterStatus === 'paid') {
        filtered = filtered.filter(rent => rent.isPaid);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(rent => !rent.isPaid);
      } else if (filterStatus === 'overdue') {
        filtered = filtered.filter(rent => 
          !rent.isPaid && new Date(rent.dueDate) < new Date()
        );
      }
    }

    // Month filter
    if (filterMonth) {
      filtered = filtered.filter(rent => {
        const rentDate = new Date(rent.dueDate);
        return rentDate.getMonth() === parseInt(filterMonth);
      });
    }

    setFilteredRents(filtered);
  };

  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentDate = new Date();
    
    const totalCollected = rents
      .filter(rent => rent.isPaid)
      .reduce((sum, rent) => sum + rent.amount, 0);
    
    const pendingAmount = rents
      .filter(rent => !rent.isPaid)
      .reduce((sum, rent) => sum + rent.amount, 0);
    
    const thisMonthTotal = rents
      .filter(rent => new Date(rent.dueDate).getMonth() === currentMonth)
      .reduce((sum, rent) => sum + rent.amount, 0);
    
    const overdueCount = rents
      .filter(rent => !rent.isPaid && new Date(rent.dueDate) < currentDate)
      .length;

    setStats({
      totalCollected,
      pendingAmount,
      thisMonthTotal,
      overdueCount
    });
  };

  const handleDelete = async () => {
    try {
      await rentAPI.delete(deleteDialog.rent.id);
      setDeleteDialog({ open: false, rent: null });
      fetchRents();
    } catch (error) {
      console.error('Error deleting rent:', error);
    }
  };

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown Tenant';
  };

  const getPaymentStatusColor = (rent) => {
    if (rent.isPaid) return 'success';
    if (new Date(rent.dueDate) < new Date()) return 'error';
    return 'warning';
  };

  const getPaymentStatusLabel = (rent) => {
    if (rent.isPaid) return 'Paid';
    if (new Date(rent.dueDate) < new Date()) return 'Overdue';
    return 'Pending';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterMonth('');
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading rent records...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="#000" fontWeight="bold">
          Rent Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/rents/create')}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': { backgroundColor: '#333' }
          }}
        >
          Record Payment
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Total Collected
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    ${stats.totalCollected.toLocaleString()}
                  </Typography>
                </Box>
                <Payment sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Pending Amount
                  </Typography>
                  <Typography variant="h5" color="warning.main" fontWeight="bold">
                    ${stats.pendingAmount.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalance sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    This Month
                  </Typography>
                  <Typography variant="h5" color="#000" fontWeight="bold">
                    ${stats.thisMonthTotal.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#000' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Overdue
                  </Typography>
                  <Typography variant="h5" color="error.main" fontWeight="bold">
                    {stats.overdueCount}
                  </Typography>
                </Box>
                <CalendarMonth sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box mb={3}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search by tenant name or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              label="Month"
            >
              <MenuItem value="">All Months</MenuItem>
              {months.map((month, index) => (
                <MenuItem key={index} value={index}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(searchTerm || filterStatus || filterMonth) && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>

      {/* Rents Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRents.length > 0 ? (
              filteredRents.map((rent) => (
                <TableRow key={rent.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {getTenantName(rent.tenantId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <AttachMoney sx={{ mr: 0.5, color: '#666', fontSize: 16 }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        {rent.amount?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(rent.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {rent.paymentDate 
                      ? new Date(rent.paymentDate).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentStatusLabel(rent)}
                      color={getPaymentStatusColor(rent)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {rent.paymentMethod || 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/rents/${rent.id}`)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/rents/${rent.id}/edit`)}
                      title="Edit Record"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, rent })}
                      title="Delete Record"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={4}>
                    <AttachMoney sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No rent records found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {searchTerm || filterStatus || filterMonth
                        ? 'Try adjusting your search terms or filters'
                        : 'Get started by recording your first rent payment'
                      }
                    </Typography>
                    {!searchTerm && !filterStatus && !filterMonth && (
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/rents/create')}
                        sx={{
                          backgroundColor: '#000',
                          color: '#fff',
                          '&:hover': { backgroundColor: '#333' }
                        }}
                      >
                        Record First Payment
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="record payment"
        onClick={() => navigate('/rents/create')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#000',
          '&:hover': { backgroundColor: '#333' }
        }}
      >
        <Add />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, rent: null })}
      >
        <DialogTitle>Delete Rent Record</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this rent record? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, rent: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rents;
