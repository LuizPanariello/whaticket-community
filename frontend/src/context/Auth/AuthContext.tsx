import { FC, createContext } from "react";

import useAuth from "../../hooks/useAuth/index.js";

const AuthContext = createContext<{ 
	loading: boolean, 
	user: any, 
	isAuth: boolean,
	handleLogin: (userData: any) => void,
	handleLogout: () => void }>({} as any);

const AuthProvider: FC = ({children}) => {
	const { loading, user, isAuth, handleLogin, handleLogout } = useAuth();

	return (
		<AuthContext.Provider value={{ loading, user, isAuth, handleLogin, handleLogout }} >
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
