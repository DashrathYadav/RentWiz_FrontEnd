import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  Security,
  Notifications,
  Logout,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    role: 'Property Manager'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    rentReminders: true,
    maintenanceAlerts: true,
    monthlyReports: true
  });

  useEffect(() => {
    // Load user profile data from API or localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setProfileData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName
      }));
    }
  }, []);

  const handleProfileChange = (field) => (event) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePreferenceChange = (field) => (event) => {
    setPreferences(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password changed successfully');
      setChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  const getInitials = () => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom color="#000" fontWeight="bold">
        Profile Settings
      </Typography>

      {(success || error) && (
        <Box mb={3}>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" color="#000" fontWeight="bold">
                  Personal Information
                </Typography>
                {!editMode ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    sx={{ borderColor: '#000', color: '#000' }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setEditMode(false)}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                      sx={{
                        backgroundColor: '#000',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#333' }
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={handleProfileChange('firstName')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: '#666' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={handleProfileChange('lastName')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: '#666' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profileData.email}
                    onChange={handleProfileChange('email')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: '#666' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phoneNumber}
                    onChange={handleProfileChange('phoneNumber')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: '#666' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={profileData.role}
                    disabled
                    InputProps={{
                      startAdornment: <Security sx={{ mr: 1, color: '#666' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileData.address}
                    onChange={handleProfileChange('address')}
                    disabled={!editMode}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: '#666', alignSelf: 'flex-start', mt: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" color="#000" fontWeight="bold">
                  Security
                </Typography>
                {!changePassword ? (
                  <Button
                    variant="outlined"
                    startIcon={<Security />}
                    onClick={() => setChangePassword(true)}
                    sx={{ borderColor: '#000', color: '#000' }}
                  >
                    Change Password
                  </Button>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setChangePassword(false)}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleChangePassword}
                      disabled={loading}
                      sx={{
                        backgroundColor: '#000',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#333' }
                      }}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              {changePassword && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange('currentPassword')}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type={showNewPassword ? 'text' : 'password'}
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange('newPassword')}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange('confirmPassword')}
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" color="#000" fontWeight="bold" mb={2}>
                Notification Preferences
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.emailNotifications}
                        onChange={handlePreferenceChange('emailNotifications')}
                      />
                    }
                    label=""
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive notifications via SMS"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.smsNotifications}
                        onChange={handlePreferenceChange('smsNotifications')}
                      />
                    }
                    label=""
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Rent Reminders"
                    secondary="Get notified about upcoming rent due dates"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.rentReminders}
                        onChange={handlePreferenceChange('rentReminders')}
                      />
                    }
                    label=""
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#000',
                  fontSize: '2rem',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {getInitials()}
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {profileData.role}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {profileData.email}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" color="#000" fontWeight="bold" mb={2}>
                Account Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Logout />}
                onClick={handleLogout}
                color="error"
                sx={{ mb: 2 }}
              >
                Logout
              </Button>
              
              <Typography variant="caption" color="textSecondary" display="block">
                Last login: {new Date().toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
