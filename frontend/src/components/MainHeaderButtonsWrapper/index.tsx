import Grid from "@mui/material/Grid";
import { FC } from "react";

const MainHeaderButtonsWrapper: FC<{children: React.ReactNode}> = ({ children }) => (
	<Grid>
		{children}
	</Grid>
);

export default MainHeaderButtonsWrapper;
