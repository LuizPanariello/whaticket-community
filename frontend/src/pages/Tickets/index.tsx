import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";

import { i18n } from "../../translate/i18n";
import Hidden from "@mui/material/Hidden";

const Chat = () => {
  const { ticketId } = useParams();

  return (
    <div>
      <div>
        <Grid container spacing={0}>
          <Grid item xs={12} md={4}>
            <TicketsManager />
          </Grid>
          
          <Grid item xs={12} md={8}>
            {ticketId ? (
              <Ticket />
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper sx={{p:2}}>
                  <span>{i18n.t("chat.noTicketMessage")}</span>
                </Paper>
              </Hidden>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;
