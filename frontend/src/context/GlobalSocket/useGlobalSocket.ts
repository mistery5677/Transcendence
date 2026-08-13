import { useContext } from "react";
import { GlobalSocketContext } from "./globalSocketContextValue";

export function useGlobalSocket() {
	const context = useContext(GlobalSocketContext);
	if (!context) {
		throw new Error("useGlobalSocket must be used inside GlobalSocketProvider");
	}
	return context;
}
