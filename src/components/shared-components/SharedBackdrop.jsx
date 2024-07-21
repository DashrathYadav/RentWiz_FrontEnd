import React from 'react';
import { Typography, Backdrop, Grid } from '@mui/material';
import CircularLoader from "./CircularLoader"

const SharedBackdrop = () => {

    return (
        <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 99999 }}>
            <Grid container justifyContent="center" alignItems="center" flexDirection={'column'}>
                <Grid item mt={2}>
                    <CircularLoader />
                </Grid>
                <Grid item pt={2}>
                    <Typography>Please wait while processing...</Typography>
                </Grid>
            </Grid>
        </Backdrop>
    );
};

export default SharedBackdrop;
