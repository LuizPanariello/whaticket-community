import { FC } from "react";

import {
	TableCell,
	TableRow,
	Skeleton,
	Box
} from "@mui/material";


const TableRowSkeleton: FC<{avatar?: boolean, columns: number}> = (props) => {
	const { avatar, columns = 0 } = props;
	return (
		<TableRow>
				{avatar && (
					<>
						<TableCell style={{ paddingRight: 0 }}>
							<Skeleton
								animation="wave"
								variant="circular"
								width={40}
								height={40}
							/>
						</TableCell>
						<TableCell>
							<Skeleton animation="wave" height={30} width={80} />
						</TableCell>
					</>
				)}
				{Array.from({ length: columns }, (_, index) => (
					<TableCell align="center" key={index}>
						<Box sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						}}>
							<Skeleton
								animation="wave"
								height={30}
								width={80}
							/>
						</Box>
					</TableCell>
				))}
		</TableRow>
	);
};

export default TableRowSkeleton;
