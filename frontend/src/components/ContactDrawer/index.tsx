import { FC, useState } from "react";

//import { makeStyles } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import Link from "@mui/material/Link";
import InputLabel from "@mui/material/InputLabel";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

import { i18n } from "../../translate/i18n";

import ContactModal from "../ContactModal";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import { Box } from "@mui/material";

const drawerWidth = 320;

/*
const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		display: "flex",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: "#eee",
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "73px",
		justifyContent: "flex-start",
	},
	content: {
		display: "flex",
		backgroundColor: "#eee",
		flexDirection: "column",
		padding: "8px 0px 8px 8px",
		height: "100%",
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},

}));
*/

const ContactDrawer:FC<any> = ({ open, handleDrawerClose, contact, loading }) => {
	const classes = {};//useStyles();

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<Drawer
			open={open}
			variant="persistent"
			anchor="right"
		>
			<Box
				alignItems={"center"}
				sx={{
					p: 1,
					display: "flex",
					minHeight: "73px",
					justifyContent: "flex-start",
				}}
			>
				<IconButton onClick={handleDrawerClose}>
					<CloseIcon />
				</IconButton>
				<Typography style={{ justifySelf: "center" }}>
					{i18n.t("contactDrawer.header")}
				</Typography>
			</Box>
			{loading ? (<ContactDrawerSkeleton classes={classes} />) : 
			(
				<div 
					//className={classes.content}
				>
					<Paper 
						square 
						variant="outlined" 
						sx={{
							display: "flex",
							padding: 8,
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Avatar
							alt={contact.name}
							src={contact.profilePicUrl}
							sx={{ m: 6, width: 160, height: 160 }}
						/>

						<Typography>
							{contact.name}
						</Typography>

						<Typography>
							<Link href={`tel:${contact.number}`}>{contact.number}</Link>
						</Typography>

						<Button variant="outlined" onClick={() => setModalOpen(true)}>
							{i18n.t("contactDrawer.buttons.edit")}
						</Button>
					</Paper>

					<Paper square variant="outlined" sx={{
						padding: 1,
						display: "flex",
						flexDirection: "column"
					}}>
						<ContactModal
							open={modalOpen}
							onClose={() => setModalOpen(false)}
							contactId={contact.id}
						/>

						<Typography variant="subtitle1">
							{i18n.t("contactDrawer.extraInfo")}
						</Typography>

						{contact?.extraInfo?.map((info: any) => (
							<Paper key={info.id} variant="outlined" sx={{
								marginTop: 1,
								padding: 1
							}}>
								<InputLabel>{info.name}</InputLabel>
								<Typography component="div" noWrap sx={{pt:.5}}>
									<MarkdownWrapper>{info.value}</MarkdownWrapper>
								</Typography>
							</Paper>
						))}
					</Paper>
				</div>
			)}
		</Drawer>
	);
};

export default ContactDrawer;
