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
  AttachMoney,
  CalendarMonth,
  Note,
  Person,
  Home
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { rentTrackAPI, tenantAPI, roomAPI, propertyAPI, lookupsAPI } from '../services/api';

const CreateRentTrack = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);
  const propertyChangeRef = useRef(false);

  const [formData, setFormData] = useState({
    propertyId: '',
    roomId: '',
    tenantId: '',
    ownerId: '',
    expectedRentValue: '',
    receivedRentValue: '',
    rentPeriodStartDate: new Date(),
    rentPeriodEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to next month
    status: 1, // Pending
    note: '',
    currencyCode: 8 // INR default
  });

  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lookup values
  const rentStatuses = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Partially Paid' },
    { id: 3, name: 'Fully Paid' }
  ];

  const currencies = [
    { id: 1, name: 'USD', symbol: '$' },
    { id: 2, name: 'EUR', symbol: '€' },
    { id: 3, name: 'GBP', symbol: '£' },
    { id: 4, name: 'AUD', symbol: 'A$' },
    { id: 5, name: 'CAD', symbol: 'C$' },
    { id: 6, name: 'JPY', symbol: '¥' },
    { id: 7, name: 'CNY', symbol: '¥' },
    { id: 8, name: 'INR', symbol: '₹' },
    { id: 9, name: 'RUB', symbol: '₽' },
    { id: 10, name: 'BRL', symbol: 'R$' }
  ];

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchRentTrackData();
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (formData.propertyId && !propertyChangeRef.current) {
      fetchRoomsAndTenants(formData.propertyId);
    }
    propertyChangeRef.current = false;
  }, [formData.propertyId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      setFormData(prev => ({ ...prev, ownerId }));
      
      const [propertiesResponse] = await Promise.all([
        lookupsAPI.getProperties(ownerId).catch(err => {
          console.error('Error fetching properties:', err);
          return { data: [] };
        })
      ]);
      
      const extractedProperties = lookupsAPI.extractData(propertiesResponse);
      setProperties(extractedProperties || []);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomsAndTenants = async (propertyId) => {
    try {
      console.log('Fetching rooms and tenants for property ID:', propertyId);
      
      // Clear existing data first
      setRooms([]);
      setTenants([]);
      
      const [roomsResponse, tenantsResponse] = await Promise.all([
        roomAPI.getByProperty(propertyId).catch(err => {
          console.error('Error fetching rooms:', err);
          return { data: [] };
        }),
        tenantAPI.getByProperty(propertyId).catch(err => {
          console.error('Error fetching tenants:', err);
          return { data: [] };
        })
      ]);
      
      console.log('Rooms API response:', roomsResponse);
      console.log('Tenants API response:', tenantsResponse);
      
      // Handle rooms data with robust extraction
      let roomsData = [];
      if (roomsResponse) {
        if (Array.isArray(roomsResponse)) {
          roomsData = roomsResponse;
        } else if (roomsResponse.data) {
          if (Array.isArray(roomsResponse.data)) {
            roomsData = roomsResponse.data;
          } else if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
            roomsData = roomsResponse.data.data;
          } else if (roomsResponse.data.result && Array.isArray(roomsResponse.data.result)) {
            roomsData = roomsResponse.data.result;
          }
        }
      }
      
      // Process rooms data to ensure proper structure
      const processedRooms = roomsData.map(room => ({
        id: room.id || room.roomId,
        roomNo: room.roomNo || room.roomNumber || 'N/A',
        roomType: room.roomType || 'Standard',
        ...room // keep original data
      })).filter(room => room.id); // Only keep rooms with valid IDs
      
      // Handle tenants data with similar extraction
      let tenantsData = [];
      if (tenantsResponse) {
        if (Array.isArray(tenantsResponse)) {
          tenantsData = tenantsResponse;
        } else if (tenantsResponse.data) {
          if (Array.isArray(tenantsResponse.data)) {
            tenantsData = tenantsResponse.data;
          } else if (tenantsResponse.data.data && Array.isArray(tenantsResponse.data.data)) {
            tenantsData = tenantsResponse.data.data;
          } else if (tenantsResponse.data.result && Array.isArray(tenantsResponse.data.result)) {
            tenantsData = tenantsResponse.data.result;
          }
        }
      }
      
      // Process tenants data to ensure proper structure
      const processedTenants = tenantsData.map(tenant => ({
        id: tenant.id || tenant.tenantId,
        tenantName: tenant.tenantName || tenant.name || 'N/A',
        tenantEmail: tenant.tenantEmail || tenant.email || '',
        tenantMobile: tenant.tenantMobile || tenant.mobile || '',
        ...tenant // keep original data
      })).filter(tenant => tenant.id); // Only keep tenants with valid IDs
      
      console.log('Processed rooms data:', processedRooms);
      console.log('Processed tenants data:', processedTenants);
      
      setRooms(processedRooms);
      setTenants(processedTenants);
      
    } catch (error) {
      console.error('Error fetching rooms and tenants:', error);
      setError('Failed to load rooms and tenants for the selected property.');
    }
  };

  const fetchRentTrackData = async () => {
    try {
      setLoading(true);
      const response = await rentTrackAPI.getById(id);
      if (response.data) {
        const data = response.data;
        setFormData({
          propertyId: data.propertyId || '',
          roomId: data.roomId || '',
          tenantId: data.tenantId || '',
          ownerId: data.ownerId || '',
          expectedRentValue: data.expectedRentValue || '',
          receivedRentValue: data.receivedRentValue || '',
          rentPeriodStartDate: data.rentPeriodStartDate ? new Date(data.rentPeriodStartDate) : new Date(),
          rentPeriodEndDate: data.rentPeriodEndDate ? new Date(data.rentPeriodEndDate) : new Date(),
          status: data.status || 1,
          note: data.note || '',
          currencyCode: data.currencyCode || 8
        });
      }
    } catch (error) {
      console.error('Error fetching rent track data:', error);
      setError('Failed to load rent track data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    propertyChangeRef.current = true;
    setFormData(prev => ({ 
      ...prev, 
      propertyId,
      roomId: '', // Reset room selection
      tenantId: '' // Reset tenant selection
    }));
    setRooms([]);
    setTenants([]);
    setError('');
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.propertyId) {
      setError('Please select a property.');
      return false;
    }
    if (!formData.tenantId) {
      setError('Please select a tenant.');
      return false;
    }
    if (!formData.rentPeriodStartDate || !formData.rentPeriodEndDate) {
      setError('Please select both start and end dates for the rent period.');
      return false;
    }
    if (formData.rentPeriodStartDate >= formData.rentPeriodEndDate) {
      setError('Start date must be before end date.');
      return false;
    }
    if (formData.expectedRentValue && isNaN(parseFloat(formData.expectedRentValue))) {
      setError('Expected rent value must be a valid number.');
      return false;
    }
    if (formData.receivedRentValue && isNaN(parseFloat(formData.receivedRentValue))) {
      setError('Received rent value must be a valid number.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const submitData = {
        ...formData,
        expectedRentValue: formData.expectedRentValue ? parseFloat(formData.expectedRentValue) : null,
        receivedRentValue: formData.receivedRentValue ? parseFloat(formData.receivedRentValue) : null,
        roomId: formData.roomId || null,
        note: formData.note || null,
        currencyCode: formData.currencyCode || null
      };

      if (isEdit) {
        await rentTrackAPI.update(id, submitData);
        setSuccess('Rent track updated successfully!');
      } else {
        await rentTrackAPI.create(submitData);
        setSuccess('Rent track created successfully!');
      }

      setTimeout(() => {
        navigate('/rent-tracks');
      }, 2000);

    } catch (error) {
      console.error('Error saving rent track:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save rent track. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/rent-tracks');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {isEdit ? 'Edit Rent Track' : 'Create Rent Track'}
          </Typography>
        </Box>

        {/* Alert Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                
                {/* Property and Room Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Home sx={{ mr: 1 }} />
                    Property & Room Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Property</InputLabel>
                    <Select
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handlePropertyChange}
                      label="Property"
                    >
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                          {property.propertyName} - {property.address}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Room (Optional)</InputLabel>
                    <Select
                      name="roomId"
                      value={formData.roomId}
                      onChange={handleInputChange}
                      label="Room (Optional)"
                      disabled={!formData.propertyId}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.roomNumber} - {room.roomType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Tenant Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} />
                    Tenant Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Tenant</InputLabel>
                    <Select
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleInputChange}
                      label="Tenant"
                      disabled={!formData.propertyId}
                    >
                      {tenants.map((tenant) => (
                        <MenuItem key={tenant.id} value={tenant.id}>
                          {tenant.tenantName} - {tenant.tenantMobile}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Financial Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    Financial Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    name="expectedRentValue"
                    label="Expected Rent Value"
                    type="number"
                    value={formData.expectedRentValue}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currencies.find(c => c.id === formData.currencyCode)?.symbol || '₹'}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    name="receivedRentValue"
                    label="Received Rent Value"
                    type="number"
                    value={formData.receivedRentValue}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currencies.find(c => c.id === formData.currencyCode)?.symbol || '₹'}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      name="currencyCode"
                      value={formData.currencyCode}
                      onChange={handleInputChange}
                      label="Currency"
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency.id} value={currency.id}>
                          {currency.name} ({currency.symbol})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Period and Status */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonth sx={{ mr: 1 }} />
                    Period & Status
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Rent Period Start Date"
                    value={formData.rentPeriodStartDate}
                    onChange={(date) => handleDateChange('rentPeriodStartDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Rent Period End Date"
                    value={formData.rentPeriodEndDate}
                    onChange={(date) => handleDateChange('rentPeriodEndDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      {rentStatuses.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {status.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Note sx={{ mr: 1 }} />
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="note"
                    label="Notes"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes about this rent track..."
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={<Save />}
                    >
                      {loading ? 'Saving...' : (isEdit ? 'Update Rent Track' : 'Create Rent Track')}
                    </Button>
                  </Box>
                </Grid>

              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateRentTrack;
