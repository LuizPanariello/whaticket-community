import { useState, useEffect, useReducer, useContext, FC } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Search from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import MainContent from "../../components/MainContent";

const reducer = (state: any, action: any) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts: any = [];

    contacts.forEach((contact: any) => {
      const contactIndex = state.findIndex((c: any) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c: any) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c: any) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};


const Contacts: FC = () => {

  const history = useNavigate();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });

          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err: any) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("contact", (data: any) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (event: any) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleSaveTicket = async (contactId: any) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user?.id,
        status: "open",
      });
      
      history(`/tickets/${ticket.id}`);
      
    } catch (err: any) {
      toastError(err);
    }
    setLoading(false);
  };

  const hadleEditContact = (contactId: any) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId: any) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err: any) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      history(0);
    } catch (err: any) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e: any) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>

      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId as any}
      />

      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={() =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>

      <MainHeader>
        <Title>{i18n.t("contacts.title")}</Title>

        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
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
              onClick={(e) => setConfirmOpen(true)}
            >
                  {i18n.t("contacts.buttons.import")}
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenContactModal}
                >
                  {i18n.t("contacts.buttons.add")}
                </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <MainContent>
        <Paper variant="outlined" onScroll={handleScroll}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                <TableCell align="center">
                  {i18n.t("contacts.table.whatsapp")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("contacts.table.email")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("contacts.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {contacts?.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell style={{ paddingRight: 0 }}>
                      {<Avatar src={contact.profilePicUrl} />}
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell align="center">{contact.number}</TableCell>
                    <TableCell align="center">{contact.email}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleSaveTicket(contact.id)}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => hadleEditContact(contact.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <Can
                        role={user.profile}
                        perform="contacts-page:deleteContact"
                        yes={() => (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setConfirmOpen(true);
                              setDeletingContact(contact);
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton avatar columns={3} />}
              </>
            </TableBody>
          </Table>
        </Paper>
      </MainContent>
    </MainContainer>
  );
};

export default Contacts;
