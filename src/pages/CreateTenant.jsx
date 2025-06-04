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
  Person,
  Email,
  Phone,
  Home,
  CalendarMonth,
  AttachMoney,
  ContactPhone,
  CreditCard,
  LocationOn,
  Description,
  Note
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantAPI, roomAPI, propertyAPI, lookupsAPI } from '../services/api';

const CreateTenant = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    tenantName: '',
    tenantMobile: '',
    tenantEmail: '',
    tenantAdharId: '',
    tenantProfilePic: '',
    tenantDocument: '',
    permanentAddress: {
      street: '',
      landMark: '',
      area: '',
      city: '',
      pincode: '',
      stateId: '',
      countryId: ''
    },
    currentAddress: {
      street: '',
      landMark: '',
      area: '',
      city: '',
      pincode: '',
      stateId: '',
      countryId: ''
    },
    tenantRoomNo: '',
    lockInPeriod: '',
    note: '',
    deposited: '',
    presentRentValue: '',
    pastRentValue: '',
    currencyCode: '',
    boardingDate: '',
    ownerId: '',
    propertyId: '',
    roomId: ''
  });
  
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    fetchLookupData();
    fetchProperties();
    
    // Set owner ID from logged-in user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1;
    setFormData(prev => ({
      ...prev,
      ownerId: ownerId
    }));
    
    if (isEdit) {
      fetchTenant();
    }
  }, [id, isEdit]);

  // Fetch rooms when property changes
  useEffect(() => {
    if (formData.propertyId) {
      fetchRoomsByProperty(formData.propertyId);
    }
  }, [formData.propertyId]);

  const fetchLookupData = async () => {
    try {
      const [currenciesRes, statesRes, countriesRes] = await Promise.all([
        lookupsAPI.getCurrencies(),
        lookupsAPI.getStates(),
        lookupsAPI.getCountries()
      ]);

      const extractedCurrencies = lookupsAPI.extractData(currenciesRes);
      const extractedStates = lookupsAPI.extractData(statesRes);
      const extractedCountries = lookupsAPI.extractData(countriesRes);
      
      setCurrencies(extractedCurrencies);
      setStates(extractedStates);
      setCountries(extractedCountries);
      
      // Set default values
      if (!isEdit && extractedCurrencies.length > 0 && extractedStates.length > 0 && extractedCountries.length > 0) {
        setFormData(prev => ({
          ...prev,
          currencyCode: extractedCurrencies.find(c => c.value === 'INR')?.id || extractedCurrencies[0]?.id || '8',
          permanentAddress: {
            ...prev.permanentAddress,
            stateId: extractedStates[0]?.id || '1',
            countryId: extractedCountries[0]?.id || '1'
          },
          currentAddress: {
            ...prev.currentAddress,
            stateId: extractedStates[0]?.id || '1',
            countryId: extractedCountries[0]?.id || '1'
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      // Set fallback data
      setCurrencies([{ id: '8', name: 'INR', value: 'INR' }]);
      setStates([{ id: '1', name: 'Maharashtra', value: 'Maharashtra' }]);
      setCountries([{ id: '1', name: 'India', value: 'India' }]);
      
      if (!isEdit) {
        setFormData(prev => ({
          ...prev,
          currencyCode: '8',
          permanentAddress: {
            ...prev.permanentAddress,
            stateId: '1',
            countryId: '1'
          },
          currentAddress: {
            ...prev.currentAddress,
            stateId: '1',
            countryId: '1'
          }
        }));
      }
    }
  };

  const fetchProperties = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      const response = await lookupsAPI.getProperties(ownerId);
      const extractedProperties = lookupsAPI.extractData(response);
      
      if (extractedProperties && extractedProperties.length > 0) {
        setProperties(extractedProperties);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const fetchRoomsByProperty = async (propertyId) => {
    try {
      const response = await roomAPI.getAll();
      // Filter rooms by property and show available rooms only (or current room if editing)
      const propertyRooms = response.data?.filter(room => 
        room.propertyId === parseInt(propertyId) && 
        (!room.isOccupied || (isEdit && room.id === parseInt(formData.roomId)))
      ) || [];
      setRooms(propertyRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchTenant = async () => {
    try {
      const response = await tenantAPI.getById(id);
      const tenant = response.data;
      setFormData({
        tenantName: tenant.tenantName || '',
        tenantMobile: tenant.tenantMobile || '',
        tenantEmail: tenant.tenantEmail || '',
        tenantAdharId: tenant.tenantAdharId || '',
        tenantProfilePic: tenant.tenantProfilePic || '',
        tenantDocument: tenant.tenantDocument || '',
        permanentAddress: {
          street: tenant.permanentAddress?.street || '',
          landMark: tenant.permanentAddress?.landMark || '',
          area: tenant.permanentAddress?.area || '',
          city: tenant.permanentAddress?.city || '',
          pincode: tenant.permanentAddress?.pincode || '',
          stateId: tenant.permanentAddress?.stateId || '',
          countryId: tenant.permanentAddress?.countryId || ''
        },
        currentAddress: {
          street: tenant.currentAddress?.street || '',
          landMark: tenant.currentAddress?.landMark || '',
          area: tenant.currentAddress?.area || '',
          city: tenant.currentAddress?.city || '',
          pincode: tenant.currentAddress?.pincode || '',
          stateId: tenant.currentAddress?.stateId || '',
          countryId: tenant.currentAddress?.countryId || ''
        },
        tenantRoomNo: tenant.tenantRoomNo || '',
        lockInPeriod: tenant.lockInPeriod || '',
        note: tenant.note || '',
        deposited: tenant.deposited || '',
        presentRentValue: tenant.presentRentValue || '',
        pastRentValue: tenant.pastRentValue || '',
        currencyCode: tenant.currencyCode || '',
        boardingDate: tenant.boardingDate ? new Date(tenant.boardingDate).toISOString().split('T')[0] : '',
        ownerId: tenant.ownerId || '',
        propertyId: tenant.propertyId || '',
        roomId: tenant.roomId || ''
      });
    } catch (error) {
      console.error('Error fetching tenant:', error);
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

  const handleSameAddressToggle = () => {
    const newSameAddress = !sameAddress;
    setSameAddress(newSameAddress);
    
    if (newSameAddress) {
      // Copy permanent address to current address
      setFormData(prev => ({
        ...prev,
        currentAddress: { ...prev.permanentAddress }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.tenantName.trim()) {
      newErrors.tenantName = 'Tenant name is required';
    }

    if (!formData.tenantMobile.trim()) {
      newErrors.tenantMobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.tenantMobile.trim())) {
      newErrors.tenantMobile = 'Mobile number must be exactly 10 digits';
    }

    if (formData.tenantEmail && !/\S+@\S+\.\S+/.test(formData.tenantEmail)) {
      newErrors.tenantEmail = 'Email is invalid';
    }

    if (!formData.tenantAdharId.trim()) {
      newErrors.tenantAdharId = 'Aadhaar ID is required';
    } else if (!/^\d{12}$/.test(formData.tenantAdharId.trim())) {
      newErrors.tenantAdharId = 'Aadhaar ID must be exactly 12 digits';
    }

    if (!formData.tenantRoomNo) {
      newErrors.tenantRoomNo = 'Room number is required';
    }

    if (!formData.lockInPeriod.trim()) {
      newErrors.lockInPeriod = 'Lock-in period is required';
    }

    if (!formData.deposited || isNaN(parseFloat(formData.deposited))) {
      newErrors.deposited = 'Deposit amount is required and must be a valid number';
    }

    if (!formData.boardingDate) {
      newErrors.boardingDate = 'Boarding date is required';
    }

    if (!formData.propertyId) {
      newErrors.propertyId = 'Property is required';
    }

    // Address validation
    ['permanentAddress', 'currentAddress'].forEach(addressType => {
      const address = formData[addressType];
      if (!address.street.trim()) {
        newErrors[`${addressType}.street`] = 'Street is required';
      }
      if (!address.city.trim()) {
        newErrors[`${addressType}.city`] = 'City is required';
      }
      if (!address.pincode.trim()) {
        newErrors[`${addressType}.pincode`] = 'Pincode is required';
      } else if (!/^\d{6}$/.test(address.pincode.trim())) {
        newErrors[`${addressType}.pincode`] = 'Pincode must be exactly 6 digits';
      }
      if (!address.stateId) {
        newErrors[`${addressType}.stateId`] = 'State is required';
      }
      if (!address.countryId) {
        newErrors[`${addressType}.countryId`] = 'Country is required';
      }
    });

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
        tenantName: formData.tenantName,
        tenantMobile: formData.tenantMobile,
        tenantEmail: formData.tenantEmail || null,
        tenantAdharId: formData.tenantAdharId,
        tenantProfilePic: formData.tenantProfilePic || null,
        tenantDocument: formData.tenantDocument || null,
        permanentAddress: {
          street: formData.permanentAddress.street,
          landMark: formData.permanentAddress.landMark,
          area: formData.permanentAddress.area,
          city: formData.permanentAddress.city,
          pincode: formData.permanentAddress.pincode,
          stateId: parseInt(formData.permanentAddress.stateId),
          countryId: parseInt(formData.permanentAddress.countryId)
        },
        currentAddress: {
          street: formData.currentAddress.street,
          landMark: formData.currentAddress.landMark,
          area: formData.currentAddress.area,
          city: formData.currentAddress.city,
          pincode: formData.currentAddress.pincode,
          stateId: parseInt(formData.currentAddress.stateId),
          countryId: parseInt(formData.currentAddress.countryId)
        },
        tenantRoomNo: parseInt(formData.tenantRoomNo),
        lockInPeriod: formData.lockInPeriod,
        note: formData.note || null,
        deposited: parseFloat(formData.deposited),
        presentRentValue: formData.presentRentValue ? parseFloat(formData.presentRentValue) : null,
        pastRentValue: formData.pastRentValue ? parseFloat(formData.pastRentValue) : null,
        currencyCode: formData.currencyCode ? parseInt(formData.currencyCode) : null,
        boardingDate: formData.boardingDate,
        ownerId: parseInt(formData.ownerId),
        propertyId: parseInt(formData.propertyId),
        roomId: formData.roomId ? parseInt(formData.roomId) : null
      };

      console.log('Submitting tenant data:', submitData);

      if (isEdit) {
        await tenantAPI.update(id, submitData);
      } else {
        await tenantAPI.create(submitData);
      }

      navigate('/tenants');
    } catch (error) {
      console.error('Error submitting tenant:', error);
      
      let errorMessage = 'An error occurred while saving the tenant';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          if (typeof errorData.errors === 'string') {
            errorMessage = errorData.errors;
          } else if (typeof errorData.errors === 'object') {
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
        <IconButton onClick={() => navigate('/tenants')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" color="#000" fontWeight="bold">
          {isEdit ? 'Edit Tenant' : 'Create New Tenant'}
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 1200, border: '1px solid #e0e0e0' }}>
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
                  label="Tenant Name"
                  value={formData.tenantName}
                  onChange={handleChange('tenantName')}
                  error={!!errors.tenantName}
                  helperText={errors.tenantName}
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
                  label="Mobile Number"
                  value={formData.tenantMobile}
                  onChange={handleChange('tenantMobile')}
                  error={!!errors.tenantMobile}
                  helperText={errors.tenantMobile || 'Enter 10-digit mobile number'}
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
                  label="Email Address"
                  type="email"
                  value={formData.tenantEmail}
                  onChange={handleChange('tenantEmail')}
                  error={!!errors.tenantEmail}
                  helperText={errors.tenantEmail || 'Optional'}
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
                  label="Aadhaar ID"
                  value={formData.tenantAdharId}
                  onChange={handleChange('tenantAdharId')}
                  error={!!errors.tenantAdharId}
                  helperText={errors.tenantAdharId || 'Enter 12-digit Aadhaar number'}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Profile Picture URL"
                  value={formData.tenantProfilePic}
                  onChange={handleChange('tenantProfilePic')}
                  helperText="Optional - URL to tenant's profile picture"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Document URL"
                  value={formData.tenantDocument}
                  onChange={handleChange('tenantDocument')}
                  helperText="Optional - URL to tenant's documents"
                />
              </Grid>

              {/* Property and Room Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                  Property & Room Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.propertyId} required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={properties.length > 0 ? formData.propertyId : ''}
                    onChange={handleChange('propertyId')}
                    label="Property"
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

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Room (Optional)</InputLabel>
                  <Select
                    value={rooms.length > 0 ? formData.roomId : ''}
                    onChange={handleChange('roomId')}
                    label="Room (Optional)"
                    disabled={!formData.propertyId}
                  >
                    <MenuItem value="">
                      <em>No specific room</em>
                    </MenuItem>
                    {rooms.map(room => (
                      <MenuItem key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.roomType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  type="number"
                  value={formData.tenantRoomNo}
                  onChange={handleChange('tenantRoomNo')}
                  error={!!errors.tenantRoomNo}
                  helperText={errors.tenantRoomNo || 'Room number assigned to tenant'}
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lock-in Period"
                  value={formData.lockInPeriod}
                  onChange={handleChange('lockInPeriod')}
                  error={!!errors.lockInPeriod}
                  helperText={errors.lockInPeriod || 'e.g., 6 months, 1 year'}
                  required
                />
              </Grid>

              {/* Financial Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                  Financial Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deposit Amount"
                  type="number"
                  value={formData.deposited}
                  onChange={handleChange('deposited')}
                  error={!!errors.deposited}
                  helperText={errors.deposited || 'Security deposit paid by tenant'}
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
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={currencies.length > 0 ? formData.currencyCode : ''}
                    onChange={handleChange('currencyCode')}
                    label="Currency"
                  >
                    {currencies.map(currency => (
                      <MenuItem key={currency.id || currency.value} value={currency.id || currency.value}>
                        {currency.name || currency.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Present Rent Value"
                  type="number"
                  value={formData.presentRentValue}
                  onChange={handleChange('presentRentValue')}
                  helperText="Current monthly rent amount (optional)"
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
                <TextField
                  fullWidth
                  label="Past Rent Value"
                  type="number"
                  value={formData.pastRentValue}
                  onChange={handleChange('pastRentValue')}
                  helperText="Previous rent amount (optional)"
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
                <TextField
                  fullWidth
                  label="Boarding Date"
                  type="date"
                  value={formData.boardingDate}
                  onChange={handleChange('boardingDate')}
                  error={!!errors.boardingDate}
                  helperText={errors.boardingDate || 'Date when tenant moved in'}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Permanent Address */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                  Permanent Address
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.permanentAddress.street}
                  onChange={handleChange('permanentAddress.street')}
                  error={!!errors['permanentAddress.street']}
                  helperText={errors['permanentAddress.street']}
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
                  value={formData.permanentAddress.landMark}
                  onChange={handleChange('permanentAddress.landMark')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area"
                  value={formData.permanentAddress.area}
                  onChange={handleChange('permanentAddress.area')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.permanentAddress.city}
                  onChange={handleChange('permanentAddress.city')}
                  error={!!errors['permanentAddress.city']}
                  helperText={errors['permanentAddress.city']}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.permanentAddress.pincode}
                  onChange={handleChange('permanentAddress.pincode')}
                  error={!!errors['permanentAddress.pincode']}
                  helperText={errors['permanentAddress.pincode'] || 'Enter 6-digit pincode'}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors['permanentAddress.stateId']} required>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={states.length > 0 ? formData.permanentAddress.stateId : ''}
                    onChange={handleChange('permanentAddress.stateId')}
                    label="State"
                  >
                    {states.map(state => (
                      <MenuItem key={state.id || state.value} value={state.id || state.value}>
                        {state.name || state.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['permanentAddress.stateId'] && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors['permanentAddress.stateId']}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors['permanentAddress.countryId']} required>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={countries.length > 0 ? formData.permanentAddress.countryId : ''}
                    onChange={handleChange('permanentAddress.countryId')}
                    label="Country"
                  >
                    {countries.map(country => (
                      <MenuItem key={country.id || country.value} value={country.id || country.value}>
                        {country.name || country.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['permanentAddress.countryId'] && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors['permanentAddress.countryId']}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Current Address */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                    Current Address
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSameAddressToggle}
                    sx={{ mb: 1 }}
                  >
                    {sameAddress ? 'Different Address' : 'Same as Permanent'}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.currentAddress.street}
                  onChange={handleChange('currentAddress.street')}
                  error={!!errors['currentAddress.street']}
                  helperText={errors['currentAddress.street']}
                  required
                  disabled={sameAddress}
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
                  value={formData.currentAddress.landMark}
                  onChange={handleChange('currentAddress.landMark')}
                  disabled={sameAddress}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area"
                  value={formData.currentAddress.area}
                  onChange={handleChange('currentAddress.area')}
                  disabled={sameAddress}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.currentAddress.city}
                  onChange={handleChange('currentAddress.city')}
                  error={!!errors['currentAddress.city']}
                  helperText={errors['currentAddress.city']}
                  required
                  disabled={sameAddress}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.currentAddress.pincode}
                  onChange={handleChange('currentAddress.pincode')}
                  error={!!errors['currentAddress.pincode']}
                  helperText={errors['currentAddress.pincode'] || 'Enter 6-digit pincode'}
                  required
                  disabled={sameAddress}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors['currentAddress.stateId']} required>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={states.length > 0 ? formData.currentAddress.stateId : ''}
                    onChange={handleChange('currentAddress.stateId')}
                    label="State"
                    disabled={sameAddress}
                  >
                    {states.map(state => (
                      <MenuItem key={state.id || state.value} value={state.id || state.value}>
                        {state.name || state.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['currentAddress.stateId'] && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors['currentAddress.stateId']}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors['currentAddress.countryId']} required>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={countries.length > 0 ? formData.currentAddress.countryId : ''}
                    onChange={handleChange('currentAddress.countryId')}
                    label="Country"
                    disabled={sameAddress}
                  >
                    {countries.map(country => (
                      <MenuItem key={country.id || country.value} value={country.id || country.value}>
                        {country.name || country.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['currentAddress.countryId'] && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors['currentAddress.countryId']}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Additional Notes */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="#000" fontWeight="bold">
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={formData.note}
                  onChange={handleChange('note')}
                  placeholder="Any additional notes about the tenant..."
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

