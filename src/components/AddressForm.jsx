import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  InputAdornment
} from '@mui/material';
import {
  LocationOn,
  Home,
  Business,
  Map,
  PinDrop,
  Public,
  Flag
} from '@mui/icons-material';
import { lookupsAPI } from '../services/api';

const AddressForm = ({ onAddressChange, initialData = {}, errors = {}, disabled = false }) => {
  const [addressData, setAddressData] = useState({
    street: initialData.street || '',
    landMark: initialData.landMark || '',
    area: initialData.area || '',
    city: initialData.city || '',
    pincode: initialData.pincode || '',
    stateId: initialData.stateId || '',
    countryId: initialData.countryId || ''
  });

  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        setLoading(true);
        const [statesResponse, countriesResponse] = await Promise.all([
          lookupsAPI.getStates(),
          lookupsAPI.getCountries()
        ]);
        
        console.log('States response:', statesResponse);
        console.log('Countries response:', countriesResponse);
        
        // Handle the new API response structure: { status: true, responseCode: 0, message: "...", errors: null, data: {...} }
        setStates(lookupsAPI.extractData(statesResponse));
        setCountries(lookupsAPI.extractData(countriesResponse));
      } catch (error) {
        console.error('Error fetching lookup data:', error);
        // Set fallback data - using string IDs to match API format
        setStates([
          { id: '1', name: 'Maharashtra' },
          { id: '2', name: 'Delhi' },
          { id: '3', name: 'Karnataka' }
        ]);
        setCountries([
          { id: '1', name: 'India' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLookupData();
  }, []);

  const handleInputChange = (field, value) => {
    const updatedData = {
      ...addressData,
      [field]: value
    };
    setAddressData(updatedData);
    onAddressChange(updatedData);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading address options...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>
        Address Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Street Address */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Street Address"
            value={addressData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            error={!!errors.street}
            helperText={errors.street}
            required
            disabled={disabled}
            placeholder="Enter street address"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Home />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Landmark */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Landmark"
            value={addressData.landMark}
            onChange={(e) => handleInputChange('landMark', e.target.value)}
            error={!!errors.landMark}
            helperText={errors.landMark}
            disabled={disabled}
            placeholder="Near landmark"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Area */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Area/Locality"
            value={addressData.area}
            onChange={(e) => handleInputChange('area', e.target.value)}
            error={!!errors.area}
            helperText={errors.area}
            disabled={disabled}
            required
            placeholder="Area/Locality"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* City */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={addressData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            error={!!errors.city}
            helperText={errors.city}
            required
            disabled={disabled}
            placeholder="Enter city"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Map />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Pincode */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pincode"
            value={addressData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            error={!!errors.pincode}
            helperText={errors.pincode || 'Enter 6-digit pincode'}
            required
            disabled={disabled}
            placeholder="Enter pincode"
            inputProps={{ maxLength: 6 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PinDrop />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* State */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.stateId} required>
            <InputLabel>State</InputLabel>
            <Select
              value={addressData.stateId}
              onChange={(e) => handleInputChange('stateId', e.target.value)}
              label="State"
              disabled={disabled}
              startAdornment={
                <InputAdornment position="start">
                  <Public />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Select State</em>
              </MenuItem>
              {states.map((state) => (
                <MenuItem key={state.id || state.Id} value={state.id || state.Id}>
                  {state.name || state.Name}
                </MenuItem>
              ))}
            </Select>
            {errors.stateId && (
              <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                {errors.stateId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Country */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.countryId} required>
            <InputLabel>Country</InputLabel>
            <Select
              value={addressData.countryId}
              onChange={(e) => handleInputChange('countryId', e.target.value)}
              label="Country"
              disabled={disabled}
              startAdornment={
                <InputAdornment position="start">
                  <Flag />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Select Country</em>
              </MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.id || country.Id} value={country.id || country.Id}>
                  {country.name || country.Name}
                </MenuItem>
              ))}
            </Select>
            {errors.countryId && (
              <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                {errors.countryId}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressForm;
