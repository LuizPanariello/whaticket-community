
import { Container, Grid } from "@mui/material";
import { FC } from "react";

const MainContainer: FC<{children: React.ReactNode}> = ({ children }) => (
  <Container>
    { /*maxWidth="lg", rowSpacing={2} */ }
    <Grid container spacing={2}>
      { children }
    </Grid>
  </Container>
);

export default MainContainer;
