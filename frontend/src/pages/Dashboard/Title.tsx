import Typography from "@mui/material/Typography";
import { FC, ReactNode } from "react";

const Title : FC<{ children: ReactNode }> = ({children}) => {
	return (
		<Typography component="h2" variant="h6" color="primary" gutterBottom>
			{children}
		</Typography>
	);
};

export default Title;
