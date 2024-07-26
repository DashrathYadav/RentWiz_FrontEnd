import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

const LoginTesting = () => {
    return (
        <Grid
            sx={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                padding:10
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                }}
            >
               <Typography>Creating Header and Footer</Typography>
            </Box>
        </Grid>
    );
};

export default LoginTesting;
