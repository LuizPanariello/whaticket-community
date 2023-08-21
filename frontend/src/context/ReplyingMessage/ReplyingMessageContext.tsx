import { useState, createContext, FC } from "react";

interface IReplyMessageContext
{
	replyingMessage?: string
	setReplyingMessage: (message?: string) => void
}

const ReplyMessageContext = createContext<IReplyMessageContext>({} as any);

const ReplyMessageProvider: FC<{children?: React.ReactNode }> = ({ children }) => {
	const [replyingMessage, setReplyingMessage] = useState<any>();

	return (
		<ReplyMessageContext.Provider value={{ replyingMessage, setReplyingMessage }}>
			{children}
		</ReplyMessageContext.Provider>
	);
};

export { ReplyMessageContext, ReplyMessageProvider };
