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
  Avatar
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
  Home
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tenantAPI, roomAPI } from '../services/api';

const Tenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, tenant: null });

  useEffect(() => {
    fetchTenants();
    fetchRooms();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [searchTerm, tenants]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getAll();
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      setRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const filterTenants = () => {
    if (!searchTerm) {
      setFilteredTenants(tenants);
    } else {
      const filtered = tenants.filter(tenant =>
        tenant.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phoneNumber?.includes(searchTerm)
      );
      setFilteredTenants(filtered);
    }
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
    // This could be based on lease dates, payment status, etc.
    // For now, let's assume active if they have a room assigned
    return tenant.roomId ? 'Active' : 'Inactive';
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

      {/* Search */}
      <Box mb={3}>
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
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
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
