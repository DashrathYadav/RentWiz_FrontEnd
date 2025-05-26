import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Room,
  AttachMoney,
  Home
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { roomAPI, propertyAPI } from '../services/api';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const preselectedPropertyId = searchParams.get('propertyId');

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    size: '',
    rentAmount: '',
    description: '',
    propertyId: preselectedPropertyId || '',
    isOccupied: false,
    hasPrivateBathroom: false,
    hasFurniture: false
  });
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchProperties();
    if (isEdit) {
      fetchRoom();
    }
  }, [id, isEdit]);

  const fetchProperties = async () => {
    try {
      const response = await propertyAPI.getAll();
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getById(id);
      const room = response.data;
      setFormData({
        roomNumber: room.roomNumber || '',
        type: room.type || '',
        size: room.size || '',
        rentAmount: room.rentAmount || '',
        description: room.description || '',
        propertyId: room.propertyId || '',
        isOccupied: room.isOccupied || false,
        hasPrivateBathroom: room.hasPrivateBathroom || false,
        hasFurniture: room.hasFurniture || false
      });
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }

    if (!formData.propertyId) {
      newErrors.propertyId = 'Property is required';
    }

    if (!formData.type) {
      newErrors.type = 'Room type is required';
    }

    if (formData.rentAmount && isNaN(parseFloat(formData.rentAmount))) {
      newErrors.rentAmount = 'Rent amount must be a valid number';
    }

    if (formData.size && isNaN(parseFloat(formData.size))) {
      newErrors.size = 'Size must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const submitData = {
        ...formData,
        rentAmount: formData.rentAmount ? parseFloat(formData.rentAmount) : null,
        size: formData.size ? parseFloat(formData.size) : null,
        propertyId: parseInt(formData.propertyId)
      };

      if (isEdit) {
        await roomAPI.update(id, submitData);
      } else {
        await roomAPI.create(submitData);
      }

      navigate('/rooms');
    } catch (error) {
      console.error('Error submitting room:', error);
      setSubmitError(error.response?.data?.message || 'An error occurred while saving the room');
    } finally {
      setLoading(false);
    }
  };

  const roomTypes = [
    'Single Room',
    'Double Room',
    'Studio',
    'One Bedroom',
    'Two Bedroom',
    'Three Bedroom',
    'Master Suite',
    'Shared Room',
    'Other'
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/rooms')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" color="#000" fontWeight="bold">
          {isEdit ? 'Edit Room' : 'Create New Room'}
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 800, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Room Number and Property */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  value={formData.roomNumber}
                  onChange={handleChange('roomNumber')}
                  error={!!errors.roomNumber}
                  helperText={errors.roomNumber}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Room />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.propertyId} required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={formData.propertyId}
                    onChange={handleChange('propertyId')}
                    label="Property"
                    startAdornment={
                      <InputAdornment position="start">
                        <Home sx={{ mr: 1 }} />
                      </InputAdornment>
                    }
                  >
                    {properties.map(property => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.propertyId && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.propertyId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Room Type and Rent Amount */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.type} required>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleChange('type')}
                    label="Room Type"
                  >
                    {roomTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rent Amount"
                  type="number"
                  value={formData.rentAmount}
                  onChange={handleChange('rentAmount')}
                  error={!!errors.rentAmount}
                  helperText={errors.rentAmount || 'Monthly rent amount'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Size */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Size (sq ft)"
                  type="number"
                  value={formData.size}
                  onChange={handleChange('size')}
                  error={!!errors.size}
                  helperText={errors.size || 'Room size in square feet'}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Enter room description, amenities, etc..."
                />
              </Grid>

              {/* Room Features */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Room Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isOccupied}
                          onChange={handleChange('isOccupied')}
                          color="primary"
                        />
                      }
                      label="Currently Occupied"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasPrivateBathroom}
                          onChange={handleChange('hasPrivateBathroom')}
                          color="primary"
                        />
                      }
                      label="Private Bathroom"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasFurniture}
                          onChange={handleChange('hasFurniture')}
                          color="primary"
                        />
                      }
                      label="Furnished"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/rooms')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      backgroundColor: '#000',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#333' }
                    }}
                  >
                    {loading ? 'Saving...' : (isEdit ? 'Update Room' : 'Create Room')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateRoom;
