import React, { useState, useEffect, useContext, useRef, InputHTMLAttributes } from "react";
import { useParams } from "react-router-dom";

import * as emojiData from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

//import MicRecorder from "mic-recorder-to-mp3";

import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import MoodIcon from "@mui/icons-material/Mood";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import ClearIcon from "@mui/icons-material/Clear";
import MicIcon from "@mui/icons-material/Mic";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  FormControlLabel,
  Hidden,
  Menu,
  MenuItem,
  Switch,
  Box
} from "@mui/material";

import ClickAwayListener from "@mui/material/ClickAwayListener";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

import MicRecorder from 'mic-recorder'

const recorder = new MicRecorder({ bitRate: 128, encoder: 'mp3' });

const useStyles = {
  sendMessageIcons: {
    color: "grey",
  },

  circleLoading: {
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },

  cancelAudioIcon: {
    color: "red",
  },

  sendAudioIcon: {
    color: "green",
  },

  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
  },

  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },
  replyginMsgBody: {
    padding: 1,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },
  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },
  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },
  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
  messageQuickAnswersWrapper: {
    margin: 0,
    position: "absolute",
    bottom: "50px",
    background: "#ffffff",
    padding: "2px",
    border: "1px solid #CCC",
    left: 0,
    width: "100%",
    "& li": {
      listStyle: "none",
      "& a": {
        display: "block",
        padding: "8px",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxHeight: "32px",
        "&:hover": {
          background: "#F1F1F1",
          cursor: "pointer",
        },
      },
    },
  },
};

