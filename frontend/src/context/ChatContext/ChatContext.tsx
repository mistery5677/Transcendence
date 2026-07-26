import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ChatContextType, PrivateMessage } from "./ChatContextType";
import { useGlobalSocket } from "../GlobalSocketContext/GlobalSocketContext";
import { useAuth } from "../UserContext";
import { getChatHistory } from "../../api/privateChat";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const [privateChats, setPrivateChats] = useState<Record<string, PrivateMessage[]>>({});
	const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
	const { state } = useAuth();
	const [loadingChats, setLoadingChats] = useState<Record<string, boolean>>({});
	const [newMessage, setNewMessage] = useState<boolean>(false);
	const chatFetchStatus = useRef<Record<string, "idle" | "loading" | "loaded">>({});

	const sendPrivateMessage = (toUserId: string, message: string) => {
		if (!socket) return;
		socket.emit("sendPrivateMessage", { toUserId: String(toUserId), message: message.trim() });
	};

	const loadChatHistory = useCallback(
		async (friendId: string) => {
			const idKey = String(friendId);
			const currentStatus = chatFetchStatus.current[idKey] || "idle";

			if (currentStatus === "loading" || currentStatus === "loaded") return;

			if (privateChats[idKey] && privateChats[idKey].length > 0) return;

			if (loadingChats[idKey]) return;

			setLoadingChats((prev) => ({ ...prev, [idKey]: true }));

			chatFetchStatus.current[idKey] = "loading";
			try {
				const history = await getChatHistory(idKey);

				setPrivateChats((prev) => ({
					...prev,
					[idKey]: history,
				}));
				chatFetchStatus.current[idKey] = "loaded";
			} catch (error) {
				console.error("Error loading history:", error);
				chatFetchStatus.current[idKey] = "loaded";
			} finally {
				setLoadingChats((prev) => ({ ...prev, [idKey]: false }));
			}
		},
		[privateChats, loadingChats],
	);

	useEffect(() => {
		if (!socket) return;

		const onReceiveMessage = (msg: PrivateMessage) => {
			const currentUserId = state.user?.id ? String(state.user.id) : null;
			if (!currentUserId) return;

			const msgFromId = String(msg.fromId);
			const msgToId = String(msg.toId);

			const amITheSender = msgFromId === currentUserId;
			const chatPartnerId = amITheSender ? msgToId : msgFromId;

			if (!amITheSender) {
				setNewMessage(true);
			}

			setPrivateChats((prev) => {
				const previousMessages = prev[chatPartnerId] ? [...prev[chatPartnerId]] : [];
				const isDuplicate = previousMessages.some(
					(m) => m.timestamp === msg.timestamp && m.message === msg.message && m.fromId === msgFromId,
				);

				if (isDuplicate) return prev;

				return {
					...prev,
					[chatPartnerId]: [...previousMessages, msg],
				};
			});
		};

		socket.on("receivePrivateMessage", onReceiveMessage);

		return () => {
			socket.off("receivePrivateMessage", onReceiveMessage);
		};
	}, [socket, state.user?.id]);

	return (
		<ChatContext.Provider
			value={{
				privateChats,
				sendPrivateMessage,
				activeChatUserId,
				setActiveChatUserId,
				loadChatHistory,
				newMessage,
				setNewMessage,
			}}>
			{children}
		</ChatContext.Provider>
	);
};

export const useChat = () => {
	const context = useContext(ChatContext);

	if (!context) {
		throw new Error("useChat must be used within a ChatProvider");
	}

	return context;
};
