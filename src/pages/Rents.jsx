import React, { useState, useEffect, useCallback } from 'react';
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
  Grid,
  Pagination,
  Stack
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
  CalendarMonth,
  Clear
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { rentAPI, tenantAPI } from '../services/api';
import { debounce } from 'lodash';

const Rents = () => {
  const navigate = useNavigate();
  
  // Main state
  const [rents, setRents] = useState([]);
  const [filteredRents, setFilteredRents] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    month: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  
  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rent: null });
  
  // Stats state
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingAmount: 0,
    thisMonthTotal: 0,
    overdueCount: 0
  });

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((search, currentFilters, currentPagination) => {
      fetchRents(search, currentFilters, currentPagination);
    }, 500),
    []
  );

  useEffect(() => {
    fetchTenants();
    fetchRents();
  }, []);

  useEffect(() => {
    // Reset pagination when search or filters change
    debouncedFetch(searchTerm, filters, { ...pagination, pageNumber: 0 });
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  }, [searchTerm, filters, debouncedFetch]);

  const fetchRents = async (search = searchTerm, currentFilters = filters, currentPagination = pagination) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        pageNumber: currentPagination.pageNumber + 1, // Convert 0-based to 1-based pagination
        pageSize: currentPagination.pageSize
      };

      // Add search term if present
      if (search) {
        searchParams.searchTerm = search;
      }

      // Add filter parameters
      if (currentFilters.status) {
        if (currentFilters.status === 'paid') {
          // Add paid status filter - this might need to be mapped to backend field
          searchParams.status = 1; // Assuming 1 = paid
        } else if (currentFilters.status === 'pending') {
          searchParams.status = 0; // Assuming 0 = pending
        } else if (currentFilters.status === 'overdue') {
          searchParams.status = 2; // Assuming 2 = overdue
        }
      }

      if (currentFilters.month) {
        // Add date range for the selected month
        const year = new Date().getFullYear();
        const monthIndex = parseInt(currentFilters.month);
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0);
        
        searchParams.rentPeriodStartFrom = startDate.toISOString();
        searchParams.rentPeriodStartTo = endDate.toISOString();
      }

      const response = await rentAPI.search(searchParams);
      
      if (response.data && response.data.data) {
        // Handle the correct response structure from backend
        const pagedData = response.data.data;
        
        // Map backend fields to frontend expected fields
        const mappedRents = (pagedData.data || []).map(rent => ({
          id: rent.rentId,
          tenantId: rent.tenantId,
          roomId: rent.roomId,
          propertyId: rent.propertyId,
          amount: rent.expectedRentValue || rent.receivedRentValue || 0,
          expectedAmount: rent.expectedRentValue,
          receivedAmount: rent.receivedRentValue,
          rentDate: rent.rentPeriodStartDate,
          dueDate: rent.rentPeriodEndDate,
          isPaid: rent.status === 1, // Assuming 1 = paid
          paymentStatus: rent.status === 1 ? 'Paid' : (rent.status === 2 ? 'Overdue' : 'Pending'),
          note: rent.note,
          currencyCode: rent.currencyCode,
          // Keep original fields as well for compatibility
          ...rent
        }));
        
        setRents(mappedRents);
        setFilteredRents(mappedRents); // Set filtered rents same as rents since server-side filtering
        
        setPagination(prev => ({
          ...prev,
          totalCount: pagedData.totalRecords || 0,
          totalPages: pagedData.totalPages || 0
        }));

        // Calculate stats from current page data (for now)
        calculateStats(mappedRents);
      }
    } catch (error) {
      console.error('Error fetching rents:', error);
      setError('Failed to load rents. Please try again.');
      setRents([]);
      setFilteredRents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      const response = await tenantAPI.getByOwner(ownerId);
      // Handle nested data structure and map backend fields to frontend expected fields
      const tenantsData = response.data?.data || response.data || [];
      
      const mappedTenants = Array.isArray(tenantsData) ? tenantsData.map(tenant => ({
        id: tenant.tenantId,
        firstName: tenant.tenantName?.split(' ')[0] || '',
        lastName: tenant.tenantName?.split(' ').slice(1).join(' ') || '',
        email: tenant.tenantEmail,
        phoneNumber: tenant.tenantMobile,
        roomId: tenant.roomId,
        // Keep original fields as well for compatibility
        ...tenant
      })) : [];
      setTenants(mappedTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
  };

  const handlePageChange = (event, newPage) => {
    const newPagination = {
      ...pagination,
      pageNumber: newPage - 1 // Keep internal state 0-based for Material-UI compatibility
    };
    setPagination(newPagination);
    fetchRents(searchTerm, filters, newPagination);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value);
    const newPagination = { 
      ...pagination, 
      pageSize: newPageSize, 
      pageNumber: 0 // Reset to first page when changing page size
    };
    setPagination(newPagination);
    fetchRents(searchTerm, filters, newPagination);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      month: ''
    });
  };

  // Remove the old filterRents function since we're doing server-side filtering
  const calculateStats = (rentsData = rents) => {
    const currentMonth = new Date().getMonth();
    const currentDate = new Date();
    
    const totalCollected = rentsData
      .filter(rent => rent.isPaid)
      .reduce((sum, rent) => sum + (rent.amount || 0), 0);
    
    const pendingAmount = rentsData
      .filter(rent => !rent.isPaid)
      .reduce((sum, rent) => sum + (rent.amount || 0), 0);
    
    const thisMonthTotal = rentsData
      .filter(rent => new Date(rent.dueDate).getMonth() === currentMonth)
      .reduce((sum, rent) => sum + (rent.amount || 0), 0);
    
    const overdueCount = rentsData
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
    return tenant ? (tenant.tenantName || `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || 'Unknown Tenant') : 'Unknown Tenant';
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
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
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
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
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

          {(searchTerm || filters.status || filters.month) && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<Clear />}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>

      {/* Results Summary and Page Size Control */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          Showing {filteredRents.length} of {pagination.totalCount} rents
          {(searchTerm || Object.values(filters).some(filter => filter)) && ' (filtered)'}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">Rows per page:</Typography>
          <FormControl size="small">
            <Select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              disabled={loading}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
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
                      {searchTerm || filters.status || filters.month !== ''
                        ? 'Try adjusting your search terms or filters'
                        : 'Get started by recording your first rent payment'
                      }
                    </Typography>
                    {!searchTerm && !filters.status && filters.month === '' && (
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Stack spacing={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.pageNumber + 1} // Convert 0-based to 1-based for display
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#000',
                  '&.Mui-selected': {
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  },
                },
              }}
            />
            <Typography variant="body2" color="textSecondary" textAlign="center">
              Showing {pagination.pageNumber * pagination.pageSize + 1}-{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} records
            </Typography>
          </Stack>
        </Box>
      )}

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
