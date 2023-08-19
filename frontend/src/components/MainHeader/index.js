import React from "react";

import { Grid } from "@mui/material";

const MainHeader = ({ children }) => (
	<Grid item xs={12}>
		{children}
	</Grid>
);

export default MainHeader;
