import { useState, useEffect, useReducer } from "react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const reducer = (state: any, action: any) => {
	console.log(state, action);
	
	if (action.type === "LOAD_WHATSAPPS") {
		const whatsApps = action.payload;

		return [...whatsApps];
	}

	if (action.type === "UPDATE_WHATSAPPS") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex((s: any) => s.id === whatsApp.id);

		if (whatsAppIndex !== -1) {
			state[whatsAppIndex] = whatsApp;
			return [...state];
		} else {
			return [whatsApp, ...state];
		}
	}

	if (action.type === "UPDATE_SESSION") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex((s: any) => s.id === whatsApp.id);

		if (whatsAppIndex !== -1) {
			state[whatsAppIndex].status = whatsApp.status;
			state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
			state[whatsAppIndex].qrcode = whatsApp.qrcode;
			state[whatsAppIndex].retries = whatsApp.retries;
			return [...state];
		} else {
			return [...state];
		}
	}

	if (action.type === "DELETE_WHATSAPPS") {
		const whatsAppId = action.payload;

		const whatsAppIndex = state.findIndex((s: any) => s.id === whatsAppId);
		if (whatsAppIndex !== -1) {
			state.splice(whatsAppIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET")
		return [];
};

const useWhatsApps = () => {
	const [whatsApps, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/whatsapp/");
				dispatch({ type: "LOAD_WHATSAPPS", payload: data });
				setLoading(false);
			} catch (err: any) {
				setLoading(false);
				toastError(err);
			}
		};

		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("whatsapp", (data: any) => {
			console.log(data)
			if (data.action === "update") {
				dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
			}
		});

		socket.on("whatsapp", (data: any) => {
			if (data.action === "delete") {
				dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
			}
		});

		socket.on("whatsappSession", (data: any) => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_SESSION", payload: data.session });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return { whatsApps, loading };
};

export default useWhatsApps;
