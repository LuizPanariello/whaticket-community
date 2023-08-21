import { useState, useEffect, useReducer, useRef, FC, Fragment } from "react";
import { isSameDay, parseISO, format } from "date-fns";
import openSocket from "../../services/socket-io";


import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
} from "@mui/icons-material";

import MarkdownWrapper from "../MarkdownWrapper";
import VcardPreview from "../VcardPreview";
import LocationPreview from "../LocationPreview";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/wa-background.png";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import Audio from "../Audio";
import green from "@mui/material/colors/green";

let delayDebounceFn: number;

/*
const useStyles = makeStyles((theme) => ({
  messageLeft: {
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    whiteSpace: "pre-wrap",
    backgroundColor: "#ffffff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
  },

  quotedContainerLeft: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsg: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },
  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },
  messageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    whiteSpace: "pre-wrap",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
  },
  quotedContainerRight: {
    margin: "-3px -80px 6px -6px",
    overflowY: "hidden",
    backgroundColor: "#cfe9ba",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },
  quotedMsgRight: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    whiteSpace: "pre-wrap",
  },
  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },
  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  textContentItem: {
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: "#999",
  },
  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },
  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
    marginLeft: "0px",
  },
  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },
  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },
}));
*/

const reducer = (state: any, action: any) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages: any[] = [];

    messages.forEach((message: any) => {
      const messageIndex = state.findIndex((m: any) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m: any) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m: any) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList: FC<{ticketId: string, isGroup: boolean}> = ({ ticketId, isGroup }) => {

  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);

    delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setLoading(false);
          }

          if (pageNumber === 1 && data.messages.length > 1) {
            setTimeout(() => {
              scrollToBottom();
            }, 10)
          }
        } catch (err: any) {
          setLoading(false);
          toastError(err);
        }
      };
      
      fetchMessages();
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    if(!ticketId)
      return;

    const socket = openSocket();

    socket.on("connect", () => { socket.emit("joinChatBox", ticketId) });

    socket.on("connect_error", (err: any) => {
      console.log(`connect_error due to ${err.message}`);
    });

    socket.on("appMessage", (data: any) => {
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });

        setTimeout(() => {
          scrollToBottom();
        }, 100)
      }

      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  const loadMore = () => setPageNumber((prevPageNumber) => prevPageNumber + 1);

  const scrollToBottom = () => {
    if (lastMessageRef.current)
    {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  const handleScroll = (e: any) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      const el = document.getElementById("messagesList");
      if(!el) return;
      el.scrollTop = 1;
    }

    if (loading)
      return;

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e: any, message: any) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = () => setAnchorEl(null);

  const checkMessageMedia = (message: any) => {
    if (message.mediaType === "location" && message.body.split('|').length >= 2) {
      let locationParts = message.body.split('|')
      let imageLocation = locationParts[0]
      let linkLocation = locationParts[1]

      let descriptionLocation = null

      if (locationParts.length > 2)
        descriptionLocation = message.body.split('|')[2]

      return <LocationPreview image={imageLocation} link={linkLocation} description={descriptionLocation} />
    }
    else if (message.mediaType === "vcard") {
      let array = message.body.split("\n");
      let obj = [];
      let contact = "";
      for (let index = 0; index < array.length; index++) {
        const v = array[index];
        let values = v.split(":");
        for (let ind = 0; ind < values.length; ind++) {
          if (values[ind].indexOf("+") !== -1) {
            obj.push({ number: values[ind] });
          }
          if (values[ind].indexOf("FN") !== -1) {
            contact = values[ind + 1];
          }
        }
      }
      
      return <VcardPreview contact={contact} numbers={obj[0]?.number} />
    }
    else if ( /^.*\.(jpe?g|png|gif)?$/i.exec(message.mediaUrl) && message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "audio") { 
      return <Audio url={message.mediaUrl} />
    } else if (message.mediaType === "video") {
      return (
        <video
          style={{
            objectFit: "cover",
            width: 250,
            height: 200,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      return (
        <>
          <Box 
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "inherit",
              padding: 2
            }}
          >
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              Download
            </Button>
          </Box>
          <Divider />
        </>
      );
    }
  };

  // TODO tirar daqui
  const renderMessageAck = (message: any) => {
    if (message.ack === 0) {
      return <AccessTime 
        fontSize="small" 
        sx={{
          fontSize: 18,
          verticalAlign: "middle",
          marginLeft: 1,
        }}
      />;
    }
    if (message.ack === 1) {
      return <Done 
        fontSize="small" 
        sx={{
          fontSize: 18,
          verticalAlign: "middle",
          marginLeft: 1,
        }}
      />;
    }
    if (message.ack === 2) {
      return <DoneAll 
        fontSize="small" 
        sx={{
          fontSize: 18,
          verticalAlign: "middle",
          marginLeft: 1,
        }}
      />;
    }
    if (message.ack === 3 || message.ack === 4) {
      return <DoneAll 
        fontSize="small" 
        sx={{
          fontSize: 18,
          verticalAlign: "middle",
          marginLeft: 1,
          color: green[500]
        }}
      />;
    }
  };
  
  // TODO tirar daqui
  const renderDailyTimestamps = (message: any, index: number) => {
    if (!messagesList) 
      return <></>;

    if (index === 0) {
      return (
        <Box 
          key={`timestamp-${message.id}`}
          sx={{
            p:1,
            borderRadius: 1,
            alignItems: "center",
            textAlign: "center",
            alignSelf: "center",
            backgroundColor: "#e1f3fb",
            boxShadow: "0 1px 1px #b3b3b3",
          }}
        >
          <Typography fontSize={12} sx={{ color: "#808888", alignSelf: "center" }}>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </Typography>
        </Box>
      );
    }

    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span 
            key={`timestamp-${message.id}`}
            style={{
              alignItems: "center",
              textAlign: "center",
              alignSelf: "center",
              width: "110px",
              backgroundColor: "#e1f3fb",
              margin: "10px",
              borderRadius: "10px",
              boxShadow: "0 1px 1px #b3b3b3",
            }}
            >
            <Box 
              sx={{
                color: "#808888",
                alignSelf: "center",
                marginLeft: "0px",
              }}
            >
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </Box>
          </span>
        );
      }
    }

    if (index === messagesList.length - 1) {
      return (
        <Box
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };
  
  // TODO tirar daqui
  const renderMessageDivider = (message: any, index: any) => {
    if(!messagesList)
      return <></>

    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  // TODO tirar daqui
  const renderQuotedMessage = (message: any) => {
    return (
      <Box 
        sx={{
          maxHeight: "calc(100% - 10px)",
          marginLeft: 2,
          marginTop: 1,
          minWidth: 100,
          maxWidth: 600,
          pl: 1,
          pr: 1,
          pt: 1,
          pb: 0,
          height: "auto",
          display: "block",
          position: "relative",
          whiteSpace: "pre-wrap",
          backgroundColor: "#dcf8c6",
          color: "#303030",
          alignSelf: "flex-end",
          borderLeft: 3,
          boxShadow: "0 1px 1px #b3b3b3"
        }}
      >
        <Box
          sx={{
            padding: 1,
            maxWidth: 300,
            height: "auto",
            display: "block",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }} 
        />
        <Box 
          sx={{
            padding: 1,
            maxWidth: 300,
            height: "auto",
            display: "block",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }}
          //className={classes.quotedMsg}
        >
          {!message.quotedMsg?.fromMe && (
            <span style={{
              display: "flex",
              color: "#6bcbef",
              fontWeight: 500,
            }}>
              {message.quotedMsg?.contact?.name}
            </span>
          )}
          {message.quotedMsg?.body}
        </Box>
      </Box>
    );
  };

  const renderMessages = () => {
    if(!messagesList)
      return <></>;

    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {
        if (!message.fromMe) {
          return (
            <Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              <Box sx={{
                marginRight: 20,
                marginTop: 2,
                minWidth: 100,
                maxWidth: 600,
                height: "auto",
                display: "block",
                position: "relative",
                whiteSpace: "pre-wrap",
                backgroundColor: "#ffffff",
                color: "#303030",
                alignSelf: "flex-start",
                borderTopLeftRadius: 0,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                paddingLeft: 1,
                paddingRight: 1,
                paddingTop: 1,
                paddingBottom: 1,
                boxShadow: "0 1px 1px #b3b3b3",
              }}>
                <IconButton
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  style={{
                    display: "none",
                    position: "relative",
                    color: "#999",
                    zIndex: 1,
                    backgroundColor: "inherit",
                    opacity: "90%",
                    //"&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
                  }}
                  //className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>

                {isGroup && (
                  <Typography
                    component={"span"}
                    sx={{
                      display: "flex",
                      color: "#6bcbef",
                      fontWeight: 500
                    }}
                  >
                    {message.contact?.name}
                  </Typography>
                )}

                {(message.mediaUrl || message.mediaType === "location" || message.mediaType === "vcard") && checkMessageMedia(message)}

                <Box 
                  sx={{
                    overflowWrap: "break-word",
                    padding: "3px 80px 6px 6px",
                  }}
                >
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span 
                    style={{
                      fontSize: 11,
                      position: "absolute",
                      bottom: 0,
                      right: 5,
                      color: "#999",
                    }}
                  >
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </Box>
              </Box>
            </Fragment>
          );
        } else {
          return (
            <Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              <div 
                style={{
                  marginLeft: 20,
                  marginTop: 2,
                  minWidth: 100,
                  maxWidth: 600,
                  height: "auto",
                  display: "block",
                  position: "relative",
                  whiteSpace: "pre-wrap",
                  backgroundColor: "#dcf8c6",
                  color: "#303030",
                  alignSelf: "flex-end",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 0,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 5,
                  paddingBottom: 0,
                  boxShadow: "0 1px 1px #b3b3b3"
                }}
              >
                <IconButton
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  style={{
                    display: "none",
                    position: "relative",
                    color: "#999",
                    zIndex: 1,
                    backgroundColor: "inherit",
                    opacity: "90%",
                  }}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {(message.mediaUrl || message.mediaType === "location" || message.mediaType === "vcard"
                  //|| message.mediaType === "multi_vcard" 
                ) && checkMessageMedia(message)}
                <div
                  //className={clsx(classes.textContentItem, {
                  //  [classes.textContentItemDeleted]: message.isDeleted,
                  //})}
                >
                  {message.isDeleted && (
                    <Block
                      color="disabled"
                      fontSize="small"
                      style={{
                        fontSize: 18,
                        verticalAlign: "middle",
                        marginRight: 4,
                      }}
                    />
                  )}
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span 
                    style={{
                      fontSize: 11,
                      position: "absolute",
                      bottom: 0,
                      right: 5,
                      color: "#999"
                    }}
                  >
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </span>
                </div>
              </div>
            </Fragment>
          );
        }
      });

      return viewMessagesList;
    } else {
      //TODO change
      return <div>Say hello to your new contact!</div>;
    }
  };

  return (
    <Box sx={{
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      flexGrow: 1
    }}>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />

      <Box
        id="messagesList"
        onScroll={handleScroll}
        sx={{
          backgroundImage: `url(${whatsBackground})`,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "20px 20px 20px 20px",
          overflowY: "scroll"
        }}
      >
        {messagesList && messagesList.length > 0 ? renderMessages() : []}
      </Box>

      {loading && (
        <Box>
          <CircularProgress sx={{
            position: "absolute",
            opacity: "70%",
            top: 0,
            left: "50%",
            marginTop: 12}} 
          />
        </Box>
      )}
    </Box>
  );
};

export default MessagesList;