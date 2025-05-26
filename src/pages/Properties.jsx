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
  Fab
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Home
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, property: null });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll();
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    if (!searchTerm) {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(property =>
        property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  };

  const handleDelete = async () => {
    try {
      await propertyAPI.delete(deleteDialog.property.id);
      setDeleteDialog({ open: false, property: null });
      fetchProperties();
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
          Properties
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

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search properties by name, address, or description..."
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

      {/* Properties Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Property Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Rooms</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <TableRow key={property.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Home sx={{ mr: 1, color: '#666' }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {property.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {property.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{property.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.type || 'Unknown'}
                      color={getPropertyTypeColor(property.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{property.totalRooms || 0}</TableCell>
                  <TableCell>
                    {property.value ? `$${property.value.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.isActive ? 'Active' : 'Inactive'}
                      color={property.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/properties/${property.id}`)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/properties/${property.id}/edit`)}
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
                      {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first property'}
                    </Typography>
                    {!searchTerm && (
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
            Are you sure you want to delete "{deleteDialog.property?.name}"? 
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