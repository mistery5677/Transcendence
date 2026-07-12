import React, { useEffect, useRef, useState } from "react";
import { getFriendsList } from "../../api/friendRequest";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../contexts/ChatContext/ChatContext";
import { getActiveChats } from "../../api/privateChat";
import { useAuth } from "../../contexts/UserContext";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { UserStatusBadge, type UserStatus } from "../UserStatusBandage/UserStatusBandage";

interface ChatListItemProps {
	avatarUrl: string;
	username: string;
	status: UserStatus;
	onClick: () => void;
	children?: React.ReactNode;
}

function ChatListItem({ avatarUrl, username, status, onClick, children }: ChatListItemProps) {
	console.log(status);
	return (
		<div
			onClick={onClick}
			className="flex items-center gap-2 text-xs p-1.5 bg-stone-700 hover:bg-stone-650 rounded text-stone-200 mb-1 cursor-pointer transition-colors duration-150">
			<div className="relative shrink-0">
				<img
					src={avatarUrl}
					alt={username}
					className="w-6 h-6 rounded-full object-fit bg-stone-600 shrink-0"
				/>
				<UserStatusBadge
					status={status}
					size="sm"
				/>
			</div>

			<div className="flex-1 min-w-0">
				<p className="font-semibold truncate">{username}</p>
				{children}
			</div>
		</div>
	);
}

function ShowFriendList({ onSelectFriend }: { onSelectFriend: (friend: any) => void }) {
	const [friends, setFriends] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchFriend = async () => {
			try {
				const data = await getFriendsList();
				setFriends(data);
			} catch (error) {
				console.error("Failed to get the friends list: ", error);
			} finally {
				setLoading(false);
			}
		};
		fetchFriend();
	}, []);
	return (
		<div className="w-full h-full overflow-y-auto p-1">
			<h3 className="text-xs font-bold text-stone-400 mb-2 tracking-wider">Friend List</h3>
			{loading ? (
				<p className="text-center text-xs text-stone-500 pt-4">Loading...</p>
			) : friends.length === 0 ? (
				<div className="flex flex-col items-center justify-center w-full pt-4">
					<p className="text-center text-xs text-stone-500">No friend found.</p>
					<button
						onClick={() => navigate("/friends")}
						className="mt-2 mx-auto rounded-lg bg-button-green px-4 py-1.5 text-xs text-white font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none cursor-pointer text-center">
						Add friends
					</button>
				</div>
			) : (
				<div>
					{friends.map((friend) => (
						<ChatListItem
							key={friend.id}
							avatarUrl={friend.avatarUrl}
							username={friend.username}
							status={friend.status}
							onClick={() => onSelectFriend(friend)}>
							<p className="text-[10px] text-emerald-400">ELO: {friend.elo}</p>
						</ChatListItem>
					))}
				</div>
			)}
		</div>
	);
}

