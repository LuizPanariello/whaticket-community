import { useState, useEffect, useReducer, FC } from "react";
import openSocket from "../../services/socket-io";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
  TextField,
  Box
} from "@mui/material";

import { Edit, DeleteOutline, Search } from "@mui/icons-material";

import MainContent from "../../components/MainContent";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickAnswersModal from "../../components/QuickAnswersModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import MainContainer from "../../components/MainContainer";

const reducer = (state: any, action: any) => {
  if (action.type === "LOAD_QUICK_ANSWERS") {
    const quickAnswers = action.payload;
    const newQuickAnswers: any[] = [];

    quickAnswers.forEach((quickAnswer: any) => {
      const quickAnswerIndex = state.findIndex((q: any) => q.id === quickAnswer.id);
      if (quickAnswerIndex !== -1) {
        state[quickAnswerIndex] = quickAnswer;
      } else {
        newQuickAnswers.push(quickAnswer);
      }
    });

    return [...state, ...newQuickAnswers];
  }

  if (action.type === "UPDATE_QUICK_ANSWERS") {
    const quickAnswer = action.payload;
    const quickAnswerIndex = state.findIndex((q: any) => q.id === quickAnswer.id);

    if (quickAnswerIndex !== -1) {
      state[quickAnswerIndex] = quickAnswer;
      return [...state];
    } else {
      return [quickAnswer, ...state];
    }
  }

  if (action.type === "DELETE_QUICK_ANSWERS") {
    const quickAnswerId = action.payload;

    const quickAnswerIndex = state.findIndex((q: any) => q.id === quickAnswerId);
    if (quickAnswerIndex !== -1) {
      state.splice(quickAnswerIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const QuickAnswers: FC = () => {

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [quickAnswers, dispatch] = useReducer(reducer, []);
  const [selectedQuickAnswers, setSelectedQuickAnswers] = useState<any>(null);
  const [quickAnswersModalOpen, setQuickAnswersModalOpen] = useState(false);
  const [deletingQuickAnswers, setDeletingQuickAnswers] = useState<any>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchQuickAnswers = async () => {
        try {
          const { data } = await api.get("/quickAnswers/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_QUICK_ANSWERS", payload: data.quickAnswers });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err: any) {
          toastError(err);
        }
      };
      fetchQuickAnswers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("quickAnswer", (data: any) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICK_ANSWERS", payload: data.quickAnswer });
      }

      if (data.action === "delete") {
        dispatch({
          type: "DELETE_QUICK_ANSWERS",
          payload: +data.quickAnswerId,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (event: any) => setSearchParam(event.target.value.toLowerCase());

  const handleOpenQuickAnswersModal = () => {
    setSelectedQuickAnswers(null);
    setQuickAnswersModalOpen(true);
  };

  const handleCloseQuickAnswersModal = () => {
    setSelectedQuickAnswers(null);
    setQuickAnswersModalOpen(false);
  };

  const handleEditQuickAnswers = (quickAnswer: any) => {
    setSelectedQuickAnswers(quickAnswer);
    setQuickAnswersModalOpen(true);
  };

  const handleDeleteQuickAnswers = async (quickAnswerId: number) => {
    try {
      await api.delete(`/quickAnswers/${quickAnswerId}`);
      toast.success(i18n.t("quickAnswers.toasts.deleted"));
    } catch (err: any) {
      toastError(err);
    }
    setDeletingQuickAnswers(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => setPageNumber((prevState) => prevState + 1);

  const handleScroll = (e: any) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <>
      <MainContainer>
        
        <MainHeader>
          <Title>{i18n.t("quickAnswers.title")}</Title>
          <MainHeaderButtonsWrapper>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                placeholder={i18n.t("quickAnswers.searchPlaceholder")}
                type="search"
                size="small"
                value={searchParam}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenQuickAnswersModal}
              >
                {i18n.t("quickAnswers.buttons.add")}
              </Button>
            </Box>
          </MainHeaderButtonsWrapper>
        </MainHeader>

        <MainContent>

          <Paper variant="outlined" onScroll={handleScroll}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    {i18n.t("quickAnswers.table.shortcut")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("quickAnswers.table.message")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("quickAnswers.table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <>
                  {quickAnswers?.map((quickAnswer) => (
                    <TableRow key={quickAnswer.id}>
                      <TableCell align="center">{quickAnswer.shortcut}</TableCell>
                      <TableCell align="center">{quickAnswer.message}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuickAnswers(quickAnswer)}
                        >
                          <Edit />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingQuickAnswers(quickAnswer);
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && <TableRowSkeleton columns={3} />}
                </>
              </TableBody>
            </Table>
          </Paper>
        </MainContent>

      </MainContainer>

      <ConfirmationModal
        title={deletingQuickAnswers &&
          `${i18n.t("quickAnswers.confirmationModal.deleteTitle")} ${
            deletingQuickAnswers.shortcut
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickAnswers(deletingQuickAnswers.id)}
      >
        {i18n.t("quickAnswers.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QuickAnswersModal
        open={quickAnswersModalOpen}
        onClose={handleCloseQuickAnswersModal}
        aria-labelledby="form-dialog-title"
        quickAnswerId={selectedQuickAnswers && selectedQuickAnswers.id} 
      />
    </>
  );
};

export default QuickAnswers;
