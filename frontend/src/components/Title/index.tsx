import { FC } from "react";
import { Typography } from "@mui/material";

const Title: FC<{children?: React.ReactNode}> = ({ children }) => (
	<Typography variant="h5" color="primary" gutterBottom>
		{children}
	</Typography>
);

export default Title;
