import React from "react";
import { Container, TextField, Button, Typography, Box, Grid } from "@mui/material";

const OwnerRegisterPage = () => {
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
                maxWidth="sm"
                sx={{
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: "#121212", // Dark form container
                    textAlign: "center",
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Owner Registration
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Login ID" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Password" type="password" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Full Name" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Mobile Number" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Email" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Aadhar Number" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Profile Pic URL" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Document URL" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Address ID" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Role ID" variant="outlined" InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Note" variant="outlined" multiline rows={3} InputLabelProps={{ style: { color: "#ffffff" } }} sx={{ input: { color: "#ffffff" }, fieldset: { borderColor: "#ffffff" } }} /></Grid>
                </Grid>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, bgcolor: "#ffffff", color: "#000000", fontWeight: "bold", "&:hover": { bgcolor: "#dddddd" } }}
                >
                    Register
                </Button>
            </Container>
        </Box>
    );
};

export default OwnerRegisterPage;
