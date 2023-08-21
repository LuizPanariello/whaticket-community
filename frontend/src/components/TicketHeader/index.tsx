import { FC } from "react";
import { Card, Button } from "@mui/material";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

const TicketHeader: FC<{loading: boolean, children?: React.ReactNode }> = ({ loading, children }) => {

  const history = useNavigate();
  const handleBack = () => history("/tickets");

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square sx={{
          display: "flex",
          backgroundColor: "#eee",
          flex: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)"
        }}>
          <Button color="primary" onClick={handleBack}>
            <ArrowBackIos />
          </Button>
          { children }
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
