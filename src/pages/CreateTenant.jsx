import React, { useState, useEffect, useRef } from 'react';
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
  CreditCard,
  Note
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantAPI, roomAPI, propertyAPI, lookupsAPI } from '../services/api';
import AddressForm from '../components/AddressForm';

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

  const [permanentAddressData, setPermanentAddressData] = useState({
    street: '',
    landMark: '',
    area: '',
    city: '',
    pincode: '',
    stateId: '',
    countryId: ''
  });

  const [currentAddressData, setCurrentAddressData] = useState({
    street: '',
    landMark: '',
    area: '',
    city: '',
    pincode: '',
    stateId: '',
    countryId: ''
  });

  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
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
  const prevPropertyId = useRef(formData.propertyId);
  useEffect(() => {
    if (formData.propertyId) {
      // Only clear selected room if property actually changed (not on initial load or room selection)
      if (prevPropertyId.current && prevPropertyId.current !== formData.propertyId) {
        setFormData(prev => ({
          ...prev,
          roomId: ''
        }));
      }
      prevPropertyId.current = formData.propertyId;
      fetchRoomsByProperty(formData.propertyId);
    } else {
      // Clear rooms if no property selected
      setRooms([]);
      setFormData(prev => ({
        ...prev,
        roomId: ''
      }));
      prevPropertyId.current = formData.propertyId;
    }
  }, [formData.propertyId]);

  const fetchLookupData = async () => {
    try {
      const currenciesResponse = await lookupsAPI.getCurrencies();
      const extractedCurrencies = lookupsAPI.extractData(currenciesResponse);
      setCurrencies(extractedCurrencies || []);
      
      // Set default currency if not editing
      if (!isEdit && extractedCurrencies && extractedCurrencies.length > 0) {
        const defaultCurrency = extractedCurrencies.find(c => c.value === 'INR') || extractedCurrencies[0];
        setFormData(prev => ({
          ...prev,
          currencyCode: defaultCurrency.id || defaultCurrency.value || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      setCurrencies([]);
    }
  };

  const fetchProperties = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      const response = await lookupsAPI.getProperties(ownerId);
      const extractedProperties = lookupsAPI.extractData(response);
      setProperties(extractedProperties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const fetchRoomsByProperty = async (propertyId) => {
    try {
      console.log('Fetching rooms for property ID:', propertyId);
      setRooms([]); // Clear existing rooms first
      
      const response = await roomAPI.getByProperty(propertyId);
      console.log('Rooms API response:', response);
      
      // Handle different response structures
      let roomsData = [];
      if (response) {
        if (Array.isArray(response)) {
          roomsData = response;
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            roomsData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            roomsData = response.data.data;
          } else if (response.data.result && Array.isArray(response.data.result)) {
            roomsData = response.data.result;
          }
        }
      }
      
      // Ensure each room has proper id and structure
      const processedRooms = roomsData.map(room => ({
        id: room.id || room.roomId,
        roomNo: room.roomNo || room.roomNumber || 'N/A',
        roomType: room.roomType || 'Standard',
        ...room // keep original data
      })).filter(room => room.id); // Only keep rooms with valid IDs
      
      console.log('Processed rooms data:', processedRooms);
      setRooms(processedRooms);
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      console.error('Error response:', error.response);
      setRooms([]);
      
      // Show error message to user
      setSubmitError(`Failed to load rooms for selected property: ${error.message}`);
      // Clear error after 5 seconds
      setTimeout(() => setSubmitError(''), 5000);
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

      // Set address data
      if (tenant.permanentAddress) {
        setPermanentAddressData(tenant.permanentAddress);
      }
      if (tenant.currentAddress) {
        setCurrentAddressData(tenant.currentAddress);
      }
    } catch (error) {
      console.error('Error fetching tenant:', error);
      setSubmitError('Failed to load tenant data');
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value === null || value === undefined ? '' : value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermanentAddressChange = (addressData) => {
    setPermanentAddressData(addressData);
    if (sameAddress) {
      setCurrentAddressData(addressData);
    }
    // Clear address errors
    setAddressErrors(prev => ({
      ...prev,
      permanent: {}
    }));
  };

  const handleCurrentAddressChange = (addressData) => {
    if (!sameAddress) {
      setCurrentAddressData(addressData);
    }
    // Clear address errors
    setAddressErrors(prev => ({
      ...prev,
      current: {}
    }));
  };

  const handleSameAddressToggle = () => {
    const newSameAddress = !sameAddress;
    setSameAddress(newSameAddress);
    
    if (newSameAddress) {
      setCurrentAddressData(permanentAddressData);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const newAddressErrors = { permanent: {}, current: {} };

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

    if (!formData.lockInPeriod.trim()) {
      newErrors.lockInPeriod = 'Lock-in period is required';
    }

    if (!formData.deposited || isNaN(parseFloat(formData.deposited)) || parseFloat(formData.deposited) <= 0) {
      newErrors.deposited = 'Deposit amount is required and must be greater than 0';
    }

    if (!formData.boardingDate) {
      newErrors.boardingDate = 'Boarding date is required';
    }

    if (!formData.propertyId) {
      newErrors.propertyId = 'Property is required';
    }

    // Address validation
    const validateAddress = (address, type) => {
      if (!address.street.trim()) {
        newAddressErrors[type].street = 'Street is required';
      }
      if (!address.city.trim()) {
        newAddressErrors[type].city = 'City is required';
      }
      if (!address.pincode.trim()) {
        newAddressErrors[type].pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(address.pincode.trim())) {
        newAddressErrors[type].pincode = 'Pincode must be exactly 6 digits';
      }
      if (!address.stateId) {
        newAddressErrors[type].stateId = 'State is required';
      }
      if (!address.countryId) {
        newAddressErrors[type].countryId = 'Country is required';
      }
    };

    validateAddress(permanentAddressData, 'permanent');
    validateAddress(currentAddressData, 'current');

    setErrors(newErrors);
    setAddressErrors(newAddressErrors);
    
    const hasFormErrors = Object.keys(newErrors).length > 0;
    const hasAddressErrors = Object.keys(newAddressErrors.permanent).length > 0 || Object.keys(newAddressErrors.current).length > 0;
    
    return !hasFormErrors && !hasAddressErrors;
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
        tenantName: formData.tenantName.trim(),
        tenantMobile: formData.tenantMobile.trim(),
        tenantEmail: formData.tenantEmail.trim() || null,
        tenantAdharId: formData.tenantAdharId.trim(),
        tenantProfilePic: formData.tenantProfilePic.trim() || null,
        tenantDocument: formData.tenantDocument.trim() || null,
        permanentAddress: {
          street: permanentAddressData.street.trim(),
          landMark: permanentAddressData.landMark.trim(),
          area: permanentAddressData.area.trim(),
          city: permanentAddressData.city.trim(),
          pincode: permanentAddressData.pincode.trim(),
          stateId: parseInt(permanentAddressData.stateId),
          countryId: parseInt(permanentAddressData.countryId)
        },
        currentAddress: {
          street: currentAddressData.street.trim(),
          landMark: currentAddressData.landMark.trim(),
          area: currentAddressData.area.trim(),
          city: currentAddressData.city.trim(),
          pincode: currentAddressData.pincode.trim(),
          stateId: parseInt(currentAddressData.stateId),
          countryId: parseInt(currentAddressData.countryId)
        },
        lockInPeriod: formData.lockInPeriod.trim(),
        note: formData.note.trim() || null,
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
                    value={formData.propertyId}
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
                    value={formData.roomId || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      console.log('Room selection - Raw value:', value, 'Type:', typeof value);
                      setFormData(prev => ({
                        ...prev,
                        roomId: value || ''
                      }));
                    }}
                    label="Room (Optional)"
                    disabled={!formData.propertyId || rooms.length === 0}
                  >
                    <MenuItem value="">
                      <em>No specific room</em>
                    </MenuItem>
                    {rooms.length > 0 && rooms.map(room => {
                      const roomId = room.id || room.roomId;
                      const roomNumber = room.roomNo || room.roomNumber || 'N/A';
                      const roomType = room.roomType || 'Standard';
                      
                      console.log('Rendering room:', { roomId, roomNumber, roomType, fullRoom: room });
                      
                      return (
                        <MenuItem key={roomId} value={roomId}>
                          Room {roomNumber} - {roomType}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {!formData.propertyId && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 2, mt: 0.5 }}>
                      Please select a property first
                    </Typography>
                  )}
                  {formData.propertyId && rooms.length === 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 2, mt: 0.5 }}>
                      No rooms available for this property
                    </Typography>
                  )}
                </FormControl>
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
                    value={formData.currencyCode}
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

              <Grid item xs={12}>
                <AddressForm
                  onAddressChange={handlePermanentAddressChange}
                  initialData={permanentAddressData}
                  errors={addressErrors.permanent}
                />
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

              <Grid item xs={12}>
                <AddressForm
                  onAddressChange={handleCurrentAddressChange}
                  initialData={currentAddressData}
                  errors={addressErrors.current}
                  disabled={sameAddress}
                />
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
