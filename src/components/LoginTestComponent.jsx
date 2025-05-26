import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Paper } from '@mui/material';
import { authAPI } from '../services/api';

const LoginTestComponent = () => {
    const [testResults, setTestResults] = useState([]);
    const [testing, setTesting] = useState(false);

    const addResult = (test, status, message) => {
        setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
    };

    const runConnectivityTests = async () => {
        setTesting(true);
        setTestResults([]);

        // Test 1: API Connection
        addResult('API Connection', 'testing', 'Testing basic connectivity...');
        
        try {
            // Test with invalid credentials to check API response
            await authAPI.login({ loginId: 'test', password: 'test' });
            addResult('API Connection', 'success', 'API responded (expected login failure)');
        } catch (error) {
            if (error.response) {
                addResult('API Connection', 'success', `API connected - Status: ${error.response.status}`);
            } else {
                addResult('API Connection', 'error', `Connection failed: ${error.message}`);
            }
        }

        // Test 2: Valid Login
        addResult('Valid Login', 'testing', 'Testing with valid credentials...');
        
        try {
            const response = await authAPI.login({ loginId: 'owner1', password: 'password1' });
            if (response.data && response.data.statusCode === 200) {
                addResult('Valid Login', 'success', 'Login successful with owner1');
            } else {
                addResult('Valid Login', 'warning', `Unexpected response: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            addResult('Valid Login', 'error', `Login failed: ${error.response?.data?.message || error.message}`);
        }

        setTesting(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'success';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'testing': return 'info';
            default: return 'info';
        }
    };

    return (
        <Paper sx={{ p: 3, m: 2, backgroundColor: '#1a1a1a', color: 'white' }}>
            <Typography variant="h6" gutterBottom color="white">
                🔧 RentWiz System Connectivity Test
            </Typography>
            
            <Button 
                variant="contained" 
                onClick={runConnectivityTests}
                disabled={testing}
                sx={{ mb: 2, backgroundColor: '#333', '&:hover': { backgroundColor: '#555' } }}
            >
                {testing ? 'Running Tests...' : 'Run Connectivity Tests'}
            </Button>

            <Box sx={{ mt: 2 }}>
                {testResults.map((result, index) => (
                    <Alert 
                        key={index}
                        severity={getStatusColor(result.status)}
                        sx={{ mb: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                        <Typography variant="body2">
                            <strong>[{result.timestamp}] {result.test}:</strong> {result.message}
                        </Typography>
                    </Alert>
                ))}
            </Box>

            {testResults.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
                    <Typography variant="body2" color="lightgray">
                        <strong>Test Summary:</strong> {testResults.filter(r => r.status === 'success').length} passed, 
                        {testResults.filter(r => r.status === 'error').length} failed, 
                        {testResults.filter(r => r.status === 'warning').length} warnings
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default LoginTestComponent;
