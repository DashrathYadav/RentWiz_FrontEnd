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
import { debounce } from 'lodash';

const Tenants = () => {
  const navigate = useNavigate();
  
  // Main state
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
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

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((search, currentFilters, currentPagination) => {
      fetchTenants(search, currentFilters, currentPagination);
    }, 500),
    []
  );

  useEffect(() => {
    fetchRooms();
    fetchTenants();
  }, []);

  useEffect(() => {
    debouncedFetch(searchTerm, filters, { ...pagination, pageNumber: 0 });
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  }, [searchTerm, filters, debouncedFetch]);

  const fetchTenants = async (search = searchTerm, currentFilters = filters, currentPagination = pagination) => {
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
        
        // Map backend fields to frontend expected fields
        const mappedTenants = (pagedData.data || []).map(tenant => ({
          id: tenant.tenantId,
          firstName: tenant.tenantName?.split(' ')[0] || '',
          lastName: tenant.tenantName?.split(' ').slice(1).join(' ') || '',
          email: tenant.tenantEmail,
          phoneNumber: tenant.tenantMobile,
          roomId: tenant.roomId,
          leaseStartDate: tenant.boardingDate,
          leaseEndDate: tenant.leavingDate,
          isActive: tenant.isActive,
          tenantRoomNo: tenant.tenantRoomNo,
          deposited: tenant.deposited,
          presentRentValue: tenant.presentRentValue,
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
    fetchTenants(searchTerm, filters, newPagination);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value);
    const newPagination = { 
      ...pagination, 
      pageSize: newPageSize, 
      pageNumber: 0 // Reset to first page when changing page size
    };
    setPagination(newPagination);
    fetchTenants(searchTerm, filters, newPagination);
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
    setSearchTerm('');
  };

  const handleDelete = async () => {
    try {
      await tenantAPI.delete(deleteDialog.tenant.id);
      setDeleteDialog({ open: false, tenant: null });
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  };

  const getRoomInfo = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? `Room ${room.roomNumber}` : 'No Room Assigned';
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
            placeholder="Search tenants by name, email, or phone number..."
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

        {/* Filter Toggle Button */}
        <Box display="flex" alignItems="center" gap={2} mb={showFilters ? 2 : 0}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderColor: '#000', color: '#000' }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {(filters.status || filters.roomAssigned || searchTerm) && (
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

      {/* Tenants Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Room Assignment</TableCell>
              <TableCell>Lease Dates</TableCell>
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
                        {getInitials(tenant.firstName, tenant.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {tenant.firstName} {tenant.lastName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {tenant.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Email sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                        <Typography variant="body2">
                          {tenant.email || 'No email'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Phone sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                        <Typography variant="body2">
                          {tenant.phoneNumber || 'No phone'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Home sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                      {getRoomInfo(tenant.roomId)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {tenant.leaseStartDate && (
                        <Typography variant="body2">
                          Start: {new Date(tenant.leaseStartDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {tenant.leaseEndDate && (
                        <Typography variant="body2">
                          End: {new Date(tenant.leaseEndDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {!tenant.leaseStartDate && !tenant.leaseEndDate && (
                        <Typography variant="body2" color="textSecondary">
                          No lease dates
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
                <TableCell colSpan={6} align="center">
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

      {/* Results Summary and Page Size Control */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          Showing {tenants.length} of {pagination.totalCount} tenants
          {(searchTerm || filters.status || filters.roomAssigned) && ' (filtered)'}
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
