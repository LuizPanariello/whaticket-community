import React from "react";

import { CircularProgress, Button } from "@mui/material";

const ButtonWithSpinner = ({ loading, children, ...rest }) => {
	return (
		<Button sx={{position: "relative"}} disabled={loading} {...rest}>
			{children}
			{loading && (<CircularProgress size={24} /> )}
		</Button>
	);
};

export default ButtonWithSpinner;
