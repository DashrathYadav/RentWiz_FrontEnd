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
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  People,
  Phone,
  Email,
  Home,
  Clear,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tenantAPI, roomAPI } from '../services/api';

const Tenants = () => {
  const navigate = useNavigate();
  
  // Main state
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    roomAssigned: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    roomAssigned: ''
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, tenant: null });

  useEffect(() => {
    fetchRooms();
    fetchTenants();
  }, []);

  useEffect(() => {
    fetchTenants(appliedSearchTerm, appliedFilters, { ...pagination, pageNumber: 0 });
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  }, [appliedSearchTerm, appliedFilters]);

  const fetchTenants = async (search = appliedSearchTerm, currentFilters = appliedFilters, currentPagination = pagination) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        pageNumber: currentPagination.pageNumber + 1, // Convert 0-based to 1-based pagination
        pageSize: currentPagination.pageSize
      };

      if (search) {
        searchParams.searchTerm = search;
      }

      if (currentFilters.status) {
        if (currentFilters.status === 'Active') {
          searchParams.isActive = true;
        } else if (currentFilters.status === 'Inactive' || currentFilters.status === 'Late Payment' || currentFilters.status === 'Evicted') {
          searchParams.isActive = false;
        }
      }

      if (currentFilters.roomAssigned === 'true') {
        // Filter by tenants with room assignments - this might need backend support
        // For now, we'll exclude this filter as the backend doesn't have this exact parameter
      } else if (currentFilters.roomAssigned === 'false') {
        // Filter by tenants without room assignments
      }

      const response = await tenantAPI.search(searchParams);
      
      if (response.data && response.data.data) {
        // Handle the correct response structure from backend
        const pagedData = response.data.data;
        
        // Map backend fields to match CreateTenantDto structure
        const mappedTenants = (pagedData.data || []).map(tenant => ({
          id: tenant.tenantId,
          tenantName: tenant.tenantName,
          tenantEmail: tenant.tenantEmail,
          tenantMobile: tenant.tenantMobile,
          tenantAdharId: tenant.tenantAdharId,
          roomId: tenant.roomId,
          tenantRoomNo: tenant.tenantRoomNo,
          boardingDate: tenant.boardingDate,
          isActive: tenant.isActive,
          deposited: tenant.deposited,
          presentRentValue: tenant.presentRentValue,
          lockInPeriod: tenant.lockInPeriod,
          propertyId: tenant.propertyId,
          // Keep original fields as well for compatibility
          ...tenant
        }));
        
        setTenants(mappedTenants);
        setPagination(prev => ({
          ...prev,
          totalCount: pagedData.totalRecords || 0,
          totalPages: pagedData.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Failed to load tenants. Please try again.');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      const response = await roomAPI.getByOwner(ownerId);
      // Handle nested data structure and map backend fields to frontend expected fields
      const roomsData = response.data?.data || response.data || [];
      const mappedRooms = Array.isArray(roomsData) ? roomsData.map(room => ({
        id: room.roomId,
        roomNumber: room.roomNo,
        propertyId: room.propertyId,
        propertyName: room.propertyName,
        // Keep original fields as well for compatibility
        ...room
      })) : [];
      setRooms(mappedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const handlePageChange = (event, newPage) => {
    const newPagination = {
      ...pagination,
      pageNumber: newPage - 1 // Keep internal state 0-based for Material-UI compatibility
    };
    setPagination(newPagination);
    fetchTenants(appliedSearchTerm, appliedFilters, newPagination);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value);
    const newPagination = { 
      ...pagination, 
      pageSize: newPageSize, 
      pageNumber: 0 // Reset to first page when changing page size
    };
    setPagination(newPagination);
    fetchTenants(appliedSearchTerm, appliedFilters, newPagination);
  };

  const applyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilters({ ...filters });
    setPagination(prev => ({ ...prev, pageNumber: 0 })); // Reset to first page
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      roomAssigned: ''
    });
    setAppliedFilters({
      status: '',
      roomAssigned: ''
    });
    setSearchTerm('');
    setAppliedSearchTerm('');
  };

  const handleDelete = async () => {
    try {
      await tenantAPI.delete(deleteDialog.tenant.id);
      setDeleteDialog({ open: false, tenant: null });
      fetchTenants(appliedSearchTerm, appliedFilters);
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  };

  const getRoomInfo = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? `Room ${room.roomNumber}` : 'No Room Assigned';
  };

  const getInitials = (tenantName) => {
    if (!tenantName) return 'T';
    const nameParts = tenantName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  const getTenantStatus = (tenant) => {
    // Use the isActive field from the backend
    if (tenant.isActive === false) {
      return 'Inactive';
    }
    return 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Late Payment': return 'warning';
      case 'Evicted': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading tenants...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="#000" fontWeight="bold">
          Tenants
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tenants/create')}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': { backgroundColor: '#333' }
          }}
        >
          Add Tenant
        </Button>
      </Box>

      {/* Search and Filter Controls */}
      <Box mb={3}>
        {/* Search Bar */}
        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Search tenants by name, email, mobile, or Aadhaar ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 500 }}
          />
        </Box>

        {/* Filter Toggle Button and Apply Filters */}
        <Box display="flex" alignItems="center" gap={2} mb={showFilters ? 2 : 0}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderColor: '#000', color: '#000' }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button
            variant="contained"
            onClick={applyFilters}
            startIcon={<FilterList />}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            Apply Filters
          </Button>
          
          {(appliedFilters.status || appliedFilters.roomAssigned || appliedSearchTerm) && (
            <Button
              startIcon={<Clear />}
              onClick={clearFilters}
              sx={{ color: '#666' }}
            >
              Clear All
            </Button>
          )}
        </Box>

        {/* Advanced Filters */}
        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Late Payment">Late Payment</MenuItem>
                  <MenuItem value="Evicted">Evicted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Room Assignment</InputLabel>
                <Select
                  value={filters.roomAssigned}
                  label="Room Assignment"
                  onChange={(e) => handleFilterChange('roomAssigned', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Has Room</MenuItem>
                  <MenuItem value="false">No Room</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Results Summary and Page Size Control */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          Showing {tenants.length} of {pagination.totalCount} tenants
          {(appliedSearchTerm || Object.values(appliedFilters).some(filter => filter)) && ' (filtered)'}
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

      {/* Tenants Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Room Assignment</TableCell>
              <TableCell>Financial Info</TableCell>
              <TableCell>Boarding Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.length > 0 ? (
              tenants.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: '#000', width: 40, height: 40 }}>
                        {getInitials(tenant.tenantName)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {tenant.tenantName || 'Unknown Tenant'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {tenant.id}
                        </Typography>
                        {tenant.tenantAdharId && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Aadhaar: ****{tenant.tenantAdharId.slice(-4)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Email sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                        <Typography variant="body2">
                          {tenant.tenantEmail || 'No email'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Phone sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                        <Typography variant="body2">
                          {tenant.tenantMobile || 'No phone'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Home sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                      <Box>
                        <Typography variant="body2">
                          {getRoomInfo(tenant.roomId)}
                        </Typography>
                        {tenant.tenantRoomNo && (
                          <Typography variant="caption" color="textSecondary">
                            Room No: {tenant.tenantRoomNo}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {tenant.deposited && (
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          Deposit: ₹{tenant.deposited.toLocaleString()}
                        </Typography>
                      )}
                      {tenant.presentRentValue && (
                        <Typography variant="body2">
                          Rent: ₹{tenant.presentRentValue.toLocaleString()}
                        </Typography>
                      )}
                      {tenant.lockInPeriod && (
                        <Typography variant="caption" color="textSecondary">
                          Lock-in: {tenant.lockInPeriod}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {tenant.boardingDate && (
                        <Typography variant="body2">
                          {new Date(tenant.boardingDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {!tenant.boardingDate && (
                        <Typography variant="body2" color="textSecondary">
                          Not specified
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTenantStatus(tenant)}
                      color={getStatusColor(getTenantStatus(tenant))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tenants/${tenant.id}`)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tenants/${tenant.id}/edit`)}
                      title="Edit Tenant"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, tenant })}
                      title="Delete Tenant"
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
                    <People sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No tenants found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'Get started by adding your first tenant'
                      }
                    </Typography>
                    {!searchTerm && (
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/tenants/create')}
                        sx={{
                          backgroundColor: '#000',
                          color: '#fff',
                          '&:hover': { backgroundColor: '#333' }
                        }}
                      >
                        Add First Tenant
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
              page={pagination.pageNumber + 1} // Material-UI uses 1-based indexing
              onChange={handlePageChange}
              color="primary"
              size="large"
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
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Showing {pagination.pageNumber * pagination.pageSize + 1}-{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} records
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add tenant"
        onClick={() => navigate('/tenants/create')}
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
        onClose={() => setDeleteDialog({ open: false, tenant: null })}
      >
        <DialogTitle>Delete Tenant</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.tenant?.firstName} {deleteDialog.tenant?.lastName}"? 
            This action cannot be undone and will also remove all associated rent records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, tenant: null })}>
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

export default Tenants;
