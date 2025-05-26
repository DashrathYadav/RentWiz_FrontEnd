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
  MenuItem
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Room,
  AttachMoney,
  Home,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { roomAPI, propertyAPI } from '../services/api';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, room: null });

  useEffect(() => {
    fetchRooms();
    fetchProperties();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchTerm, filterProperty, filterStatus, rooms]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAll();
      // Handle nested data structure like Dashboard
      const roomsData = response.data?.data || response.data || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await propertyAPI.getAll();
      // Handle nested data structure like Dashboard
      const propertiesData = response.data?.data || response.data || [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Property filter
    if (filterProperty) {
      filtered = filtered.filter(room => room.propertyId === parseInt(filterProperty));
    }

    // Status filter
    if (filterStatus) {
      const isOccupied = filterStatus === 'occupied';
      filtered = filtered.filter(room => room.isOccupied === isOccupied);
    }

    setFilteredRooms(filtered);
  };

  const handleDelete = async () => {
    try {
      await roomAPI.delete(deleteDialog.room.id);
      setDeleteDialog({ open: false, room: null });
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const getRoomStatusColor = (isOccupied) => {
    return isOccupied ? 'error' : 'success';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterProperty('');
    setFilterStatus('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading rooms...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="#000" fontWeight="bold">
          Rooms
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/rooms/create')}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': { backgroundColor: '#333' }
          }}
        >
          Add Room
        </Button>
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search rooms..."
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
          
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Property</InputLabel>
            <Select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              label="Filter by Property"
            >
              <MenuItem value="">All Properties</MenuItem>
              {properties.map(property => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
            </Select>
          </FormControl>

          {(searchTerm || filterProperty || filterStatus) && (
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

      {/* Rooms Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Room Number</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Rent Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Size (sq ft)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <TableRow key={room.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Room sx={{ mr: 1, color: '#666' }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {room.roomNumber}
                        </Typography>
                        {room.description && (
                          <Typography variant="caption" color="textSecondary">
                            {room.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Home sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                      {getPropertyName(room.propertyId)}
                    </Box>
                  </TableCell>
                  <TableCell>{room.type || 'Standard'}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <AttachMoney sx={{ mr: 0.5, color: '#666', fontSize: 16 }} />
                      {room.rentAmount ? room.rentAmount.toLocaleString() : '0'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={room.isOccupied ? 'Occupied' : 'Available'}
                      color={getRoomStatusColor(room.isOccupied)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {room.size ? `${room.size} sq ft` : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/rooms/${room.id}/edit`)}
                      title="Edit Room"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, room })}
                      title="Delete Room"
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
                    <Room sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No rooms found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {searchTerm || filterProperty || filterStatus
                        ? 'Try adjusting your search terms or filters'
                        : 'Get started by adding your first room'
                      }
                    </Typography>
                    {!searchTerm && !filterProperty && !filterStatus && (
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/rooms/create')}
                        sx={{
                          backgroundColor: '#000',
                          color: '#fff',
                          '&:hover': { backgroundColor: '#333' }
                        }}
                      >
                        Add First Room
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
        aria-label="add room"
        onClick={() => navigate('/rooms/create')}
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
        onClose={() => setDeleteDialog({ open: false, room: null })}
      >
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete room "{deleteDialog.room?.roomNumber}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, room: null })}>
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

export default Rooms;
