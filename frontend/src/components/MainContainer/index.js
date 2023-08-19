import React from "react";

import { Container, Grid } from "@mui/material";

const MainContainer = ({ children }) => {
  return (
    <Container maxWidth="lg" rowSpacing={2}>
      <Grid container spacing={2}>
        { children }
      </Grid>
    </Container>
  );
};

export default MainContainer;