function ActiveChatBox({ activeChat }: { activeChat: any }) {
	const { privateChats, sendPrivateMessage, setActiveChatUserId, loadChatHistory } = useChat();
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (activeChat?.id) {
			setActiveChatUserId(activeChat.id);
			loadChatHistory(activeChat.id);
		}

		return () => {
			setActiveChatUserId(null);
		};
	}, [activeChat?.id, setActiveChatUserId, loadChatHistory]);

	const chatMessages = privateChats[String(activeChat.id)] || [];

	useEffect(() => {
		if (chatMessages.length > 0) {
			const timer = setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [chatMessages.length]);

	const handleSend = () => {
		if (!input.trim()) return;
		sendPrivateMessage(activeChat.id, input.trim());
		setInput("");
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex flex-col h-full w-full bg-stone-950/95 justify-between overflow-hidden">
			<div className="flex items-center gap-2.5 bg-stone-900 px-3 py-2 border-b border-stone-800 shrink-0">
				<div className="relative shrink-0">
					<img
						src={activeChat.avatarUrl || ""}
						alt={activeChat.username}
						className="w-7 h-7 rounded-full object-cover bg-stone-700 border border-stone-700 shrink-0"
					/>
					<UserStatusBadge
						status={activeChat.status}
						size="sm"
					/>
				</div>
				<div className="flex flex-col min-w-0">
					<span className="text-xs font-bold text-stone-100 truncate">{activeChat.username}</span>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-2 space-y-2 flex flex-col">
				<p className="text-[10px] text-stone-500 text-center my-1">Connected with {activeChat.username}</p>

				{chatMessages.length === 0 ? (
					<p className="text-[10px] text-stone-600 text-center mt-4 italic">No messages yet...</p>
				) : (
					chatMessages.map((msg, index) => {
						const isFriend = String(msg.fromId) === String(activeChat.id);
						return (
							<div
								key={index}
								className={`rounded-xl border p-2 text-left max-w-[85%] ${
									!isFriend
										? "bg-emerald-950/60 border-emerald-800/60 self-end text-emerald-200"
										: "bg-stone-800 border-stone-700 self-start text-stone-200"
								}`}>
								<div className="flex items-center justify-between gap-2 text-[9px] text-stone-400 font-medium">
									<span className={!isFriend ? "text-emerald-400" : "text-stone-300"}>
										{!isFriend ? "You" : msg.fromUsername || activeChat.username}
									</span>
									<span>
										{msg.timestamp
											? new Date(msg.timestamp).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})
											: ""}
									</span>
								</div>
								<p className="mt-0.5 text-xs leading-tight break-words">{msg.message}</p>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className="bg-stone-900 border-t border-stone-700 p-1.5">
				<div className="flex items-center gap-1.5 rounded-2xl bg-stone-800 p-1 shadow-inner">
					<input
						type="text"
						className="flex-1 min-w-0 h-7 text-xs rounded-2xl bg-stone-950 px-2 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
						placeholder="Message..."
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					<button
						type="button"
						onClick={handleSend}
						className="inline-flex h-7 px-3 items-center justify-center rounded-2xl bg-emerald-500 text-[11px] font-bold text-stone-950 transition hover:bg-emerald-400 focus:outline-none cursor-pointer">
						Send
					</button>
				</div>
			</div>
		</div>
	);
}

function ShowActiveChats({ onSelectFriend }: { onSelectFriend: (friend: any) => void }) {
	const [activeChats, setActiveChats] = useState<any[]>([]);
	const { state } = useAuth();

	useEffect(() => {
		const fetchActiveChats = async () => {
			try {
				const data = await getActiveChats();
				setActiveChats(data);
			} catch (error) {
				console.error("Failed to fetch activeChats: ", error);
			}
		};
		fetchActiveChats();
	}, []);

	return (
		<div className="w-full h-full overflow-y-auto p-1">
			<h3 className="text-xs font-bold text-stone-400 mb-2 tracking-wider">Active Chats List</h3>

			{activeChats.length === 0 ? (
				<p className="text-xs text-stone-400 text-center">No active chats.</p>
			) : (
				<div>
					{activeChats.map((activeChat) => (
						<ChatListItem
							key={activeChat.id}
							avatarUrl={activeChat.avatarUrl}
							status={activeChat.status}
							username={activeChat.username}
							onClick={() => onSelectFriend(activeChat)}>
							<div className="flex items-baseline gap-1 text-[10px] text-stone-400 min-w-0">
								<span className="font-medium shrink-0">
									{activeChat.lastMessage?.fromId === state.user?.id
										? "You: "
										: activeChat.username + ": "}
								</span>
								<span className="text-emerald-400 truncate">{activeChat.lastMessage?.message}</span>
							</div>
						</ChatListItem>
					))}
				</div>
			)}
		</div>
	);
}

export function FloatingChatContainer() {
	const [isOpen, setIsOpen] = useState(false);
	const [showFriends, setShowFriends] = useState(false);
	const [activeChat, setActiveChat] = useState<any | null>(null);
	const { state } = useAuth();
	const { newMessage, setNewMessage } = useChat();

	useEffect(() => {
		if (isOpen) {
			setNewMessage(false);
		}
	}, [isOpen, setNewMessage]);

	const handleSelectFriend = (friend: any) => {
		setActiveChat(friend);
		setShowFriends(false);
	};

	if (!state.user) return;

	return (
		<div className="fixed bottom-2 right-2 md:bottom-4 md:right-4 z-50">
			{!isOpen && (
				<div>
					<button
						onClick={() => setIsOpen(true)}
						className="flex h-12 w-12 md:h-14 md:w-14 cursor-pointer items-center justify-center bg-stone-800 hover:bg-stone-700 rounded-full shadow-2xl text-xl transition-transform hover:scale-110 active:scale-95">
						<ChatBubbleOvalLeftEllipsisIcon
							className={`size-6 ${!newMessage ? "text-white" : "text-button-green"} `}
						/>
					</button>
				</div>
			)}

			{isOpen && (
				<div
					className="bg-stone-800 text-white flex flex-col justify-between rounded-lg shadow-2xl overflow-hidden border border-stone-750 transition-all duration-200
				w-[calc(100vw-16px)] h-[75vh] max-h-[500px]
				md:w-[22vw] md:h-[45vh] md:min-w-[320px] md:max-w-[400px] md:min-h-[400px] md:max-h-[600px]
                ">
					{/* Header */}
					<div className="flex items-center justify-between bg-stone-800 p-2.5 border-b border-stone-600 shrink-0">
						<span className="text-xs font-bold text-white uppercase tracking-wide">Chat</span>
						<div className="flex items-center gap-3">
							{!showFriends && !activeChat ? (
								<button
									onClick={() => setShowFriends(true)}
									className="text-stone-400 hover:text-emerald-400 font-bold text-xs cursor-pointer transition-colors">
									New Chat +
								</button>
							) : (
								<button
									onClick={() => {
										setShowFriends(false);
										setActiveChat(null);
									}}
									className="text-stone-400 hover:text-white font-medium text-[11px] cursor-pointer transition-colors">
									⬅ Back
								</button>
							)}
							<button
								onClick={() => {
									setIsOpen(false);
									setActiveChat(null);
									setShowFriends(false);
								}}
								className="text-stone-400 hover:text-rose-400 font-bold text-xs cursor-pointer transition-colors pl-1">
								✖
							</button>
						</div>
					</div>
					{/* Body */}
					<div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-stone-900/40">
						{showFriends ? (
							<ShowFriendList onSelectFriend={handleSelectFriend} />
						) : activeChat ? (
							<ActiveChatBox activeChat={activeChat} />
						) : (
							<ShowActiveChats onSelectFriend={handleSelectFriend} />
						)}
					</div>
				</div>
			)}
		</div>
	);
}