const MessageInput = ({ ticketStatus }: any) => {
  const classes = useStyles;

  const [medias, setMedias] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState<any[]>([]);
  const [typeBar, setTypeBar] = useState(false);
  const [anchorEl, setAnchorEl] = useState<any>(null);
  
  const inputRef = useRef<HTMLInputElement>();
  const { ticketId } = useParams();
  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);
  const { setReplyingMessage, replyingMessage } = useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    inputRef.current?.focus();
  }, [replyingMessage]);

  useEffect(() => {
    inputRef.current?.focus();

    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(undefined);
    };
  }, [ticketId, setReplyingMessage]);

  const handleChangeInput = (e: any) => {
    setInputMessage(e.target.value);
    handleLoadQuickAnswer(e.target.value);
  };

  const handleQuickAnswersClick = (value: any) => {
    setInputMessage(value);
    setTypeBar(false);
  };

  const handleAddEmoji = (e: any) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e: any) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e: any) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = async (e: any) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", "true");
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err: any) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err: any) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(undefined);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      await recorder.start();

      setRecording(true);
      setLoading(false);
    } catch (err: any) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLoadQuickAnswer = async (value: any) => {
    if (value && value.indexOf("/") === 0) {
      try {
        const { data } = await api.get("/quickAnswers/", {
          params: { searchParam: inputMessage.substring(1) },
        });

        setQuickAnswer(data.quickAnswers);
        if (data.quickAnswers.length > 0) {
          setTypeBar(true);
        } else {
          setTypeBar(false);
        }
      } catch (err: any) {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] =  await recorder.stop().getAudio();
      
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", "true");

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err: any) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
     // await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err: any) {
      toastError(err);
    }
  };

  const handleOpenMenuClick = (event: any) => setAnchorEl(event.currentTarget);
  const handleMenuItemClick = () => setAnchorEl(null);

  const renderReplyingMessage = (message: any) => {
    return (
      <Box sx={classes.replyginMsgWrapper}>
        <Box sx={classes.replyginMsgContainer}>
          <Box 
            sx={{
              //clsx(classes.replyginContactMsgSideColor, { [classes.replyginSelfMsgSideColor]: !message.fromMe, })
            }}
          />

          <Box sx={classes.replyginMsgBody}>
            {!message.fromMe && (
              <Box sx={classes.messageContactName}>
                {message.contact?.name}
              </Box>
            )}
            {message.body}
          </Box>
        </Box>

        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(undefined)}
        >
          <ClearIcon sx={classes.sendMessageIcons} />
        </IconButton>
      </Box>
    );
  };

  if (medias.length > 0)
    return (
      <Paper elevation={0} square sx={{
        display: "flex",
        padding: "10px 13px",
        position: "relative",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#eee",
        borderTop: "1px solid rgba(0, 0, 0, 0.12)"
      }}>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={(e) => setMedias([])}
        >
          <CancelIcon sx={classes.sendMessageIcons} />
        </IconButton>
        {loading ? (
          <Box> 
            <CircularProgress sx={classes.circleLoading} /> 
          </Box>
        ) : (
          <span>
            {medias[0]?.name}
            {/* <img src={media.preview} alt=""></img> */}
          </span>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={loading}
        >
          <SendIcon sx={classes.sendMessageIcons} />
        </IconButton>
      </Paper>
    );
  else {
    return (
      <Paper square elevation={0} 
      sx={{
        background: "#eee",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderTop: "1px solid rgba(0, 0, 0, 0.12)"
      }}>
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <Box sx={{
          p: 1,
          width: "100%",
          background: "#f0f0f0",
          display: "flex",
          alignItems: "center"
        }}>
          <Hidden only={["sm", "xs"]}>
            <IconButton
              aria-label="emojiPicker"
              component="span"
              disabled={loading || recording || ticketStatus !== "open"}
              onClick={(e) => setShowEmoji((prevState) => !prevState)}
            >
              <MoodIcon sx={classes.sendMessageIcons} />
            </IconButton>
            {showEmoji ? (
              <Box sx={{
                position: "absolute",
                bottom: 63,
                width: 40,
                borderTop: "1px solid #e8e8e8"
              }}>
                <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
                  <Picker
                    perLine={16}
                    showPreview={false}
                    showSkinTones={false}
                    onSelect={handleAddEmoji}
                    data={emojiData}
                  />
                </ClickAwayListener>
              </Box>
            ) : null}

            <input
              multiple
              type="file"
              id="upload-button"
              disabled={loading || recording || ticketStatus !== "open"}
              onChange={handleChangeMedias}
              style={{ display: "none" }}
            />
            <label htmlFor="upload-button">
              <IconButton
                aria-label="upload"
                component="span"
                disabled={loading || recording || ticketStatus !== "open"}
              >
                <AttachFileIcon 
                  //className={classes.sendMessageIcons} 
                />
              </IconButton>
            </label>

            <FormControlLabel
              style={{ marginRight: 7, color: "gray" }}
              label={i18n.t("messagesInput.signMessage")}
              labelPlacement="start"
              control={
                <Switch
                  size="small"
                  checked={signMessage}
                  onChange={(e) => setSignMessage(e.target.checked) }
                  name="showAllTickets"
                  color="primary"
                />
              }
            />

          </Hidden>
          <Hidden only={["md", "lg", "xl"]}>
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleOpenMenuClick}
            >
              <MoreVert></MoreVert>
            </IconButton>
            <Menu
              id="simple-menu"
              keepMounted
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuItemClick}
            >
              <MenuItem onClick={handleMenuItemClick}>
                <IconButton
                  aria-label="emojiPicker"
                  component="span"
                  disabled={loading || recording || ticketStatus !== "open"}
                  onClick={(e) => setShowEmoji((prevState) => !prevState)}
                >
                  <MoodIcon 
                    //className={classes.sendMessageIcons} 
                  />
                </IconButton>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <input
                  multiple
                  type="file"
                  id="upload-button"
                  disabled={loading || recording || ticketStatus !== "open"}
                  //style={classes.uploadInput}
                  onChange={handleChangeMedias}
                />
                <label htmlFor="upload-button">
                  <IconButton
                    aria-label="upload"
                    component="span"
                    disabled={loading || recording || ticketStatus !== "open"}
                  >
                    <AttachFileIcon sx={classes.sendMessageIcons} />
                  </IconButton>
                </label>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <FormControlLabel
                  style={{ marginRight: 7, color: "gray" }}
                  label={i18n.t("messagesInput.signMessage")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={signMessage}
                      onChange={(e) => setSignMessage(e.target.checked)}
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              </MenuItem>
            </Menu>
          </Hidden>
          <Box sx={{
            padding: 1,
            marginRight: 1,
            background: "#fff",
            display: "flex",
            borderRadius: 20,
            flex: 1,
            position: "relative"
          }}>
            <InputBase
              inputRef={(input) => {
                input && input.focus();
                input && (inputRef.current = input);
              }}
              sx={{
                paddingLeft: 2,
                flex: 1,
                border: "none"
              }}
              placeholder={
                ticketStatus === "open"
                  ? i18n.t("messagesInput.placeholderOpen")
                  : i18n.t("messagesInput.placeholderClosed")
              }
              multiline
              maxRows={5}
              value={inputMessage}
              onChange={handleChangeInput}
              disabled={recording || loading || ticketStatus !== "open"}
              onPaste={(e) => { ticketStatus === "open" && handleInputPaste(e); }}
              onKeyDown={(e) => {
                  if (loading || e.shiftKey) return;
                  else if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }
              }
            />
            {typeBar ? (
              <ul 
                //className={classes.messageQuickAnswersWrapper}
              >
                {quickAnswers.map((value: any, index) => {
                  return (
                    <li
                      //className={classes.messageQuickAnswersWrapperItem}
                      key={index}
                    >
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a onClick={() => handleQuickAnswersClick(value.message)}>
                        {`${value.shortcut} - ${value.message}`}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <></>
            )}
          </Box>
          {inputMessage ? (
            <IconButton
              aria-label="sendMessage"
              component="span"
              onClick={handleSendMessage}
              disabled={loading}
            >
              <SendIcon sx={classes.sendMessageIcons} />
            </IconButton>
          ) : recording ? (
            <Box sx={{
              display: "flex",
              alignItems: "center",
              alignContent: "middle",
            }}>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                disabled={loading}
                onClick={handleCancelAudio}
              >
                <HighlightOffIcon sx={classes.cancelAudioIcon} />
              </IconButton>
              {loading ? (
                <Box>
                  <CircularProgress sx={classes.audioLoading} />
                </Box>
              ) : (
                <RecordingTimer />
              )}

              <IconButton
                aria-label="sendRecordedAudio"
                component="span"
                onClick={handleUploadAudio}
                disabled={loading}
              >
                <CheckCircleOutlineIcon sx={classes.sendAudioIcon} />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              aria-label="showRecorder"
              component="span"
              disabled={loading || ticketStatus !== "open"}
              onClick={handleStartRecording}
            >
              <MicIcon sx={classes.sendMessageIcons} />
            </IconButton>
          )}
        </Box>
      </Paper>
    );
  }
};

export default MessageInput;
