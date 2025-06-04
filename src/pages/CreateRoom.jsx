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
  Room,
  AttachMoney,
  Home,
  LocationOn,
  Photo,
  Description,
  Note,
  People
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { roomAPI, propertyAPI, lookupsAPI } from '../services/api';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const preselectedPropertyId = searchParams.get('propertyId');

  const [formData, setFormData] = useState({
    roomNo: '',
    propertyId: preselectedPropertyId || '',
    ownerId: '',
    roomType: '',
    roomSize: '',
    roomRent: '',
    currencyCode: '',
    status: '', // Start empty to avoid MUI select errors
    roomPic: '',
    roomDescription: '',
    roomFacility: '',
    address: {
      street: '',
      landMark: '',
      area: '',
      city: '',
      pincode: '',
      stateId: '',
      countryId: ''
    },
    tenantLimit: '',
    note: ''
  });
  
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [availabilityStatuses, setAvailabilityStatuses] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchProperties();
    fetchLookupData();
    
    // Set owner ID from logged-in user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1;
    setFormData(prev => ({
      ...prev,
      ownerId: ownerId
    }));
    
    if (isEdit) {
      fetchRoom();
    }
  }, [id, isEdit]);

  const fetchProperties = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      // Use the properties lookup API endpoint that returns consistent data format
      const response = await lookupsAPI.getProperties(ownerId);
      
      // Use the extractData helper to handle the API response consistently
      const extractedProperties = lookupsAPI.extractData(response);
      
      if (extractedProperties && extractedProperties.length > 0) {
        setProperties(extractedProperties);
        console.log('Properties loaded via lookups API:', extractedProperties);
      } else {
        console.warn('No properties found for owner via lookups API');
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties via lookups API:', error);
      // Fallback: Set empty array
      setProperties([]);
    }
  };

  const fetchLookupData = async () => {
    try {
      const [roomTypesRes, currenciesRes, statusesRes, statesRes, countriesRes] = await Promise.all([
        lookupsAPI.getRoomTypes(),
        lookupsAPI.getCurrencies(),
        lookupsAPI.getAvailabilityStatuses(),
        lookupsAPI.getStates(),
        lookupsAPI.getCountries()
      ]);

      // Handle the new API response structure: { status: true, responseCode: 0, message: "...", errors: null, data: {...} }
      const extractedRoomTypes = lookupsAPI.extractData(roomTypesRes);
      const extractedCurrencies = lookupsAPI.extractData(currenciesRes);
      const extractedStatuses = lookupsAPI.extractData(statusesRes);
      const extractedStates = lookupsAPI.extractData(statesRes);
      const extractedCountries = lookupsAPI.extractData(countriesRes);
      
      setRoomTypes(extractedRoomTypes);
      setCurrencies(extractedCurrencies);
      setAvailabilityStatuses(extractedStatuses);
      setStates(extractedStates);
      setCountries(extractedCountries);
      
      // Set default values after data loads to avoid MUI select errors
      if (!isEdit && extractedStatuses.length > 0 && extractedCurrencies.length > 0) {
        setFormData(prev => ({
          ...prev,
          status: extractedStatuses[0]?.id || '1', // Default to first available status (typically "Available")
          currencyCode: extractedCurrencies.find(c => c.value === 'INR')?.id || extractedCurrencies[0]?.id || '8'
        }));
      }
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      // Set fallback data for room types - using string IDs to match API format
      setRoomTypes([
        { id: '1', name: 'Master Bedroom', value: 'MasterBedroom' },
        { id: '2', name: 'Guest Bedroom', value: 'GuestBedroom' },
        { id: '3', name: 'Studio', value: 'Studio' },
        { id: '6', name: 'Single Room', value: 'SingleRoom' },
        { id: '7', name: 'Shared Room', value: 'SharedRoom' }
      ]);
      setCurrencies([{ id: '8', name: 'INR', value: 'INR' }]);
      setAvailabilityStatuses([
        { id: '1', name: 'Available', value: 'Available' },
        { id: '4', name: 'Rented', value: 'Rented' },
        { id: '6', name: 'Under Maintenance', value: 'UnderMaintenance' }
      ]);
      setStates([
        { id: '1', name: 'Maharashtra', value: 'Maharashtra' },
        { id: '2', name: 'Delhi', value: 'Delhi' },
        { id: '3', name: 'Karnataka', value: 'Karnataka' }
      ]);
      setCountries([
        { id: '1', name: 'India', value: 'India' }
      ]);
      
      // Set default values even for fallback data
      if (!isEdit) {
        setFormData(prev => ({
          ...prev,
          status: '1',
          currencyCode: '8',
          address: {
            ...prev.address,
            stateId: '1',
            countryId: '1'
          }
        }));
      }
    }
  };

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getById(id);
      const room = response.data;
      setFormData({
        roomNo: room.roomNo || '',
        propertyId: room.propertyId || '',
        ownerId: room.ownerId || '',
        roomType: room.roomType || '',
        roomSize: room.roomSize || '',
        roomRent: room.roomRent || '',
        currencyCode: room.currencyCode || '',
        status: room.status || 1,
        roomPic: room.roomPic || '',
        roomDescription: room.roomDescription || '',
        roomFacility: room.roomFacility || '',
        address: {
          street: room.address?.street || '',
          landMark: room.address?.landMark || '',
          area: room.address?.area || '',
          city: room.address?.city || '',
          pincode: room.address?.pincode || '',
          stateId: room.address?.stateId || '',
          countryId: room.address?.countryId || ''
        },
        tenantLimit: room.tenantLimit || '',
        note: room.note || ''
      });
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    if (field.includes('.')) {
      // Handle nested address fields
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
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

    if (!formData.roomNo || !formData.roomNo.toString().trim()) {
      newErrors.roomNo = 'Room number is required';
    }

    if (!formData.propertyId) {
      newErrors.propertyId = 'Property is required';
    }

    if (!formData.roomType) {
      newErrors.roomType = 'Room type is required';
    }

    if (!formData.roomRent || isNaN(parseFloat(formData.roomRent))) {
      newErrors.roomRent = 'Room rent must be a valid number';
    }

    if (!formData.currencyCode) {
      newErrors.currencyCode = 'Currency is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.tenantLimit || isNaN(parseInt(formData.tenantLimit))) {
      newErrors.tenantLimit = 'Tenant limit must be a valid number';
    }

    // Address validation
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.pincode.trim()) {
      newErrors['address.pincode'] = 'Pincode is required';
    }

    if (!formData.address.stateId) {
      newErrors['address.stateId'] = 'State is required';
    }

    if (!formData.address.countryId) {
      newErrors['address.countryId'] = 'Country is required';
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
        roomNo: parseInt(formData.roomNo),
        propertyId: parseInt(formData.propertyId),
        ownerId: parseInt(formData.ownerId),
        roomType: parseInt(formData.roomType),
        roomSize: formData.roomSize,
        roomRent: parseFloat(formData.roomRent),
        currencyCode: parseInt(formData.currencyCode),
        status: parseInt(formData.status),
        roomPic: formData.roomPic,
        roomDescription: formData.roomDescription,
        roomFacility: formData.roomFacility,
        address: {
          street: formData.address.street,
          landMark: formData.address.landMark,
          area: formData.address.area,
          city: formData.address.city,
          pincode: formData.address.pincode,
          stateId: parseInt(formData.address.stateId),
          countryId: parseInt(formData.address.countryId)
        },
        tenantLimit: parseInt(formData.tenantLimit),
        note: formData.note
      };

      console.log('Submitting room data:', submitData);

      if (isEdit) {
        await roomAPI.update(id, submitData);
      } else {
        await roomAPI.create(submitData);
      }

      navigate('/rooms');
    } catch (error) {
      console.error('Error submitting room:', error);
      console.error('Error response:', error.response?.data);
      
      // Fix React rendering error by ensuring we pass a string to Alert
      let errorMessage = 'An error occurred while saving the room';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Handle validation errors object
          if (typeof errorData.errors === 'string') {
            errorMessage = errorData.errors;
          } else if (typeof errorData.errors === 'object') {
            // Convert validation errors object to readable string
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                } else {
                  return `${field}: ${messages}`;
                }
              })
              .join('; ');
            errorMessage = errorMessages || 'Validation errors occurred';
          }
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
                  type="number"
                  value={formData.roomNo}
                  onChange={handleChange('roomNo')}
                  error={!!errors.roomNo}
                  helperText={errors.roomNo}
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
                    value={properties.length > 0 ? formData.propertyId : ''}
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

              {/* Room Type and Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.roomType} required>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    value={roomTypes.length > 0 ? formData.roomType : ''}
                    onChange={handleChange('roomType')}
                    label="Room Type"
                  >
                    {roomTypes.map(type => (
                      <MenuItem key={type.id || type.value} value={type.id || type.value}>
                        {type.name || type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roomType && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.roomType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.status} required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={availabilityStatuses.length > 0 ? formData.status : ''}
                    onChange={handleChange('status')}
                    label="Status"
                  >
                    {availabilityStatuses.map(status => (
                      <MenuItem key={status.id || status.value} value={status.id || status.value}>
                        {status.name || status.label}
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

              {/* Room Rent and Currency */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Rent"
                  type="number"
                  value={formData.roomRent}
                  onChange={handleChange('roomRent')}
                  error={!!errors.roomRent}
                  helperText={errors.roomRent || 'Monthly rent amount'}
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

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.currencyCode} required>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={currencies.length > 0 ? formData.currencyCode : ''}
                    onChange={handleChange('currencyCode')}
                    label="Currency"
                  >
                    {currencies.map(currency => (
                      <MenuItem key={currency.id || currency.value} value={currency.id || currency.value}>
                        {currency.name || currency.label} ({currency.symbol || currency.code})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.currencyCode && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.currencyCode}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Room Size and Tenant Limit */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Size"
                  value={formData.roomSize}
                  onChange={handleChange('roomSize')}
                  helperText="Room size (e.g., 12x15 ft, 200 sq ft)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenant Limit"
                  type="number"
                  value={formData.tenantLimit}
                  onChange={handleChange('tenantLimit')}
                  error={!!errors.tenantLimit}
                  helperText={errors.tenantLimit || 'Maximum number of tenants'}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <People />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Room Picture */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Room Picture URL"
                  value={formData.roomPic}
                  onChange={handleChange('roomPic')}
                  helperText="URL of room image"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Photo />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Room Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Room Description"
                  value={formData.roomDescription}
                  onChange={handleChange('roomDescription')}
                  placeholder="Enter room description, amenities, etc..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Room Facility */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Room Facilities"
                  value={formData.roomFacility}
                  onChange={handleChange('roomFacility')}
                  placeholder="List room facilities (AC, WiFi, Attached Bathroom, etc.)"
                />
              </Grid>

              {/* Address Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                  Room Address
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.address.street}
                  onChange={handleChange('address.street')}
                  error={!!errors['address.street']}
                  helperText={errors['address.street']}
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Landmark"
                  value={formData.address.landMark}
                  onChange={handleChange('address.landMark')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area"
                  value={formData.address.area}
                  onChange={handleChange('address.area')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.address.city}
                  onChange={handleChange('address.city')}
                  error={!!errors['address.city']}
                  helperText={errors['address.city']}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.address.pincode}
                  onChange={handleChange('address.pincode')}
                  error={!!errors['address.pincode']}
                  helperText={errors['address.pincode']}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors['address.stateId']} required>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={states.length > 0 ? formData.address.stateId : ''}
                    onChange={handleChange('address.stateId')}
                    label="State"
                  >
                    {states.map(state => (
                      <MenuItem key={state.id || state.value} value={state.id || state.value}>
                        {state.name || state.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['address.stateId'] && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors['address.stateId']}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors['address.countryId']} required>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={countries.length > 0 ? formData.address.countryId : ''}
                    onChange={handleChange('address.countryId')}
                    label="Country"
                  >
                    {countries.map(country => (
                      <MenuItem key={country.id || country.value} value={country.id || country.value}>
                        {country.name || country.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['address.countryId'] && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors['address.countryId']}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Note */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  value={formData.note}
                  onChange={handleChange('note')}
                  placeholder="Any additional notes or special instructions..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Note />
                      </InputAdornment>
                    ),
                  }}
                />
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
