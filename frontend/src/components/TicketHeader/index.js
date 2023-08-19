import React from "react";

import { Card, Button } from "@mui/material";
//import { makeStyles } from "@mui/material/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

/*
const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    backgroundColor: "#eee",
    flex: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
    },
  },
}));
*/

const TicketHeader = ({ loading, children }) => {
  const classes = {};//useStyles();
  const history = useNavigate();
  const handleBack = () => {
    history.push("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square className={classes.ticketHeader}>
          <Button color="primary" onClick={handleBack}>
            <ArrowBackIos />
          </Button>
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
