import { FC } from "react";
import rules from "../../rules";

const check = (role: string, action: string, data?: any) => {
	const permissions = rules[role];
	if (!permissions) {
		// role is not present in the rules
		return false;
	}

	const staticPermissions = permissions.static;
	if (staticPermissions && staticPermissions.includes(action)) {
		// static rule not provided for action
		return true;
	}

	const dynamicPermissions = permissions.dynamic;

	if (dynamicPermissions) {
		const permissionCondition = dynamicPermissions && dynamicPermissions[action];
		if (!permissionCondition) {
			// dynamic rule not provided for action
			return false;
		}

		return permissionCondition(data);
	}
	return false;
};

interface ICan {
	role: string
	perform: string
	data?: any
	yes: () => JSX.Element
	no?: () => JSX.Element
};

const Can: FC<ICan> = (props) => {
	const { 
		role, 
		perform, 
		data, 
		yes, 
		no = () => <></> 
	} = props;
	
	const result = check(role, perform, data)
	if(result)
		return yes();
	
	return no();
}

export { Can };
