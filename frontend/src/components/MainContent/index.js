import React from "react";

import { Grid } from "@mui/material";

const MainContent = ({ children }) => (
    <Grid item xs={12}>
        {children}
    </Grid>
);

export default MainContent;
