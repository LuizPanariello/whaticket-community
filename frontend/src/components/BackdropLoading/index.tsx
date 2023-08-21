import { FC } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const BackdropLoading: FC = () => {
	return (
		<Backdrop open={true}>
			<CircularProgress color="inherit" />
		</Backdrop>
	);
};

export default BackdropLoading;
