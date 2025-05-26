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
  Home,
  AttachMoney,
  LocationOn
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI, ownerAPI } from '../services/api';

const CreateProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    type: '',
    value: '',
    ownerId: '',
    isActive: true
  });
  
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchOwners();
    if (isEdit) {
      fetchProperty();
    }
  }, [id, isEdit]);

  const fetchOwners = async () => {
    try {
      const response = await ownerAPI.getAll();
      setOwners(response.data || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      const property = response.data;
      setFormData({
        name: property.name || '',
        description: property.description || '',
        address: property.address || '',
        type: property.type || '',
        value: property.value || '',
        ownerId: property.ownerId || '',
        isActive: property.isActive !== false
      });
    } catch (error) {
      console.error('Error fetching property:', error);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.type) {
      newErrors.type = 'Property type is required';
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Owner is required';
    }

    if (formData.value && isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Property value must be a valid number';
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
        value: formData.value ? parseFloat(formData.value) : null,
        ownerId: parseInt(formData.ownerId)
      };

      if (isEdit) {
        await propertyAPI.update(id, submitData);
      } else {
        await propertyAPI.create(submitData);
      }

      navigate('/properties');
    } catch (error) {
      console.error('Error submitting property:', error);
      setSubmitError(error.response?.data?.message || 'An error occurred while saving the property');
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes = [
    'Apartment',
    'House',
    'Condo',
    'Townhouse',
    'Commercial',
    'Office',
    'Warehouse',
    'Other'
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/properties')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" color="#000" fontWeight="bold">
          {isEdit ? 'Edit Property' : 'Create New Property'}
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
              {/* Property Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Property Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home />
                      </InputAdornment>
                    ),
                  }}
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
                  placeholder="Enter property description..."
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Property Type and Owner */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.type} required>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleChange('type')}
                    label="Property Type"
                  >
                    {propertyTypes.map(type => (
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
                <FormControl fullWidth error={!!errors.ownerId} required>
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={formData.ownerId}
                    onChange={handleChange('ownerId')}
                    label="Owner"
                  >
                    {owners.map(owner => (
                      <MenuItem key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.ownerId && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.ownerId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Property Value */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Value"
                  type="number"
                  value={formData.value}
                  onChange={handleChange('value')}
                  error={!!errors.value}
                  helperText={errors.value || 'Optional - Enter estimated property value'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Active Status */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange('isActive')}
                      color="primary"
                    />
                  }
                  label="Active Property"
                  sx={{ mt: 2 }}
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Active properties are available for rent management
                </Typography>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/properties')}
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
                    {loading ? 'Saving...' : (isEdit ? 'Update Property' : 'Create Property')}
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

export default CreateProperty;
