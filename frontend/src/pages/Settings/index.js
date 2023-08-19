import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import { Grid } from "@mui/material";

const Settings = () => {
	const [settings, setSettings] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("settings", data => {
			if (data.action === "update") {
				setSettings(prevState => {
					const aux = [...prevState];
					const settingIndex = aux.findIndex(s => s.key === data.setting.key);
					aux[settingIndex].value = data.setting.value;
					return aux;
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChangeSetting = async e => {
		const selectedValue = e.target.value;
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const getSettingValue = key => {
		const { value } = settings.find(s => s.key === key);
		return value;
	};

	return (
		<Container maxWidth={"sm"}>
			<Typography variant="body1" gutterBottom>
				{i18n.t("settings.title")}
			</Typography>

			<Grid container spacing={2} xs={12}>
				<Grid item xs={12}>
					<Paper sx={{ p: 2 }}>
						<Typography variant="body1">
							{i18n.t("settings.settings.userCreation.name")}
						</Typography>

						<Select
							native
							id="userCreation-setting"
							margin="dense"
							variant="outlined"
							name="userCreation"
							value={settings && settings.length > 0 && getSettingValue("userCreation")}
							onChange={handleChangeSetting}
						>
							<option value="enabled">
								{i18n.t("settings.settings.userCreation.options.enabled")}
							</option>
							<option value="disabled">
								{i18n.t("settings.settings.userCreation.options.disabled")}
							</option>
						</Select>
					</Paper>
				</Grid>

				<Grid item xs={12}>
					<Paper sx={{ p: 2 }}>
						<TextField
							id="api-token-setting"
							readonly
							label="Token Api"
							margin="dense"
							variant="outlined"
							fullWidth
							value={settings && settings.length > 0 && getSettingValue("userApiToken")}
						/>
					</Paper>
				</Grid>
			</Grid>

		</Container>
	);
};

export default Settings;
