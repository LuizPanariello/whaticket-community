import { useState, useCallback, useContext, FC, Fragment } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { green } from "@mui/material/colors";

import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Paper,
	Tooltip,
	Typography,
	CircularProgress,
} from "@mui/material";

import {
	Edit,
	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
	DeleteOutline,
} from "@mui/icons-material";


import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContent from "../../components/MainContent";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import MainContainer from "../../components/MainContainer";

const CustomToolTip: FC<any> = ({ title, content, children }) => {
	return (
		<Tooltip arrow title={
				<Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

const Connections = () => {

	const { whatsApps, loading } = useContext(WhatsAppsContext);

	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState<any>(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};

	const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState);

	const handleStartWhatsAppSession = async (whatsAppId: any) => {
		try {
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err: any) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async (whatsAppId: any) => {
		try {
			await api.put(`/whatsappsession/${whatsAppId}`);
		} catch (err: any) {
			toastError(err);
		}
	};

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, [setSelectedWhatsApp, setWhatsAppModalOpen]);

	const handleOpenQrModal = (whatsApp: any) => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, [setQrModalOpen, setSelectedWhatsApp]);

	const handleEditWhatsApp = (whatsApp: any) => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleOpenConfirmationModal = (action: any, whatsAppId: any) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.disconnectTitle"),
				message: i18n.t("connections.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
				open: true
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
				open: true
			});
		}
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "disconnect") {
			try {
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
			} catch (err: any) {
				toastError(err);
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err: any) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
	};

	const renderActionButtons = (whatsApp: any) => {
		return (
			<>
				{whatsApp.status === "qrcode" && (
					<Button
						size="small"
						variant="contained"
						color="primary"
						onClick={() => handleOpenQrModal(whatsApp)}
					>
						{i18n.t("connections.buttons.qrcode")}
					</Button>
				)}

				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Button
							size="small"
							variant="outlined"
							color="primary"
							onClick={() => handleStartWhatsAppSession(whatsApp.id)}
						>
							{i18n.t("connections.buttons.tryAgain")}
						</Button>{" "}
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							onClick={() => handleRequestNewQrCode(whatsApp.id)}
						>
							{i18n.t("connections.buttons.newQr")}
						</Button>
					</>
				)}
				
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") && (
					<Button
						size="small"
						variant="outlined"
						color="secondary"
						onClick={() => {
							handleOpenConfirmationModal("disconnect", whatsApp.id);
						}}
					>
						{i18n.t("connections.buttons.disconnect")}
					</Button>
				)}
				{whatsApp.status === "OPENING" && (
					<Button size="small" variant="outlined" disabled>
						{i18n.t("connections.buttons.connecting")}
					</Button>
				)}
			</>
		);
	};

	const renderStatusToolTips = (whatsApp: any) => {
		return (
			<div>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.disconnected.title")}
						content={i18n.t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgress size={24} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.qrcode.title")}
						content={i18n.t("connections.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
						<SignalCellular4Bar style={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.timeout.title")}
						content={i18n.t("connections.toolTips.timeout.content")}
					>
						<SignalCellularConnectedNoInternet2Bar color="secondary" />
					</CustomToolTip>
				)}
			</div>
		);
	};

	return (
		<MainContainer>
			
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>
			<QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
			/>
			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
			/>

			<MainHeader>
				<Title>{i18n.t("connections.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenWhatsAppModal}
					>
						{i18n.t("connections.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>

			<MainContent>
			
				<Paper variant="outlined">
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell align="center">
									{i18n.t("connections.table.name")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.status")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.session")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.lastUpdate")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.default")}
								</TableCell>
								<TableCell align="center">
									{i18n.t("connections.table.actions")}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRowSkeleton columns={0} />
							) : (
								<>
									{whatsApps && whatsApps.length > 0 &&
										whatsApps?.map(whatsApp => (
											<TableRow key={whatsApp.id}>
												<TableCell align="center">{whatsApp.name}</TableCell>
												<TableCell align="center">
													{renderStatusToolTips(whatsApp)}
												</TableCell>
												<TableCell align="center">
													{renderActionButtons(whatsApp)}
												</TableCell>
												<TableCell align="center">
													{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
												</TableCell>
												<TableCell align="center">
													{whatsApp.isDefault && (
														<div>
															<CheckCircle style={{ color: green[500] }} />
														</div>
													)}
												</TableCell>
												<TableCell align="center">
													<IconButton
														size="small"
														onClick={() => handleEditWhatsApp(whatsApp)}
													>
														<Edit />
													</IconButton>

													<IconButton
														size="small" 
														onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}>
														<DeleteOutline />
													</IconButton>
												</TableCell>
											</TableRow>
										))}
								</>
							)}
						</TableBody>
					</Table>
				</Paper>
			</MainContent>
		</MainContainer>
	);
};

export default Connections;
