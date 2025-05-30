import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { rentAPI, tenantAPI, roomAPI } from '../services/api';

const CreateRent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    tenantId: '',
    roomId: '',
    amount: '',
    rentDate: new Date(),
    dueDate: new Date(),
    paymentStatus: 'Pending',
    paymentMethod: '',
    notes: ''
  });

  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const paymentStatuses = ['Pending', 'Paid', 'Overdue', 'Partial'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Payment', 'Card'];

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchRentData();
    }
  }, [id, isEdit]);

  const fetchInitialData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const ownerId = user.id || 1;
      
      const [tenantsResponse, roomsResponse] = await Promise.all([
        tenantAPI.getByOwner(ownerId),
        roomAPI.getByOwner(ownerId)
      ]);
      
      const tenantsData = tenantsResponse.data?.data || tenantsResponse.data || [];
      const roomsData = roomsResponse.data?.data || roomsResponse.data || [];
      
      setTenants(tenantsData);
      setRooms(roomsData);
      setAvailableRooms(roomsData.filter(room => room.status === 'Occupied'));
    } catch (error) {
      setError('Failed to load data');
    }
  };

  const fetchRentData = async () => {
    try {
      const response = await rentAPI.getById(id);
      const rent = response.data;
      setFormData({
        tenantId: rent.tenantId,
        roomId: rent.roomId,
        amount: rent.amount,
        rentDate: new Date(rent.rentDate),
        dueDate: new Date(rent.dueDate),
        paymentStatus: rent.paymentStatus,
        paymentMethod: rent.paymentMethod || '',
        notes: rent.notes || ''
      });
    } catch (error) {
      setError('Failed to load rent data');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // When tenant changes, filter rooms for that tenant
    if (field === 'tenantId') {
      const selectedTenant = tenants.find(t => t.id === value);
      if (selectedTenant) {
        const tenantRooms = rooms.filter(room => 
          room.tenantId === value || room.status === 'Available'
        );
        setAvailableRooms(tenantRooms);
        setFormData(prev => ({ ...prev, roomId: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        rentDate: formData.rentDate.toISOString(),
        dueDate: formData.dueDate.toISOString()
      };

      if (isEdit) {
        await rentAPI.update(id, submitData);
        setSuccess('Rent record updated successfully!');
      } else {
        await rentAPI.create(submitData);
        setSuccess('Rent record created successfully!');
      }

      setTimeout(() => {
        navigate('/rents');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save rent record');
    } finally {
      setLoading(false);
    }
  };

  const selectedTenant = tenants.find(t => t.id === formData.tenantId);
  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          {isEdit ? 'Edit Rent Record' : 'Create New Rent Record'}
        </Typography>

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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Main Form */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Rent Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Tenant</InputLabel>
                      <Select
                        value={formData.tenantId}
                        onChange={(e) => handleChange('tenantId', e.target.value)}
                        label="Tenant"
                      >
                        {tenants.map((tenant) => (
                          <MenuItem key={tenant.id} value={tenant.id}>
                            {tenant.firstName} {tenant.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Room</InputLabel>
                      <Select
                        value={formData.roomId}
                        onChange={(e) => handleChange('roomId', e.target.value)}
                        label="Room"
                        disabled={!formData.tenantId}
                      >
                        {availableRooms.map((room) => (
                          <MenuItem key={room.id} value={room.id}>
                            {room.roomNumber} - {room.property?.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Rent Amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Payment Status</InputLabel>
                      <Select
                        value={formData.paymentStatus}
                        onChange={(e) => handleChange('paymentStatus', e.target.value)}
                        label="Payment Status"
                      >
                        {paymentStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Rent Date"
                      value={formData.rentDate}
                      onChange={(date) => handleChange('rentDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Due Date"
                      value={formData.dueDate}
                      onChange={(date) => handleChange('dueDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={formData.paymentMethod}
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        label="Payment Method"
                      >
                        {paymentMethods.map((method) => (
                          <MenuItem key={method} value={method}>
                            {method}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Additional notes about this rent payment..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Summary Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Summary
                  </Typography>
                  
                  {selectedTenant && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Tenant
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedTenant.firstName} {selectedTenant.lastName}
                      </Typography>
                    </>
                  )}

                  {selectedRoom && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Room
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedRoom.roomNumber}
                      </Typography>
                    </>
                  )}

                  {formData.amount && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        ${formData.amount}
                      </Typography>
                    </>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.paymentStatus}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/rents')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: 'black',
                    '&:hover': { bgcolor: 'grey.800' }
                  }}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Rent' : 'Create Rent'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateRent;
