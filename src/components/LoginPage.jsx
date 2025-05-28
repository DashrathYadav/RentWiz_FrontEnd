import React, { useState, useContext } from "react";
import { Container, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import JWTContext from '../contexts/JWTContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useContext(JWTContext);
    const [formData, setFormData] = useState({
        loginId: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.loginId, formData.password);
            
            if (result.success) {
                // Redirect to dashboard
                navigate('/dashboard');
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000000", // Pure black background
                color: "#ffffff", // White text
            }}
        >
            <Container
                maxWidth="xs"
                sx={{
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: "#121212", // Dark form container
                    textAlign: "center",
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Login
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Login ID"
                        variant="outlined"
                        margin="normal"
                        value={formData.loginId}
                        onChange={handleChange('loginId')}
                        required
                        InputLabelProps={{ style: { color: "#ffffff" } }}
                        sx={{
                            input: { color: "#ffffff" },
                            fieldset: { borderColor: "#ffffff" },
                            "& .MuiOutlinedInput-root:hover fieldset": {
                                borderColor: "#aaaaaa",
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={formData.password}
                        onChange={handleChange('password')}
                        required
                        InputLabelProps={{ style: { color: "#ffffff" } }}
                        sx={{
                            input: { color: "#ffffff" },
                            fieldset: { borderColor: "#ffffff" },
                            "& .MuiOutlinedInput-root:hover fieldset": {
                                borderColor: "#aaaaaa",
                            },
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{ color: "#aaaaaa", cursor: "pointer", mt: 1 }}
                    >
                        Forgot Password?
                    </Typography>
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            bgcolor: "#ffffff",
                            color: "#000000",
                            fontWeight: "bold",
                            "&:hover": { bgcolor: "#dddddd" },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                    </Button>
                </form>
            </Container>
        </Box>
    );
};

export default LoginPage;
