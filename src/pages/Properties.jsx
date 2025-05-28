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
  Pagination
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Home,
  FilterList,
  Clear
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    city: '',
    minRent: '',
    maxRent: '',
    status: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    propertyType: '',
    city: '',
    minRent: '',
    maxRent: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, property: null });

  // Property types for filter dropdown
  const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Commercial'];
  const statusOptions = [
    { value: 1, label: 'Available' },
    { value: 2, label: 'Occupied' },
    { value: 3, label: 'Maintenance' }
  ];

  useEffect(() => {
    fetchProperties();
  }, [pagination.pageNumber, appliedSearchTerm, appliedFilters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Prepare search parameters
      const searchParams = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        sortBy: 'PropertyName',
        sortDirection: 'asc'
      };

      // Add search term if present
      if (appliedSearchTerm.trim()) {
        searchParams.searchTerm = appliedSearchTerm.trim();
      }

      // Add filters if present
      if (appliedFilters.propertyType) {
        searchParams.propertyType = appliedFilters.propertyType;
      }
      if (appliedFilters.city) {
        searchParams.city = appliedFilters.city;
      }
      if (appliedFilters.minRent) {
        searchParams.minRent = parseFloat(appliedFilters.minRent);
      }
      if (appliedFilters.maxRent) {
        searchParams.maxRent = parseFloat(appliedFilters.maxRent);
      }
      if (appliedFilters.status) {
        searchParams.status = parseInt(appliedFilters.status);
      }

      const response = await propertyAPI.search(searchParams);
      
      // Handle the paginated response structure
      const data = response.data?.data || response.data || {};
      const items = data.items || data.data || [];
      
      setProperties(Array.isArray(items) ? items : []);
      setPagination(prev => ({
        ...prev,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || Math.ceil((data.totalCount || 0) / prev.pageSize)
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await propertyAPI.delete(deleteDialog.property.propertyId);
      setDeleteDialog({ open: false, property: null });
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilters({ ...filters });
    setPagination(prev => ({ ...prev, pageNumber: 1 })); // Reset to first page
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setFilters({
      propertyType: '',
      city: '',
      minRent: '',
      maxRent: '',
      status: ''
    });
    setAppliedFilters({
      propertyType: '',
      city: '',
      minRent: '',
      maxRent: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
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

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'success'; // Available
      case 2: return 'error';   // Occupied
      case 3: return 'warning'; // Maintenance
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading properties...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="#000" fontWeight="bold">
          Properties ({pagination.totalCount})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/properties/create')}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': { backgroundColor: '#333' }
          }}
        >
          Add Property
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search properties..."
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

          {/* Property Type Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {propertyTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* City Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </Grid>

          {/* Min Rent */}
          <Grid item xs={6} md={1.5}>
            <TextField
              fullWidth
              label="Min Rent"
              type="number"
              value={filters.minRent}
              onChange={(e) => handleFilterChange('minRent', e.target.value)}
            />
          </Grid>

          {/* Max Rent */}
          <Grid item xs={6} md={1.5}>
            <TextField
              fullWidth
              label="Max Rent"
              type="number"
              value={filters.maxRent}
              onChange={(e) => handleFilterChange('maxRent', e.target.value)}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={1}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Apply Filter Button */}
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              onClick={applyFilters}
              startIcon={<FilterList />}
              fullWidth
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': { backgroundColor: '#333' }
              }}
            >
              Apply
            </Button>
          </Grid>

          {/* Clear Filters */}
          {(searchTerm || appliedSearchTerm || Object.values(filters).some(filter => filter) || Object.values(appliedFilters).some(filter => filter)) && (
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Clear />}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Properties Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Property Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Rent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.length > 0 ? (
              properties.map((property) => (
                <TableRow key={property.propertyId} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Home sx={{ mr: 1, color: '#666' }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {property.propertyName}
                        </Typography>
                        {property.note && (
                          <Typography variant="caption" color="textSecondary">
                            {property.note}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.propertyType}
                      color={getPropertyTypeColor(property.propertyType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{property.propertySize || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${property.propertyRent?.toLocaleString() || '0'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(property.status)}
                      color={getStatusColor(property.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {property.propertyDescription}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/properties/${property.propertyId}`)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/properties/${property.propertyId}/edit`)}
                      title="Edit Property"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, property })}
                      title="Delete Property"
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
                    <Home sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No properties found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {searchTerm || Object.values(appliedFilters).some(filter => filter)
                        ? 'Try adjusting your search terms or filters'
                        : 'Get started by adding your first property'
                      }
                    </Typography>
                    {!searchTerm && !Object.values(appliedFilters).some(filter => filter) && (
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/properties/create')}
                        sx={{
                          backgroundColor: '#000',
                          color: '#fff',
                          '&:hover': { backgroundColor: '#333' }
                        }}
                      >
                        Add First Property
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
          <Pagination
            count={pagination.totalPages}
            page={pagination.pageNumber}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add property"
        onClick={() => navigate('/properties/create')}
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
        onClose={() => setDeleteDialog({ open: false, property: null })}
      >
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.property?.propertyName}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, property: null })}>
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

export default Properties;
