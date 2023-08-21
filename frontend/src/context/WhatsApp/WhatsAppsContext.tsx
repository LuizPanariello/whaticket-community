import { FC, createContext } from "react";

import useWhatsApps from "../../hooks/useWhatsApps";

interface IWhatsAppsContext
{
	loading: boolean
	whatsApps?: any[]
}

const WhatsAppsContext = createContext<IWhatsAppsContext>({} as any);

const WhatsAppsProvider: FC = ({ children }) => {
	const { loading, whatsApps } = useWhatsApps();

	return (
		<WhatsAppsContext.Provider value={{ whatsApps, loading }}>
			{children}
		</WhatsAppsContext.Provider>
	);
};

export { WhatsAppsContext, WhatsAppsProvider };
