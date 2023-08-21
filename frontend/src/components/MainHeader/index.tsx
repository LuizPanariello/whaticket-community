import Grid from "@mui/material/Grid";
import { FC } from "react";

const MainHeader: FC<{children?: React.ReactNode}> = ({ children }) => {
	return (
		<Grid item xs={12}>
			{children}
		</Grid>
	);
}

export default MainHeader;
