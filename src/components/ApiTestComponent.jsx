import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { authAPI } from '../services/api';

const ApiTestComponent = () => {
    const [testResult, setTestResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testApiConnection = async () => {
        setLoading(true);
        setTestResult('');
        
        try {
            // Test with a simple login attempt (this will fail but should connect)
            const response = await authAPI.login({ loginId: 'test', password: 'test' });
            setTestResult('API Connected Successfully!');
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                setTestResult(`API Connected - Server Response: ${error.response.status} ${error.response.statusText}`);
            } else if (error.request) {
                // The request was made but no response was received
                setTestResult('API Connection Failed - No response from server');
            } else {
                // Something happened in setting up the request
                setTestResult(`API Connection Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
            <Typography variant="h6" gutterBottom>
                API Connection Test
            </Typography>
            <Button 
                variant="contained" 
                onClick={testApiConnection}
                disabled={loading}
                sx={{ mb: 2 }}
            >
                {loading ? 'Testing...' : 'Test API Connection'}
            </Button>
            {testResult && (
                <Alert 
                    severity={testResult.includes('Connected') ? 'success' : 'error'}
                    sx={{ mt: 2 }}
                >
                    {testResult}
                </Alert>
            )}
        </Box>
    );
};

export default ApiTestComponent;
