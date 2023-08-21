import Box from "@mui/material/Box";
import { FC } from "react";

const TabPanel: FC<any> = ({ children, value, name, ...rest }) => {
	if (value === name) {
		return (
			<Box
				role="tabpanel"
				id={`simple-tabpanel-${name}`}
				aria-labelledby={`simple-tab-${name}`}
				{...rest}
			>
				<>{children}</>
			</Box>
		);
	} else return null;
};

export default TabPanel;
