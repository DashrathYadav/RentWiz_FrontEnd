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
  Grid,
  Pagination,
  Stack,
  Card,
  CardContent
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
  Clear,
  Home,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { rentTrackAPI, tenantAPI, propertyAPI, lookupsAPI } from '../services/api';

const RentTracks = () => {
  const navigate = useNavigate();
  const [rentTracks, setRentTracks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    propertyId: '',
    tenantId: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    propertyId: '',
    tenantId: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rentTrackId: null });
  const [showFilters, setShowFilters] = useState(false);

  // Lookup values
  const rentStatuses = [
    { id: 1, name: 'Pending', color: 'warning' },
    { id: 2, name: 'Partially Paid', color: 'info' },
    { id: 3, name: 'Fully Paid', color: 'success' }
  ];

  const currencies = [
    { id: 1, name: 'USD', symbol: '$' },
    { id: 2, name: 'EUR', symbol: '€' },
    { id: 3, name: 'GBP', symbol: '£' },
    { id: 4, name: 'AUD', symbol: 'A$' },
    { id: 5, name: 'CAD', symbol: 'C$' },
    { id: 6, name: 'JPY', symbol: '¥' },
    { id: 7, name: 'CNY', symbol: '¥' },
    { id: 8, name: 'INR', symbol: '₹' },
    { id: 9, name: 'RUB', symbol: '₽' },
    { id: 10, name: 'BRL', symbol: 'R$' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRentTracks();
  }, [pagination.pageNumber, appliedSearchTerm, appliedFilters]);

  const fetchInitialData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      const [propertiesResponse, tenantsResponse] = await Promise.all([
        lookupsAPI.getProperties(ownerId).catch(err => {
          console.error('Error fetching properties:', err);
          return { data: [] };
        }),
        tenantAPI.getByOwner(ownerId).catch(err => {
          console.error('Error fetching tenants:', err);
          return { data: [] };
        })
      ]);
      
      setProperties(Array.isArray(propertiesResponse.data) ? propertiesResponse.data : []);
      setTenants(Array.isArray(tenantsResponse.data) ? tenantsResponse.data : []);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchRentTracks = async () => {
    try {
      setLoading(true);
      
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;

      const searchParams = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        ownerId: ownerId,
        searchTerm: appliedSearchTerm,
        ...appliedFilters
      };

      // Remove empty filter values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
          delete searchParams[key];
        }
      });

      const response = await rentTrackAPI.search(searchParams);
      
      if (response.data) {
        setRentTracks(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.totalPages || 0,
          totalRecords: response.data.totalRecords || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching rent tracks:', error);
      setRentTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilters({ ...filters });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setFilters({
      propertyId: '',
      tenantId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setAppliedFilters({
      propertyId: '',
      tenantId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  const handleView = (rentTrackId) => {
    navigate(`/rent-tracks/${rentTrackId}`);
  };

  const handleEdit = (rentTrackId) => {
    navigate(`/rent-tracks/edit/${rentTrackId}`);
  };

  const handleDelete = (rentTrackId) => {
    setDeleteDialog({ open: true, rentTrackId });
  };

  const confirmDelete = async () => {
    try {
      await rentTrackAPI.delete(deleteDialog.rentTrackId);
      setDeleteDialog({ open: false, rentTrackId: null });
      fetchRentTracks();
    } catch (error) {
      console.error('Error deleting rent track:', error);
    }
  };

  const formatCurrency = (amount, currencyCode) => {
    if (!amount) return 'N/A';
    const currency = currencies.find(c => c.id === currencyCode);
    return `${currency?.symbol || '₹'}${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (status) => {
    const statusInfo = rentStatuses.find(s => s.id === status);
    return (
      <Chip
        label={statusInfo?.name || 'Unknown'}
        color={statusInfo?.color || 'default'}
        size="small"
      />
    );
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.propertyName || 'N/A';
  };

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.tenantName || 'N/A';
  };

  // Calculate summary statistics
  const totalExpected = rentTracks.reduce((sum, rt) => sum + (parseFloat(rt.expectedRentValue) || 0), 0);
  const totalReceived = rentTracks.reduce((sum, rt) => sum + (parseFloat(rt.receivedRentValue) || 0), 0);
  const pendingAmount = totalExpected - totalReceived;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Rent Tracks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/rent-tracks/create')}
        >
          Create Rent Track
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Expected
                  </Typography>
                  <Typography variant="h6" component="div">
                    ₹{totalExpected.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUp color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Received
                  </Typography>
                  <Typography variant="h6" component="div">
                    ₹{totalReceived.toLocaleString()}
                  </Typography>
                </Box>
                <Payment color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h6" component="div">
                    ₹{pendingAmount.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalance color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Records
                  </Typography>
                  <Typography variant="h6" component="div">
                    {pagination.totalRecords}
                  </Typography>
                </Box>
                <AttachMoney color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search rent tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterList />}
              >
                Filters
              </Button>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Clear />}
              >
                Clear
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {showFilters && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={filters.propertyId}
                    onChange={(e) => handleFilterChange('propertyId', e.target.value)}
                    label="Property"
                  >
                    <MenuItem value="">All Properties</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.propertyName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tenant</InputLabel>
                  <Select
                    value={filters.tenantId}
                    onChange={(e) => handleFilterChange('tenantId', e.target.value)}
                    label="Tenant"
                  >
                    <MenuItem value="">All Tenants</MenuItem>
                    {tenants.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.tenantName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {rentStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Expected Amount</TableCell>
              <TableCell>Received Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rentTracks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No rent tracks found
                </TableCell>
              </TableRow>
            ) : (
              rentTracks.map((rentTrack) => (
                <TableRow key={rentTrack.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Home sx={{ mr: 1, color: 'text.secondary' }} />
                      {getPropertyName(rentTrack.propertyId)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      {getTenantName(rentTrack.tenantId)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2">
                          {formatDate(rentTrack.rentPeriodStartDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          to {formatDate(rentTrack.rentPeriodEndDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(rentTrack.expectedRentValue, rentTrack.currencyCode)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(rentTrack.receivedRentValue, rentTrack.currencyCode)}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(rentTrack.status)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleView(rentTrack.id)}
                      title="View"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(rentTrack.id)}
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(rentTrack.id)}
                      title="Delete"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.pageNumber}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, rentTrackId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this rent track? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, rentTrackId: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/rent-tracks/create')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default RentTracks;
