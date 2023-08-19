import React, { useState, useEffect, useRef, useContext } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";

import { green } from "@mui/material/colors";
import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { ListItemButton, Tooltip } from "@mui/material";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const TicketListItem = ({ ticket }) => {
	const history = useNavigate();
	const { user } = useContext(AuthContext);
	const { ticketId } = useParams();

	const [loading, setLoading] = useState(false);
	
	const isMounted = useRef(true);

	useEffect(() => {
		return () => { isMounted.current = false; };
	}, []);

	const handleAcepptTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}

		if (isMounted.current) 
			setLoading(false);

		history(`/tickets/${id}`);
	};

	const handleSelectTicket = id => history(`/tickets/${id}`);

	return (
		<React.Fragment key={ticket.id}>
			<ListItemButton 
				dense
				selected={ticketId && +ticketId === ticket.id}
				onClick={() => {
					if (ticket.status === "pending") return;
					handleSelectTicket(ticket.id);
				}}
			>
				<Tooltip arrow placement="right" title={ticket.queue?.name || "Sem fila"}>
					<Box 
						sx={{ 
							backgroundColor: ticket.queue?.color || "#7C7C7C",
							flex: "none",
							width: "4px",
							height: "100%",
							position: "absolute",
							top: "0%", 
							left: "0%"
						}}
					/>
				</Tooltip>
				
				<ListItemAvatar>
					<Avatar src={ticket?.contact?.profilePicUrl} />
				</ListItemAvatar>
				
				<ListItemText 
					disableTypography 
					primary={
						<span>
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
							>
								{ticket.contact.name}
							</Typography>

							{ticket.status === "closed" && <Badge badgeContent={"closed"} color="primary" />}
							
							{ticket.lastMessage && (
								<Typography
									component="span"
									variant="body2"
									color="textSecondary"
								>
									{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
										<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
									) : (
										<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
									)}
								</Typography>
							)}

							{ticket.whatsappId && (
								<div title={i18n.t("ticketsList.connectionTitle")}>{ticket.whatsapp?.name}</div>
							)}
						</span>
					}
					secondary={
						<span>
							<Typography
								noWrap
								variant="body2"
								color="textSecondary"
							>
								{ticket.lastMessage ? (
									<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
								) : (
									<br />
								)}
							</Typography>

							<Badge badgeContent={ticket.unreadMessages} />
						</span>
					}
				/>

				{ticket.status === "pending" && (
					<ButtonWithSpinner
						color="primary"
						variant="contained"
						size="small"
						loading={loading}
						onClick={e => handleAcepptTicket(ticket.id)}
					>
						{i18n.t("ticketsList.buttons.accept")}
					</ButtonWithSpinner>
				)}
			</ListItemButton>
		</React.Fragment>
	);
};

export default TicketListItem;
