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
  IconButton,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  Email,
  Phone,
  Home,
  CalendarMonth
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantAPI, roomAPI } from '../services/api';

const CreateTenant = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    roomId: '',
    leaseStartDate: '',
    leaseEndDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    idNumber: '',
    occupation: ''
  });
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchRooms();
    if (isEdit) {
      fetchTenant();
    }
  }, [id, isEdit]);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      // Filter to show only available rooms (or current room if editing)
      const availableRooms = response.data?.filter(room => 
        !room.isOccupied || (isEdit && room.id === parseInt(formData.roomId))
      ) || [];
      setRooms(availableRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchTenant = async () => {
    try {
      const response = await tenantAPI.getById(id);
      const tenant = response.data;
      setFormData({
        firstName: tenant.firstName || '',
        lastName: tenant.lastName || '',
        email: tenant.email || '',
        phoneNumber: tenant.phoneNumber || '',
        address: tenant.address || '',
        roomId: tenant.roomId || '',
        leaseStartDate: tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toISOString().split('T')[0] : '',
        leaseEndDate: tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toISOString().split('T')[0] : '',
        emergencyContactName: tenant.emergencyContactName || '',
        emergencyContactPhone: tenant.emergencyContactPhone || '',
        idNumber: tenant.idNumber || '',
        occupation: tenant.occupation || ''
      });
    } catch (error) {
      console.error('Error fetching tenant:', error);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (formData.leaseStartDate && formData.leaseEndDate) {
      if (new Date(formData.leaseStartDate) >= new Date(formData.leaseEndDate)) {
        newErrors.leaseEndDate = 'Lease end date must be after start date';
      }
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
        roomId: formData.roomId ? parseInt(formData.roomId) : null,
        leaseStartDate: formData.leaseStartDate || null,
        leaseEndDate: formData.leaseEndDate || null
      };

      if (isEdit) {
        await tenantAPI.update(id, submitData);
      } else {
        await tenantAPI.create(submitData);
      }

      navigate('/tenants');
    } catch (error) {
      console.error('Error submitting tenant:', error);
      setSubmitError(error.response?.data?.message || 'An error occurred while saving the tenant');
    } finally {
      setLoading(false);
    }
  };

  const getRoomDisplayName = (room) => {
    return `Room ${room.roomNumber} - ${room.propertyName || 'Unknown Property'}`;
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/tenants')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" color="#000" fontWeight="bold">
          {isEdit ? 'Edit Tenant' : 'Create New Tenant'}
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 900, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID Number"
                  value={formData.idNumber}
                  onChange={handleChange('idNumber')}
                  helperText="Driver's license, passport, or national ID"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Occupation"
                  value={formData.occupation}
                  onChange={handleChange('occupation')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  placeholder="Current address"
                />
              </Grid>

              {/* Lease Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold" sx={{ mt: 2 }}>
                  Lease Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Room Assignment</InputLabel>
                  <Select
                    value={formData.roomId}
                    onChange={handleChange('roomId')}
                    label="Room Assignment"
                    startAdornment={
                      <InputAdornment position="start">
                        <Home sx={{ mr: 1 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">No Room Assigned</MenuItem>
                    {rooms.map(room => (
                      <MenuItem key={room.id} value={room.id}>
                        {getRoomDisplayName(room)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Lease Start Date"
                  type="date"
                  value={formData.leaseStartDate}
                  onChange={handleChange('leaseStartDate')}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Lease End Date"
                  type="date"
                  value={formData.leaseEndDate}
                  onChange={handleChange('leaseEndDate')}
                  error={!!errors.leaseEndDate}
                  helperText={errors.leaseEndDate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold" sx={{ mt: 2 }}>
                  Emergency Contact
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={handleChange('emergencyContactName')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange('emergencyContactPhone')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/tenants')}
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
                    {loading ? 'Saving...' : (isEdit ? 'Update Tenant' : 'Create Tenant')}
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

export default CreateTenant;
