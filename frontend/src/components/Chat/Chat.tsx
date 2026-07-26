import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGame } from "../../context/Game/GameContext";
import { ChatHeader, ChatMessages, ChatInput } from "./index";

interface ChatProps {
	classname?: string | undefined;
}

export function Chat({ classname = "" }: ChatProps) {
	const { socket, gameId, messages, addMessage } = useGame();
	const messageContainerRef = useRef<HTMLDivElement | null>(null);

	// const [messages, setMessages] = useState<{ from: string; message: string; timeStamp: string }[]>([]);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [pendingNewMessages, setPendingNewMessages] = useState(false);

	useEffect(() => {
		socket?.on("receiveRoomMessage", (msg) => {
			if (!isAtBottom) {
				setPendingNewMessages(true);
			}
			addMessage(msg);
		});

		return () => {
			socket?.off("receiveRoomMessage");
		};
	}, [socket, isAtBottom, addMessage]);

	useEffect(() => {
		const container = messageContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
			const atBottom = distanceFromBottom < 100;
			setIsAtBottom(atBottom);
			if (atBottom) {
				setPendingNewMessages(false);
			}
		};

		container.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useLayoutEffect(() => {
		const container = messageContainerRef.current;
		if (!container) return;

		if (isAtBottom) {
			container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
			setPendingNewMessages(false);
		}
	}, [messages, isAtBottom]);

	const sendMessage = (message: string) => {
		socket?.emit("sendRoomMessage", { gameId, message });
	};

	const scrollToBottom = () => {
		const container = messageContainerRef.current;
		if (!container) return;
		container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
		setPendingNewMessages(false);
	};

	return (
		<div
			className={`relative flex flex-col w-full h-full bg-linear-to-br shadow-2xl border border-stone-700 overflow-hidden ${classname}`}>
			<ChatHeader />
			<div
				ref={messageContainerRef}
				className="flex-1 overflow-y-auto p-4 bg-stone-950/95">
				<ChatMessages messages={messages} />
			</div>
			{pendingNewMessages && (
				<button
					className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full bg-emerald-500/95 px-4 py-2 text-sm font-semibold text-stone-950 shadow-lg ring-1 ring-stone-700 hover:bg-emerald-400"
					onClick={scrollToBottom}>
					New messages
				</button>
			)}
			<ChatInput onSendMessage={sendMessage} />
		</div>
	);
}
