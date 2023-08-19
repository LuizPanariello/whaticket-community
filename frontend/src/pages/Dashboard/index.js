import React, { useContext } from "react"

import Paper from "@mui/material/Paper"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography";

import useTickets from "../../hooks/useTickets"
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

import Chart from "./Chart"

const Dashboard = () => {
	const { user } = useContext(AuthContext);

	var userQueueIds = [];

	if (user.queues && user.queues.length > 0)
		userQueueIds = user.queues.map(q => q.id);

	const GetTickets = (status, showAll, withUnreadMessages) => {
		const { count } = useTickets({
			status: status,
			showAll: showAll,
			withUnreadMessages: withUnreadMessages,
			queueIds: JSON.stringify(userQueueIds)
		});

		return count;
	}

	return (
		<Container maxWidth="lg" >
			<Grid container spacing={3}>
				<Grid item xs={4}>
					<Paper sx={{p: 2}} style={{ overflow: "hidden" }}>
						<Typography component="h3" variant="h6" color="primary" paragraph>
							{i18n.t("dashboard.messages.inAttendance.title")}
						</Typography>
						<Grid item>
							<Typography component="h1" variant="h4">
								{GetTickets("open", "true", "false")}
							</Typography>
						</Grid>
					</Paper>
				</Grid>
				<Grid item xs={4}>
					<Paper sx={{p: 2}} style={{ overflow: "hidden" }}>
						<Typography component="h3" variant="h6" color="primary" paragraph>
							{i18n.t("dashboard.messages.waiting.title")}
						</Typography>
						<Grid item>
							<Typography component="h1" variant="h4">
								{GetTickets("pending", "true", "false")}
							</Typography>
						</Grid>
					</Paper>
				</Grid>
				<Grid item xs={4}>
					<Paper sx={{p: 2}} style={{ overflow: "hidden" }}>
						<Typography component="h3" variant="h6" color="primary" paragraph>
							{i18n.t("dashboard.messages.closed.title")}
						</Typography>
						<Grid item>
							<Typography component="h1" variant="h4">
								{GetTickets("closed", "true", "false")}
							</Typography>
						</Grid>
					</Paper>
				</Grid>
				<Grid item xs={12}>
					<Paper sx={{p: 2}}>
						<Chart />
					</Paper>
				</Grid>
			</Grid>
		</Container>
	)
}

export default Dashboard