import { FC } from "react";
import { useParams } from "react-router-dom";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";

import { i18n } from "../../translate/i18n";
import Hidden from "@mui/material/Hidden";
import Typography from "@mui/material/Typography";

const Chat: FC = () => {
  const { ticketId } = useParams();

  return (
    <Box>
      <Box>
        <Grid container spacing={0}>
          <Grid item xs={12} md={4}>
            <TicketsManager />
          </Grid>
          
          <Grid item xs={12} md={8}>
            {ticketId ? (
              <Ticket />
              ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper sx={{p: 4, m: 4, textAlign: "center"}} variant="outlined">
                  <Typography>{i18n.t("chat.noTicketMessage")}</Typography>
                </Paper>
              </Hidden>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Chat;
