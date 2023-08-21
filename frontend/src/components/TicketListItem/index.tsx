import { useState, useEffect, useRef, useContext, FC, Fragment } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";

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

const TicketListItem: FC<any> = ({ ticket }) => {
	const history = useNavigate();
	const { user } = useContext(AuthContext);
	const { ticketId } = useParams();

	const [loading, setLoading] = useState(false);
	
	const isMounted = useRef(true);

	useEffect(() => {
		return () => { isMounted.current = false; };
	}, []);

	const handleAcepptTicket = async (id: any) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
		} catch (err: any) {
			setLoading(false);
			toastError(err);
		}

		if (isMounted.current) 
			setLoading(false);

		history(`/tickets/${id}`);
	};

	const handleSelectTicket = (id: any) => history(`/tickets/${id}`);

	return (
		<Fragment key={ticket.id}>
			<ListItemButton dense
				selected={(ticketId && +ticketId === ticket.id) as any}
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
						onClick={() => handleAcepptTicket(ticket.id)}
					>
						{i18n.t("ticketsList.buttons.accept")}
					</ButtonWithSpinner>
				)}
			</ListItemButton>
		</Fragment>
	);
};

export default TicketListItem;
