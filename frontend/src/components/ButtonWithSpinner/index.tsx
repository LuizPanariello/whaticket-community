import { FC } from "react";
import { CircularProgress, Button, ButtonBaseProps } from "@mui/material";

interface IButtonWithSpinner extends ButtonBaseProps
{
	loading: boolean
}

const ButtonWithSpinner: FC<any> = (props) => {
	const { loading, children, ...rest } = props;

	return (
		<Button sx={{position: "relative"}} disabled={loading} {...rest}>
			{children}
			{loading && (<CircularProgress size={24} /> )}
		</Button>
	);
};

export default ButtonWithSpinner;
