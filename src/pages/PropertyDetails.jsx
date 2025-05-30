import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  Skeleton,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Home,
  LocationOn,
  AttachMoney,
  Straighten,
  Description,
  Business,
  Info,
  CheckCircle,
  Cancel,
  Schedule,
  Room
} from '@mui/icons-material';
import { propertyAPI } from '../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false });

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyAPI.getById(id);
      const propertyData = response.data?.data || response.data;
      setProperty(propertyData);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError(error.response?.data?.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await propertyAPI.delete(id);
      setDeleteDialog({ open: false });
      navigate('/properties', { 
        state: { message: 'Property deleted successfully' }
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      setError(error.response?.data?.message || 'Failed to delete property');
      setDeleteDialog({ open: false });
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      1: 'Available',
      2: 'Occupied',
      3: 'Under Maintenance',
      4: 'Unavailable'
    };
    return statusMap[status] || 'Unknown';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      1: 'success',    // Available
      2: 'primary',    // Occupied
      3: 'warning',    // Under Maintenance
      4: 'error'       // Unavailable
    };
    return colorMap[status] || 'default';
  };

  const getPropertyTypeColor = (type) => {
    const colorMap = {
      'House': 'primary',
      'Apartment': 'secondary',
      'Condo': 'info',
      'Townhouse': 'success',
      'Villa': 'warning'
    };
    return colorMap[type] || 'default';
  };

  const formatCurrency = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/properties')}
          variant="outlined"
        >
          Back to Properties
        </Button>
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Property not found
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/properties')}
          variant="outlined"
        >
          Back to Properties
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/properties');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Properties
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <Room sx={{ mr: 0.5 }} fontSize="inherit" />
          {property.propertyName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
              <Home fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {property.propertyName}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Chip
                  label={property.propertyType}
                  color={getPropertyTypeColor(property.propertyType)}
                  size="medium"
                />
                <Chip
                  label={getStatusLabel(property.status)}
                  color={getStatusColor(property.status)}
                  size="medium"
                />
                <Typography variant="body2" color="textSecondary">
                  ID: {property.propertyId}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/properties')}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              startIcon={<Edit />}
              onClick={() => navigate(`/properties/${property.propertyId}/edit`)}
              variant="contained"
              color="primary"
            >
              Edit
            </Button>
            <IconButton
              onClick={() => setDeleteDialog({ open: true })}
              color="error"
              title="Delete Property"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Details */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Business color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Property Type"
                        secondary={property.propertyType}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Straighten color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Property Size"
                        secondary={property.propertySize || 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Created Date"
                        secondary={formatDate(property.creationDate)}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AttachMoney color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Monthly Rent"
                        secondary={formatCurrency(property.propertyRent, property.currencyCode)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AttachMoney color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Property Value"
                        secondary={formatCurrency(property.propertyValue, property.currencyCode)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Info color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Owner ID"
                        secondary={property.ownerId}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Description */}
          {property.propertyDescription && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {property.propertyDescription}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Facilities */}
          {property.propertyFacility && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Facilities & Amenities
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {property.propertyFacility}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {property.note && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {property.note}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Address Information */}
          {property.address && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Location
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {property.address.street}
                  </Typography>
                </Box>

                {property.address.landMark && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Landmark
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {property.address.landMark}
                    </Typography>
                  </Box>
                )}

                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Area
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {property.address.area}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    City & Pincode
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {property.address.city} - {property.address.pincode}
                  </Typography>
                </Box>

                {property.address.state && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      State
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {property.address.state}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Room />}
                  onClick={() => navigate(`/rooms?propertyId=${property.propertyId}`)}
                >
                  View Rooms
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Business />}
                  onClick={() => navigate(`/tenants?propertyId=${property.propertyId}`)}
                >
                  View Tenants
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  onClick={() => navigate(`/rents?propertyId=${property.propertyId}`)}
                >
                  View Rent Records
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Property
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to delete <strong>"{property.propertyName}"</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            This action cannot be undone. All associated rooms, tenants, and rent records may also be affected.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
          >
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyDetails;