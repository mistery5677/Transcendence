import { useState, useEffect, useRef, useTransition } from "react";
import { useAuth } from "../../contexts/UserContext";
import {
	sendFriendRequest,
	acceptFriendRequest,
	declineFriendRequest,
	getPendingFriendRequests,
	getFriendsList,
	removeFriend,
} from "../../api/friendRequest";
import { ConfirmDialog } from "../../components/index";
import { toastWrapper } from "../../adapters/toastWrapper";
import { getUsers } from "../../api/users";
import { Link } from "react-router-dom";
import { UserStatusBadge } from "../../components/UserStatusBandage/UserStatusBandage";

type FriendsTab = "list" | "requests" | "add";

type FriendSuggestion = {
	id: number;
	username: string;
	avatarUrl?: string;
	score: {
		elo: number;
	};
};

export function Friends() {
	const { state } = useAuth();
	const [activeTab, setActiveTab] = useState<FriendsTab>("list");

	// Data States
	const [friends, setFriends] = useState<any[]>([]);
	const [requests, setRequests] = useState<any[]>([]);
	const [searchUsername, setSearchUsername] = useState("");
	const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	// UX Control States
	const [isPending, startTransition] = useTransition();
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		friendId?: number;
		username?: string;
	}>({ open: false });

	const inputRef = useRef<HTMLInputElement>(null);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Early return protection if auth state is loading or absent
	if (!state?.user) {
		return <div className="text-white text-center mt-20 animate-pulse">Loading profile...</div>;
	}

	// Handle sending a friend request
	const handleAddFriend = async (username: string) => {
		if (!username.trim()) return;
		try {
			await sendFriendRequest(username);
			toastWrapper.success(`Friend request sent to ${username}`);
			setSearchUsername("");
			setSuggestions([]);
		} catch (error: any) {
			toastWrapper.warn(error.message || "Error sending friend request");
		}
	};

	// Handle accepting a request
	const handleAccept = async (senderId: number) => {
		try {
			await acceptFriendRequest(senderId);
			setRequests((prev) => prev.filter((req) => req.senderId !== senderId));
			toastWrapper.success("Friend request accepted!");

			// Refresh list if we are currently looking at it
			if (activeTab === "list") {
				const updatedFriends = await getFriendsList();
				setFriends(updatedFriends);
			}
		} catch {
			toastWrapper.error("Error accepting friend request.");
		}
	};

	// Handle declining a request
	const handleDecline = async (senderId: number) => {
		try {
			await declineFriendRequest(senderId);
			setRequests((prev) => prev.filter((req) => req.senderId !== senderId));
			toastWrapper.success("Request declined.");
		} catch {
			toastWrapper.error("Error declining friend request.");
		}
	};

	// Open remove confirmation modal
	const handleRemoveFriend = (friendId: number, username: string) => {
		setConfirmDialog({ open: true, friendId, username });
	};

	// Confirm actual removal action
	const handleConfirmRemove = async () => {
		const { friendId } = confirmDialog;
		if (!friendId) return;
		try {
			await removeFriend(friendId);
			setFriends((prev) => prev.filter((f) => f.id !== friendId));
			toastWrapper.success("Friend removed.");
		} catch {
			toastWrapper.error("Error removing friend.");
		} finally {
			setConfirmDialog({ open: false });
		}
	};

	// Centralized data synchronizer
	useEffect(() => {
		let isMounted = true;

		const syncData = async () => {
			try {
				// Always sync pending request numbers for tab badge counter updates
				const pendingData = await getPendingFriendRequests();
				if (!isMounted) return;
				setRequests(pendingData);

				if (activeTab === "list") {
					const friendsData = await getFriendsList();
					if (!isMounted) return;
					setFriends(friendsData);
				}
			} catch (error) {
				console.error("Sync error:", error);
			}
		};

		syncData();
		return () => {
			isMounted = false;
		};
	}, [activeTab]);

	// Debounced suggestion searches to save database/API performance
	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchUsername(value);

		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

		if (value.trim().length === 0) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		searchTimeoutRef.current = setTimeout(async () => {
			try {
				const currentUserId = state?.user?.id;
				const users = await getUsers(value.trim(), currentUserId ? [currentUserId] : []);
				startTransition(() => {
					setSuggestions(users.slice(0, 5));
					setShowSuggestions(true);
				});
			} catch {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		}, 300); // 300ms delay
	};

	// Graceful dropdown loss-of-focus close
	const handleBlur = () => {
		setTimeout(() => setShowSuggestions(false), 180);
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-stone-900 py-16 selection:bg-emerald-500/30 selection:text-emerald-200">
			{/* Ambient Light Flares */}
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/10 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/5 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/10 blur-3xl" />

			<div
				className="relative max-w-4xl sm:mx-auto mx-4 p-6 sm:p-8 text-stone-100 rounded-3xl border
			 border-white/10 bg-stone-950/40 shadow-[0_24px_70px_rgba(10,10,10,0.7)] backdrop-blur-2xl">
				<div className="flex items-center justify-between mb-8">
					<h1
						className="text-4xl font-black bg-gradient-to-t from-emerald-500 via-emerald-400
					 to-teal-300 bg-clip-text text-transparent tracking-tight">
						Friends Hub
					</h1>
				</div>

				{/* NAVIGATION TABS */}
				<div className="flex gap-6 mb-8 border-b border-white/5 pb-px text-lg font-medium">
					{(["list", "requests", "add"] as const).map((tab) => {
						const isActive = activeTab === tab;
						const label =
							tab === "list" ? "My Friends" : tab === "requests" ? "Pending Requests" : "Add Friend";
						return (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`pb-3 relative transition-all duration-200 outline-none -mb-px border-b-2 ${
									isActive
										? "text-emerald-400 border-emerald-400 font-bold"
										: "text-stone-400 border-transparent hover:text-stone-200"
								}`}>
								{label}
								{tab === "requests" && requests.length > 0 && (
									<span className="absolute top-0 -right-3.5 flex size-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
										<span className="relative inline-flex rounded-full size-2 bg-red-500" />
									</span>
								)}
							</button>
						);
					})}
				</div>

				{/* TAB 1: FRIENDS LIST */}
				{activeTab === "list" && (
					<div className="space-y-3.5">
						{friends.length === 0 ? (
							<p className="text-stone-400 text-center py-12 text-base">
								You don't have any friends yet. Go to{" "}
								<span className="text-emerald-400 font-medium">Add Friend</span> to find some rivals!
							</p>
						) : (
							friends.map((friend) => (
								<div
									key={friend.id}
									className="flex gap-4 items-center justify-between rounded-2xl border border-white/5
									 bg-stone-900/40 p-4 transition-all duration-200 hover:border-white/10 hover:bg-stone-900/60">
									<div className="flex items-center gap-3 sm:gap-4 min-w-0">
										<div
											className="relative size-12 shrink-0 rounded-full border border-white/10
										 bg-stone-800 flex items-center justify-center">
											<img
												className="rounded-full size-full object-cover"
												src={friend.avatarUrl || "/placeholder-avatar.png"}
												alt=""
											/>
											<UserStatusBadge status={friend.status} />
										</div>
										<div className="min-w-0">
											<Link
												to={`/history/${friend.username}`}
												className="hover:text-emerald-400 font-bold text-base text-stone-200 block 
												truncate transition-colors"
												title={`View ${friend.username}'s Match History`}>
												{friend.username}
											</Link>
											<p className="text-xs font-mono text-emerald-400/90 mt-0.5">
												ELO: {friend.elo ?? 1000}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2.5 shrink-0">
										<button
											className="rounded-xl border border-emerald-400/20 bg-emerald-600/90 font-bold
										 px-4 py-2 text-sm text-white transition-all duration-200 hover:bg-emerald-500 active:scale-98">
											Play ⚔️
										</button>
										<button
											onClick={() => handleRemoveFriend(friend.id, friend.username)}
											className="rounded-xl border border-white/5 bg-stone-800/80 p-2 text-sm font-medium
											 text-stone-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-950/20 hover:text-red-400"
											title="Remove Friend">
											✕
										</button>
									</div>
								</div>
							))
						)}
					</div>
				)}

				{/* TAB 2: PENDING REQUESTS */}
				{activeTab === "requests" && (
					<div className="space-y-3.5">
						{requests.length === 0 ? (
							<p className="text-stone-400 text-base text-center py-12">No pending requests.</p>
						) : (
							requests.map((req) => (
								<div
									key={req.id}
									className="flex items-center justify-between rounded-2xl border border-white/5 bg-stone-900/40 p-4">
									<div className="flex items-center gap-4 min-w-0">
										<div className="size-10 shrink-0 rounded-full border border-white/5 bg-stone-800 flex items-center justify-center">
											<img
												className="rounded-full size-full object-cover"
												src={req.sender.avatarUrl || "/placeholder-avatar.png"}
												alt=""
											/>
										</div>
										<p className="font-bold text-stone-200 text-base truncate">
											<Link
												to={`/profile/${req.sender.username}`}
												className="text-emerald-400 hover:underline transition-colors">
												{req.sender.username}
											</Link>
											<span className="text-stone-400 font-normal"> sent a request!</span>
										</p>
									</div>
									<div className="flex gap-2 shrink-0">
										<button
											onClick={() => handleAccept(req.senderId)}
											className="px-3.5 py-1.5 text-sm bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400
											 hover:text-white rounded-xl font-bold transition-all">
											Accept
										</button>
										<button
											onClick={() => handleDecline(req.senderId)}
											className="px-3.5 py-1.5 text-sm bg-stone-800 hover:bg-red-950/40 text-stone-400 hover:text-red-400
											 rounded-xl font-medium transition-all">
											Decline
										</button>
									</div>
								</div>
							))
						)}
					</div>
				)}

				{/* TAB 3: ADD FRIENDS */}
				{activeTab === "add" && (
					<div className="max-w-md mx-auto py-6">
						<div className="flex flex-col gap-3">
							<label className="text-xs font-bold text-stone-400 uppercase tracking-widest">
								Search by Username
							</label>
							<div
								className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-stone-950/40 px-2
							 py-1.5 transition-all focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20">
								<span className="pl-2 pr-0.5 text-emerald-500 text-lg font-semibold selection:bg-transparent">
									@
								</span>
								<input
									ref={inputRef}
									type="text"
									placeholder="Enter username..."
									value={searchUsername}
									onChange={handleUsernameChange}
									onBlur={handleBlur}
									className="flex-1 p-2 bg-transparent border-none focus:outline-none text-stone-100 placeholder:text-stone-600 text-base"
									autoComplete="off"
								/>
								<button
									onClick={() => handleAddFriend(searchUsername)}
									className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white 
									font-bold rounded-xl text-sm transition-all disabled:opacity-40 disabled:hover:bg-emerald-600"
									disabled={!searchUsername.trim() || isPending}>
									Send
								</button>

								{/* Suggestions List Dropdown */}
								{showSuggestions && suggestions.length > 0 && (
									<ul
										role="listbox"
										className="absolute left-0 top-[calc(100%+6px)] w-full bg-stone-900 border border-white/10
										 rounded-2xl shadow-2xl z-50 max-h-56 overflow-y-auto p-1.5 space-y-0.5 backdrop-blur-xl">
										{suggestions.map((user) => (
											<li
												key={user.id}
												role="option"
												aria-selected={searchUsername === user.username}
												className="px-3 py-2.5 hover:bg-white/5 rounded-xl cursor-pointer text-stone-100
												 flex items-center justify-between transition-colors group"
												onMouseDown={() => {
													setSearchUsername(user.username);
													setShowSuggestions(false);
												}}>
												<div className="flex items-center gap-3">
													<div
														className="relative size-7 shrink-0 rounded-full ring ring-emerald-400 bg-stone-800 border
													 border-white/10 overflow-hidden">
														{user.avatarUrl ? (
															<img
																src={user.avatarUrl}
																alt=""
																className="w-full h-full object-fit"
															/>
														) : (
															<div
																className="w-full h-full flex items-center justify-center text-[10px]
															 text-stone-400 font-bold bg-stone-800">
																{user.username.charAt(0).toUpperCase()}
															</div>
														)}
													</div>
													<span className="font-medium text-sm group-hover:text-emerald-400 transition-colors">
														{user.username}
													</span>
												</div>
												<span className="text-xs text-stone-500 group-hover:text-stone-400 transition-colors font-mono">
													{user.score?.elo ? `RANK: ${user.score.elo}` : "0 ELO"}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>
				)}

				<ConfirmDialog
					open={confirmDialog.open}
					title="Remove Friend"
					message={`Are you sure you want to remove ${confirmDialog.username} from your friends?`}
					onConfirm={handleConfirmRemove}
					onCancel={() => setConfirmDialog({ open: false })}
				/>
			</div>
		</div>
	);
}
