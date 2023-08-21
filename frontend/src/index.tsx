import CssBaseline from '@mui/material/CssBaseline';
import { createRoot } from 'react-dom/client';
import App from "./App"

const container = document.getElementById('root');
if(!container)
	throw Error("Document root not found");

const root = createRoot(container);

root.render(
	<>
		<CssBaseline />
		<App />
	</>
);