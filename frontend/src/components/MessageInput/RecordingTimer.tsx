import { Box } from "@mui/material";
import { useState, useEffect } from "react";

const RecordingTimer = () => {
	const initialState = {
		minutes: 0,
		seconds: 0,
	};
	const [timer, setTimer] = useState(initialState);

	useEffect(() => {
		const interval = setInterval(
			() =>
				setTimer(prevState => {
					if (prevState.seconds === 59) {
						return { ...prevState, minutes: prevState.minutes + 1, seconds: 0 };
					}
					return { ...prevState, seconds: prevState.seconds + 1 };
				}),
			1000
		);
		return () => {
			clearInterval(interval);
		};
	}, []);

	const addZero = (n: number) => n < 10 ? "0" + n : n;

	return (
		<Box
			sx={{
				display: "flex",
				marginLeft: 1,
				marginRight: 1,
				alignItems: "center",
			}}
		>
			<span>{`${addZero(timer.minutes)}:${addZero(timer.seconds)}`}</span>
		</Box>
	);
};

export default RecordingTimer;
