import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

const LoginTesting = () => {
    return (
        <Grid
            sx={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover'
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
               <Typography>Hiii</Typography>
            </Box>
        </Grid>
    );
};

export default LoginTesting;
