interface IRules
{
	user: IRule
	admin: IRule
	[keyof: string]: IRule
}

interface IRule {
	static?: string[]
	dynamic?: {
		[keyof: string] : (permission: string) => boolean
	}
}

const Rules: IRules = {
	user: {
		static: [],
	},
	admin: {
		static: [
			"drawer-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"ticket-options:deleteTicket",
			"ticket-options:transferWhatsapp",
			"contacts-page:deleteContact",
		],
	},
};

export default Rules;
