import { createContext } from "react";
import type { Socket } from "socket.io-client";

type GlobalSocketContextType = {
	socket: Socket | null;
};

export const GlobalSocketContext = createContext<GlobalSocketContextType | undefined>(undefined);
