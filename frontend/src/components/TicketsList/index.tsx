import { useState, useEffect, useReducer, useContext, FC } from "react";
import openSocket from "../../services/socket-io";

import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state: any, action: any) => {
	if (action.type === "LOAD_TICKETS") {
		const newTickets = action.payload;

		newTickets.forEach((ticket: any) => {
			const ticketIndex = state.findIndex((t: any) => t.id === ticket.id);
			if (ticketIndex !== -1) {
				state[ticketIndex] = ticket;
				if (ticket.unreadMessages > 0) {
					state.unshift(state.splice(ticketIndex, 1)[0]);
				}
			} else {
				state.push(ticket);
			}
		});

		return [...state];
	}

	if (action.type === "RESET_UNREAD") {
		const ticketId = action.payload;

		const ticketIndex = state.findIndex((t: any) => t.id === ticketId);
		if (ticketIndex !== -1) {
			state[ticketIndex].unreadMessages = 0;
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET") {
		const ticket = action.payload;

		const ticketIndex = state.findIndex((t : any) => t.id === ticket.id);
		if (ticketIndex !== -1) {
			state[ticketIndex] = ticket;
		} else {
			state.unshift(ticket);
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
		const ticket = action.payload;

		const ticketIndex = state.findIndex((t : any) => t.id === ticket.id);
		if (ticketIndex !== -1) {
			state[ticketIndex] = ticket;
			state.unshift(state.splice(ticketIndex, 1)[0]);
		} else {
			state.unshift(ticket);
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET_CONTACT") {
		const contact = action.payload;
		const ticketIndex = state.findIndex((t : any) => t.contactId === contact.id);
		if (ticketIndex !== -1) {
			state[ticketIndex].contact = contact;
		}
		return [...state];
	}

	if (action.type === "DELETE_TICKET") {
		const ticketId = action.payload;
		const ticketIndex = state.findIndex((t : any) => t.id === ticketId);
		if (ticketIndex !== -1) {
			state.splice(ticketIndex, 1);
		}

		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const TicketsList: FC<any> = (props) => {
	const { status, searchParam, showAll, selectedQueueIds, updateCount, sx } = props;
	
	const { user } = useContext(AuthContext);

	const [pageNumber, setPageNumber] = useState(1);
	const [ticketsList, dispatch] = useReducer(reducer, []);

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [status, searchParam, dispatch, showAll, selectedQueueIds]);

	const { tickets, hasMore, loading } = useTickets({
		pageNumber,
		searchParam,
		status,
		showAll,
		queueIds: JSON.stringify(selectedQueueIds),
	});

	useEffect(() => {
		if (!status && !searchParam) 
			return;

		dispatch({ 
			type: "LOAD_TICKETS", 
			payload: tickets 
		});
	}, [tickets]);

	useEffect(() => {
		const socket = openSocket();

		const shouldUpdateTicket = (ticket: any) => !searchParam &&
			(!ticket.userId || ticket.userId === user?.id || showAll) &&
			(!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

		const notBelongsToUserQueues = (ticket: any) =>
			ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

		socket.on("connect", () => {
			if (status) {
				socket.emit("joinTickets", status);
			} else {
				socket.emit("joinNotification");
			}
		});

		socket.on("ticket", (data: any) => {
			if (data.action === "updateUnread") {
				dispatch({
					type: "RESET_UNREAD",
					payload: data.ticketId,
				});
			}

			if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
				dispatch({
					type: "UPDATE_TICKET",
					payload: data.ticket,
				});
			}

			if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
				dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
			}
		});

		socket.on("appMessage", (data: any) => {
			if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
				dispatch({
					type: "UPDATE_TICKET_UNREAD_MESSAGES",
					payload: data.ticket,
				});
			}
		});

		socket.on("contact", (data: any) => {
			if (data.action === "update") {
				dispatch({
					type: "UPDATE_TICKET_CONTACT",
					payload: data.contact,
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [status, searchParam, showAll, user, selectedQueueIds]);

	useEffect(() => {
		if (typeof updateCount === "function") 
			updateCount(ticketsList?.length);
 	}, [ticketsList]);

	const loadMore = () => setPageNumber(prevState => prevState + 1);

	const handleScroll = (e: any) => {
		if (!hasMore || loading) return;

		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			e.currentTarget.scrollTop = scrollTop - 100;
			loadMore();
		}
	};

	return (
    	<Paper 
			sx={{
				flexGrow: 1,
				overflowY: "hidden",
				...sx
			}}
		>
			<Paper square elevation={0} onScroll={handleScroll} sx={{
				position: "relative",
				display: "flex",
				height: "100%",
				flexDirection: "column",
				overflowY: "auto",
				borderTopRightRadius: 0,
				borderBottomRightRadius: 0
			}}>
				<List sx={{ p: 0 }}>
					{ticketsList?.length === 0 && !loading ? (
						<Paper sx={{p: 4}} elevation={0}>
							<Typography>{i18n.t("ticketsList.noTicketsTitle")}</Typography>
							<Typography>{i18n.t("ticketsList.noTicketsMessage")}</Typography>
						</Paper>
					) : (
						<>
							{ticketsList?.map(ticket => <TicketListItem ticket={ticket} key={ticket.id} />)}
						</>
					)}
					{loading && <TicketsListSkeleton />}
				</List>
			</Paper>
    	</Paper>
	);
};

export default TicketsList;
