import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import ApartmentIcon from "@mui/icons-material/Apartment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Paper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  maxWidth: "400px",
  width: "100%",
});

const ShelterIcon = styled(ApartmentIcon)({
  fontSize: "60px",
  marginBottom: "16px",
  color: "#3f51b5",
});

const SubmitButton = styled(Button)({
  marginTop: "16px",
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login clicked");
  };

  const handleRegister = () => {
    console.log("Register clicked");
  };

  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper>
        <ShelterIcon />
        <Typography component="h1" variant="h5">
          Rent-Wiz
        </Typography>
        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", marginTop: "16px" }}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <SubmitButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Sign In
              </SubmitButton>
            </Grid>
            <Grid item xs={6}>
              <SubmitButton
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleRegister}
              >
                Register
              </SubmitButton>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
