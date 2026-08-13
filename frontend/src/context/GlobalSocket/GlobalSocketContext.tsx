import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../auth";
import { toastWrapper } from "../../adapters/toastWrapper";
import { GlobalSocketContext } from "./globalSocketContextValue";

export const GlobalSocketProvider = ({ children }: { children: React.ReactNode }) => {
	const { state: authState } = useAuth();
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		if (!authState.user) {
			return;
		}

		console.log("Initialize Global Socket to check Presence");
		const socketInstance = io("/", {
			withCredentials: true,
			path: "/socket.io",
			transports: ["websocket"],
			autoConnect: false,
		});

		const handleConnect = () => {
			console.log("Global Socket Connected");
			setSocket(socketInstance);
		};

		const handleDisconnect = () => {
			console.warn("Global Socket Disconnected");
			setSocket(null);
		};

		socketInstance.on("connect", handleConnect);
		socketInstance.on("disconnect", handleDisconnect);

		const onHaveActiveGame = () => {
			toastWrapper.success("Have an active Game ongoing, please go to play to continue");
		};

		socketInstance.on("haveActiveGame", onHaveActiveGame);

		socketInstance.connect();
		(window as Window & { debugSocket?: Socket }).debugSocket = socketInstance;
		return () => {
			console.log("Disconnected Global Socket by logout or close Browser");

			socketInstance.off("connect", handleConnect);
			socketInstance.off("disconnect", handleDisconnect);
			socketInstance.off("haveActiveGame", onHaveActiveGame);
			setSocket(null);

			socketInstance.disconnect();
		};
	}, [authState.user]);

	return <GlobalSocketContext.Provider value={{ socket }}>{children}</GlobalSocketContext.Provider>;
};
