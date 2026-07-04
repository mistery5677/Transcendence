import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../UserContext";
import { toastWrapper } from "../../adapters/toastWrapper";

type GlobalSocketContextType = {
	socket: Socket | null;
};

const GlobalSocketContext = createContext<GlobalSocketContextType | undefined>(undefined);

export const GlobalSocketProvider = ({ children }: { children: React.ReactNode }) => {
	const { state: authState } = useAuth();
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		if (!authState.user) {
			setSocket(null);
			return;
		}

		console.log("Initialize Global Socket to check Presence");
		const socketInstance = io("/", {
			withCredentials: true,
			path: "/socket.io",
			transports: ["websocket"],
			autoConnect: false,
		});

		socketInstance.on("connect", () => {
			console.log("Global Socket Connected");
		});

		socketInstance.on("disconnect", () => {
			console.warn("Global Socket Disconnected");
		});

		const onHaveActiveGame = () => {
			toastWrapper.success("Have an active Game ongoing, please go to play to continue");
		};

		socketInstance.on("haveActiveGame", onHaveActiveGame);

		//! Can add here catch notifications ?? Or Other events
		socketInstance.connect();
		setSocket(socketInstance);
		return () => {
			console.log("Disconnected Global Socket by logout or close Browser");

			socketInstance.off("connect");
			socketInstance.off("disconnect");
			socketInstance.off("haveActiveGame", onHaveActiveGame);

			socketInstance.disconnect();
		};
	}, [authState.user]);

	return <GlobalSocketContext.Provider value={{ socket }}>{children}</GlobalSocketContext.Provider>;
};

export const useGlobalSocket = () => {
	const context = useContext(GlobalSocketContext);
	if (!context) {
		throw new Error("useGlobalSocket must be used inside GlobalSocketProvider");
	}
	return context;
};
