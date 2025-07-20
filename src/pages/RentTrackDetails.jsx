import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Button,
  Divider,
  Paper,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  AttachMoney,
  CalendarMonth,
  Note,
  Person,
  Home,
  Room,
  AccountBalance
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { rentTrackAPI } from '../services/api';

const RentTrackDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rentTrack, setRentTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lookup values
  const rentStatuses = [
    { id: 1, name: 'Pending', color: 'warning' },
    { id: 2, name: 'Partially Paid', color: 'info' },
    { id: 3, name: 'Fully Paid', color: 'success' }
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
    fetchRentTrackDetails();
  }, [id]);

  const fetchRentTrackDetails = async () => {
    try {
      setLoading(true);
      const response = await rentTrackAPI.getById(id);
      
      if (response.data) {
        setRentTrack(response.data);
      } else {
        setError('Rent track not found.');
      }
    } catch (error) {
      console.error('Error fetching rent track details:', error);
      setError('Failed to load rent track details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/rent-tracks/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this rent track?')) {
      try {
        await rentTrackAPI.delete(id);
        navigate('/rent-tracks');
      } catch (error) {
        console.error('Error deleting rent track:', error);
        setError('Failed to delete rent track.');
      }
    }
  };

  const handleBack = () => {
    navigate('/rent-tracks');
  };

  const formatCurrency = (amount, currencyCode) => {
    if (!amount) return 'N/A';
    const currency = currencies.find(c => c.id === currencyCode);
    return `${currency?.symbol || '₹'}${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (status) => {
    const statusInfo = rentStatuses.find(s => s.id === status);
    return (
      <Chip
        label={statusInfo?.name || 'Unknown'}
        color={statusInfo?.color || 'default'}
        size="medium"
      />
    );
  };

  const calculatePending = () => {
    const expected = parseFloat(rentTrack?.expectedRentValue) || 0;
    const received = parseFloat(rentTrack?.receivedRentValue) || 0;
    return expected - received;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading rent track details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Back to Rent Tracks
        </Button>
      </Box>
    );
  }

  if (!rentTrack) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Rent track not found.
        </Alert>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Back to Rent Tracks
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Rent Track Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Property & Room Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Home sx={{ mr: 1 }} />
                Property & Room Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Property
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.property?.propertyName || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.property?.address || 'N/A'}
                  </Typography>
                </Grid>
                
                {rentTrack.room && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Room Number
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Room sx={{ mr: 1, fontSize: 20 }} />
                        {rentTrack.room.roomNumber}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Room Type
                      </Typography>
                      <Typography variant="body1">
                        {rentTrack.room.roomType || 'N/A'}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tenant Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Tenant Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tenant Name
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.tenant?.tenantName || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mobile
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.tenant?.tenantMobile || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.tenant?.tenantEmail || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Aadhar ID
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.tenant?.tenantAdharId || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Summary */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1 }} />
                Financial Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expected Amount
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(rentTrack.expectedRentValue, rentTrack.currencyCode)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Received Amount
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(rentTrack.receivedRentValue, rentTrack.currencyCode)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pending Amount
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(calculatePending(), rentTrack.currencyCode)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {getStatusChip(rentTrack.status)}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Period Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonth sx={{ mr: 1 }} />
                Rent Period
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(rentTrack.rentPeriodStartDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(rentTrack.rentPeriodEndDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.rentPeriodStartDate && rentTrack.rentPeriodEndDate
                      ? `${Math.ceil((new Date(rentTrack.rentPeriodEndDate) - new Date(rentTrack.rentPeriodStartDate)) / (1000 * 60 * 60 * 24))} days`
                      : 'N/A'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Note sx={{ mr: 1 }} />
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.note || 'No notes available'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography variant="body1">
                    {currencies.find(c => c.id === rentTrack.currencyCode)?.name || 'INR'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Owner
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.owner?.ownerName || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 1 }} />
                System Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rent Track ID
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.createdDate ? formatDate(rentTrack.createdDate) : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.updatedDate ? formatDate(rentTrack.updatedDate) : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Completion
                  </Typography>
                  <Typography variant="body1">
                    {rentTrack.expectedRentValue && rentTrack.receivedRentValue
                      ? `${Math.round((parseFloat(rentTrack.receivedRentValue) / parseFloat(rentTrack.expectedRentValue)) * 100)}%`
                      : '0%'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RentTrackDetails;
