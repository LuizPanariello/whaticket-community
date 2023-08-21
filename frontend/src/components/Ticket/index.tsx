import { useState, useEffect, FC } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import ContactDrawer from "../ContactDrawer";
import MessageInput from "../MessageInput";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import TicketActionButtons from "../TicketActionButtons";
import MessagesList from "../MessagesList";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";


const Ticket: FC = () => {
  const { ticketId } = useParams();
  const history = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<any>({});
  const [ticket, setTicket] = useState<any>({});

  useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          const { data } = await api.get("/tickets/" + ticketId);
          setContact(data.contact);
          setTicket(data);
          setLoading(false);
        } catch (err: any) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, history]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("ticket", (data: any) => {
      if (data.action === "update") {
        setTicket(data.ticket);
      }

      if (data.action === "delete") {
        toast.success("Ticket deleted sucessfully.");
        history("/tickets");
      }
    });

    socket.on("contact", (data: any) => {
      if (data.action === "update") {
        setContact((prevState: any) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact };
          }
          return prevState;
        });
      }
    });

    return () => { socket.disconnect(); };
  }, [ticketId, history]);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <Box 
      id="drawer-container"
      sx={{
        display: "flex",
        position: "relative",
        overflow: "hidden",
        height: "calc(100vh - 80px)"
      }}
    >
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderLeft: 0
        }}
      >
        <TicketHeader loading={loading}>
          <Box sx={{ maxWidth: "50%", flexBasis: "50%" }}>
            <TicketInfo contact={contact} ticket={ticket} onClick={handleDrawerOpen} />
          </Box>
          <Box sx={{ maxWidth: "50%", flexBasis: "50%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <TicketActionButtons ticket={ticket} />
          </Box>
        </TicketHeader>

        <ReplyMessageProvider>
          <MessagesList ticketId={ticketId} isGroup={ticket.isGroup} />
          <MessageInput ticketStatus={ticket.status} />
        </ReplyMessageProvider>
      </Paper>
      
      <ContactDrawer
        open={drawerOpen}
        handleDrawerClose={handleDrawerClose}
        contact={contact}
        loading={loading}
      />
    </Box>
  );
};

export default Ticket;
