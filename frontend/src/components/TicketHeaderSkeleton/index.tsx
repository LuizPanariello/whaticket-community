import  { FC } from "react";

import { Avatar, Card, CardHeader } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

const TicketHeaderSkeleton:FC = () => {
	return (
		<Card square 
			sx={{
				display: "flex",
				backgroundColor: "#eee",
				flex: "none",
				borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
			}}
			>
			<CardHeader
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					<Skeleton animation="wave" variant="circular">
						<Avatar alt="contact_image" />
					</Skeleton>
				}
				title={<Skeleton animation="wave" width={80} />}
				subheader={<Skeleton animation="wave" width={140} />}
			/>
		</Card>
	);
};

export default TicketHeaderSkeleton;
