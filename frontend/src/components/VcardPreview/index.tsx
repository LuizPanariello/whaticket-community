import { useEffect, useState, useContext, FC } from 'react';
import { useNavigate } from "react-router-dom";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import { AuthContext } from "../../context/Auth/AuthContext";

import { Button, Divider, } from "@mui/material";

interface IContact 
{
    id: number
    name: string
    number: number
    profilePicUrl: string
}

const VcardPreview: FC<{contact: string, numbers: string }> = ({ contact, numbers }) => {
    const history = useNavigate();
    const { user } = useContext(AuthContext);

    const [selectedContact, setContact] = useState<Partial<IContact>>({
        name: "",
        number: 0,
        profilePicUrl: ""
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    let contactObj = {
                        name: contact,
                        // number: numbers.replace(/\D/g, ""),
                        number: numbers !== undefined && numbers.replace(/\D/g, ""),
                        email: ""
                    }
                    const { data } = await api.post("/contact", contactObj);
                    setContact(data)

                } catch (err: any) {
                    console.log(err)
                    toastError(err);
                }
            };
            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [contact, numbers]);

    const handleNewChat = async () => {
        try {
            const { data: ticket } = await api.post("/tickets", {
                contactId: selectedContact.id,
                userId: user.id,
                status: "open",
            });
            history(`/tickets/${ticket.id}`);
        } catch (err: any) {
            toastError(err);
        }
    }

    return (
        <>
            <div style={{
                minWidth: "250px",
            }}>
                <Grid container spacing={1}>
                    <Grid item xs={2}>
                        <Avatar src={selectedContact.profilePicUrl} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography style={{ marginTop: "12px", marginLeft: "10px" }} variant="subtitle1" color="primary" gutterBottom>
                            {selectedContact.name}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                        <Button
                            fullWidth
                            color="primary"
                            onClick={handleNewChat}
                            disabled={!selectedContact.number}
                        >
                            Conversar
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </>
    );

};

export default VcardPreview;