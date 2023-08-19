import React from "react";
import CssBaseline from '@mui/material/CssBaseline';
import { createRoot } from 'react-dom/client';

import App from "./App";

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
	<>
		<CssBaseline />
		<App />
	</>
);