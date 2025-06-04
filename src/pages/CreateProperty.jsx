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
  InputAdornment,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Home,
  AttachMoney,
  Description,
  Business
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI, lookupsAPI } from '../services/api';
import AddressForm from '../components/AddressForm';

const CreateProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    propertyName: '',
    propertyType: '',
    propertySize: '',
    propertyRent: '',
    currencyCode: '',
    status: '',
    propertyDescription: '',
    propertyFacility: '',
    ownerId: ''
  });

  const [addressData, setAddressData] = useState({
    street: '',
    landMark: '',
    area: '',
    city: '',
    pincode: '',
    stateId: '',
    countryId: ''
  });
  
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [availabilityStatuses, setAvailabilityStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchProperty();
    }
  }, [id, isEdit]);

  const fetchInitialData = async () => {
    try {
      console.log('Fetching initial data for CreateProperty...');
      
      const [propertyTypesResponse, currenciesResponse, statusesResponse] = await Promise.all([
        lookupsAPI.getPropertyTypes(),
        lookupsAPI.getCurrencies(),
        lookupsAPI.getAvailabilityStatuses()
      ]);
      
      console.log('API Responses:', {
        propertyTypes: propertyTypesResponse.data,
        currencies: currenciesResponse.data,
        statuses: statusesResponse.data
      });
      
      // Handle the new API response structure: { status: true, responseCode: 0, message: "...", errors: null, data: {...} }
      const propertyTypesData = lookupsAPI.extractData(propertyTypesResponse);
      const currenciesData = lookupsAPI.extractData(currenciesResponse);
      const statusesData = lookupsAPI.extractData(statusesResponse);
      
      console.log('Extracted data:', {
        propertyTypesData,
        currenciesData,
        statusesData
      });
      
      setPropertyTypes(propertyTypesData);
      setCurrencies(currenciesData);
      setAvailabilityStatuses(statusesData);
      
      // Set default owner from user context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        setFormData(prev => ({ ...prev, ownerId: user.id }));
      }
      
      console.log('Initial data fetch completed successfully');
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Set fallback values - using string IDs to match API format
      setPropertyTypes([
        { id: '1', name: 'Apartment', value: 'Apartment' },
        { id: '2', name: 'House', value: 'House' },
        { id: '3', name: 'Studio', value: 'Studio' },
        { id: '4', name: 'Condo', value: 'Condo' },
        { id: '5', name: 'Other', value: 'Other' }
      ]);
      setCurrencies([{ id: '8', name: 'INR', value: 'INR' }]);
      setAvailabilityStatuses([
        { id: '1', name: 'Available', value: 'Available' },
        { id: '2', name: 'Rented', value: 'Rented' },
        { id: '3', name: 'UnderMaintenance', value: 'UnderMaintenance' }
      ]);
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      const property = response.data?.data || response.data;
      
      setFormData({
        propertyName: property.propertyName || '',
        propertyType: property.propertyType || '',
        propertySize: property.propertySize || '',
        propertyRent: property.propertyRent || '',
        currencyCode: property.currencyCode || '',
        status: property.status || '',
        propertyDescription: property.propertyDescription || '',
        propertyFacility: property.propertyFacility || '',
        ownerId: property.ownerId || ''
      });
      
      // If property has address data, set it
      if (property.address) {
        setAddressData({
          street: property.address.street || '',
          landMark: property.address.landMark || '',
          area: property.address.area || '',
          city: property.address.city || '',
          pincode: property.address.pincode || '',
          stateId: property.address.stateId || '',
          countryId: property.address.countryId || ''
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
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

  const handleAddressChange = (newAddressData) => {
    setAddressData(newAddressData);
    
    // Clear address errors
    setAddressErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const newAddressErrors = {};

    // Property validations
    if (!formData.propertyName.trim()) {
      newErrors.propertyName = 'Property name is required';
    }

    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }

    if (!formData.propertySize.trim()) {
      newErrors.propertySize = 'Property size is required';
    }

    if (!formData.propertyRent || parseFloat(formData.propertyRent) <= 0) {
      newErrors.propertyRent = 'Valid property rent is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.propertyDescription.trim()) {
      newErrors.propertyDescription = 'Property description is required';
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Owner is required';
    }

    // Address validations
    if (!addressData.street.trim()) {
      newAddressErrors.street = 'Street address is required';
    }

    if (!addressData.area.trim()) {
      newAddressErrors.area = 'Area is required';
    }

    if (!addressData.city.trim()) {
      newAddressErrors.city = 'City is required';
    }

    if (!addressData.pincode.trim()) {
      newAddressErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(addressData.pincode)) {
      newAddressErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!addressData.stateId) {
      newAddressErrors.stateId = 'State is required';
    }

    if (!addressData.countryId) {
      newAddressErrors.countryId = 'Country is required';
    }

    setErrors(newErrors);
    setAddressErrors(newAddressErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newAddressErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      // Create property with embedded address in a single API call
      const propertyData = {
        propertyName: formData.propertyName,
        propertyType: parseInt(formData.propertyType),
        propertySize: formData.propertySize,
        propertyRent: parseFloat(formData.propertyRent),
        currencyCode: formData.currencyCode ? parseInt(formData.currencyCode) : null,
        status: parseInt(formData.status),
        propertyDescription: formData.propertyDescription,
        propertyFacility: formData.propertyFacility || '',
        ownerId: parseInt(formData.ownerId),
        address: {
          street: addressData.street,
          landMark: addressData.landMark,
          area: addressData.area,
          city: addressData.city,
          pincode: addressData.pincode,
          stateId: parseInt(addressData.stateId),
          countryId: parseInt(addressData.countryId)
        }
      };

      let response;
      if (isEdit) {
        // For edit mode, we might need to keep the old approach or create a new update endpoint
        // For now, let's focus on the create functionality
        response = await propertyAPI.update(id, propertyData);
      } else {
        response = await propertyAPI.create(propertyData);
      }

      // Handle the response
      if (response.status === 200 || response.status === 201) {
        navigate('/properties', { 
          state: { 
            message: `Property ${isEdit ? 'updated' : 'created'} successfully!`,
            severity: 'success'
          }
        });
      } else {
        throw new Error('Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setSubmitError(error.message || `Failed to ${isEdit ? 'update' : 'create'} property. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

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

      <Card sx={{ maxWidth: 1000, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>
              Property Information
            </Typography>

            <Grid container spacing={3}>
              {/* Property Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Name"
                  value={formData.propertyName}
                  onChange={handleChange('propertyName')}
                  error={!!errors.propertyName}
                  helperText={errors.propertyName}
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

              {/* Property Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.propertyType} required>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={formData.propertyType}
                    onChange={handleChange('propertyType')}
                    label="Property Type"
                  >
                    {propertyTypes.map(type => (
                      <MenuItem key={type.id || type.Id} value={type.id || type.Id}>
                        {type.name || type.Name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.propertyType && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.propertyType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Property Size */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Size"
                  value={formData.propertySize}
                  onChange={handleChange('propertySize')}
                  error={!!errors.propertySize}
                  helperText={errors.propertySize || 'e.g., 2BHK, 1500 sq ft'}
                  required
                  placeholder="e.g., 2BHK, 1500 sq ft"
                />
              </Grid>

              {/* Property Rent */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Rent"
                  type="number"
                  value={formData.propertyRent}
                  onChange={handleChange('propertyRent')}
                  error={!!errors.propertyRent}
                  helperText={errors.propertyRent}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Currency */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.currencyCode}
                    onChange={handleChange('currencyCode')}
                    label="Currency"
                  >
                    {currencies.map(currency => (
                      <MenuItem key={currency.id || currency.Id} value={currency.id || currency.Id}>
                        {currency.name || currency.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.status} required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleChange('status')}
                    label="Status"
                  >
                    {availabilityStatuses.map(status => (
                      <MenuItem key={status.id || status.Id} value={status.id || status.Id}>
                        {status.name || status.Name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Property Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Property Description"
                  value={formData.propertyDescription}
                  onChange={handleChange('propertyDescription')}
                  error={!!errors.propertyDescription}
                  helperText={errors.propertyDescription}
                  required
                  placeholder="Describe the property features, amenities, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Property Facility */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Property Facilities"
                  value={formData.propertyFacility}
                  onChange={handleChange('propertyFacility')}
                  placeholder="e.g., Gym, Pool, Parking, Security, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Address Section */}
            <AddressForm 
              onAddressChange={handleAddressChange}
              initialData={addressData}
              errors={addressErrors}
            />

            {/* Submit Button */}
            <Box mt={4} display="flex" justifyContent="space-between">
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
                disabled={loading}
                startIcon={<Save />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Property' : 'Create Property')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProperty;
