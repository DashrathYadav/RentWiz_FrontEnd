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
  Pagination,
  Grid,
  Card,
  CardContent
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
  FilterList,
  Clear
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { roomAPI, propertyAPI } from '../services/api';

const Rooms = () => {
  const navigate = useNavigate();
  
  // Room data and pagination
  const [rooms, setRooms] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  // Properties for filter dropdown
  const [properties, setProperties] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  // Filter states (not applied until "Apply Filter" is clicked)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  
  // Applied filters (what's actually sent to API)
  const [appliedFilters, setAppliedFilters] = useState({});
  
  // UI states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, room: null });

  useEffect(() => {
    fetchRooms(); // Use new pagination
    fetchProperties();
  }, [currentPage, pageSize, appliedFilters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // Prepare search parameters
      const searchParams = {
        pageNumber: currentPage,
        pageSize: pageSize,
        ...appliedFilters
      };
      
      const response = await roomAPI.search(searchParams);
      
      // Handle the API wrapper structure: response.data.data contains the actual paginated data
      const apiData = response.data?.data || {}; // This is the paginated data wrapper
      const roomsData = apiData.data || []; // This is the actual rooms array
      const total = apiData.totalRecords || 0;
      const totalPagesCount = apiData.totalPages || 0;
      
      // Process rooms data to ensure consistent field mapping
      const processedRooms = Array.isArray(roomsData) ? roomsData.map(room => ({
        ...room,
        id: room.roomId || room.id,
        roomNumber: room.roomNo || room.roomNumber,
        type: room.roomType || room.type,
        rentAmount: room.roomRent || room.rentAmount,
        size: room.roomSize || room.size,
        description: room.roomDescription || room.description,
        isOccupied: room.status === "Occupied" || room.status === 2 || room.isOccupied,
        facility: room.roomFacility || room.facility,
        pic: room.roomPic || room.pic,
        propertyId: room.propertyId
      })) : [];
      
      setRooms(processedRooms);
      setTotalRooms(total);
      setTotalPages(totalPagesCount);
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
      setTotalRooms(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      const response = await propertyAPI.getByOwner(ownerId);
      // Handle nested data structure like Dashboard
      const propertiesData = response.data?.data || response.data || [];
      
      // With camelCase serialization enabled in backend, we expect camelCase field names
      const processedProperties = Array.isArray(propertiesData) ? propertiesData.map(property => ({
        ...property,
        // Map specific fields that need different property names
        id: property.propertyId,
        name: property.propertyName,
        type: property.propertyType,
        description: property.propertyDescription,
        value: property.propertyValue,
        isActive: property.isActive !== undefined ? property.isActive : (property.status === 1),
        facility: property.propertyFacility,
        rent: property.propertyRent,
        size: property.propertySize
      })) : [];
      
      setProperties(processedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const handleApplyFilters = async () => {
    setSearching(true);
    setCurrentPage(1); // Reset to first page when applying new filters
    
    // Build applied filters object
    const filters = {};
    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    if (filterProperty) filters.propertyId = parseInt(filterProperty);
    if (filterStatus) filters.isAvailable = filterStatus === 'available';
    if (filterRoomType.trim()) filters.roomType = filterRoomType.trim();
    if (minRent) filters.minRent = parseFloat(minRent);
    if (maxRent) filters.maxRent = parseFloat(maxRent);
    
    setAppliedFilters(filters);
    setSearching(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterProperty('');
    setFilterStatus('');
    setFilterRoomType('');
    setMinRent('');
    setMaxRent('');
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleDelete = async () => {
    try {
      await roomAPI.delete(deleteDialog.room.id);
      setDeleteDialog({ open: false, room: null });
      fetchRooms(); // Refresh the current page
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

  const hasUnappliedChanges = () => {
    const currentFilters = {};
    if (searchTerm.trim()) currentFilters.searchTerm = searchTerm.trim();
    if (filterProperty) currentFilters.propertyId = parseInt(filterProperty);
    if (filterStatus) currentFilters.isAvailable = filterStatus === 'available';
    if (filterRoomType.trim()) currentFilters.roomType = filterRoomType.trim();
    if (minRent) currentFilters.minRent = parseFloat(minRent);
    if (maxRent) currentFilters.maxRent = parseFloat(maxRent);
    
    return JSON.stringify(currentFilters) !== JSON.stringify(appliedFilters);
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search & Filter Rooms
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            {/* Search Term */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
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
              />
            </Grid>
            
            {/* Property Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  value={filterProperty}
                  onChange={(e) => setFilterProperty(e.target.value)}
                  label="Property"
                >
                  <MenuItem value="">All Properties</MenuItem>
                  {properties.map(property => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
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
            </Grid>

            {/* Room Type Filter */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="Room Type"
                value={filterRoomType}
                onChange={(e) => setFilterRoomType(e.target.value)}
                label="Room Type"
              />
            </Grid>

            {/* Rent Range */}
            <Grid item xs={6} md={1.5}>
              <TextField
                fullWidth
                placeholder="Min Rent"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                label="Min Rent"
                type="number"
              />
            </Grid>
            
            <Grid item xs={6} md={1.5}>
              <TextField
                fullWidth
                placeholder="Max Rent"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                label="Max Rent"
                type="number"
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box mt={2} display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={searching}
              sx={{
                backgroundColor: '#000',
                '&:hover': { backgroundColor: '#333' }
              }}
            >
              {searching ? 'Searching...' : 'Apply Filters'}
            </Button>
            
            {Object.keys(appliedFilters).length > 0 && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<Clear />}
              >
                Clear Filters
              </Button>
            )}
            
            {hasUnappliedChanges() && (
              <Chip 
                label="Filters changed - click Apply to search" 
                color="warning" 
                size="small" 
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          Showing {rooms.length} of {totalRooms} rooms
          {Object.keys(appliedFilters).length > 0 && ' (filtered)'}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">Rows per page:</Typography>
          <FormControl size="small">
            <Select
              value={pageSize}
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
            {rooms.length > 0 ? (
              rooms.map((room) => (
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
                      {Object.keys(appliedFilters).length > 0
                        ? 'Try adjusting your search terms or filters'
                        : 'Get started by adding your first room'
                      }
                    </Typography>
                    {Object.keys(appliedFilters).length === 0 && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            disabled={loading || searching}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

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
