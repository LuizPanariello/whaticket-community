import { FC } from "react";
import { Grid } from "@mui/material";

const MainContent:FC = ({ children }) => (
    <Grid item xs={12}>
        {children}
    </Grid>
);

export default MainContent;
