import Typography from "@mui/material/Typography";
import { FC } from "react";

const Title : FC = ({children}) => {
	return (
		<Typography component="h2" variant="h6" color="primary" gutterBottom>
			{children}
		</Typography>
	);
};

export default Title;
