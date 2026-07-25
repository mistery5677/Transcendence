import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext/NotificationContext";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useMatchMaking } from "../../contexts/MatchMakingContext/MatchMakingContext";
import type { NotificationType } from "../../contexts/NotificationContext/notificationTypes";

export function NotificationBell() {
	const { respondToGameInvite } = useMatchMaking();
	const { unreadCount, notifications, markOneAsRead, markAllAsRead, deleteOneNotification, deleteAllNotifications } = useNotifications();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const navigate = useNavigate();

	const containerRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleCloseDropdown = () => {
		setIsOpen(false);
	};

	const handleNotificationClick = async (notification: NotificationType) => {
		if (!notification.read) {
			await markOneAsRead(notification.id);
		}

		if (notification.type === "friendRequest") {
			navigate("/friends");
			handleCloseDropdown();
		}
	};

	const handleInviteAction = async (notification: NotificationType, accept: boolean, e: React.MouseEvent) => {
		e.stopPropagation();
		const hostId = notification.payload?.senderId;
		const notificationId = notification.id;
		if (hostId) {
			respondToGameInvite(hostId, accept, notificationId);
			console.log("Sended as string ");
		}

		if (!notification.read) {
			await markOneAsRead(notificationId);
		}

		handleCloseDropdown();
	};

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				handleCloseDropdown();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleOutsideClick);
		}

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [isOpen]);

	return (
		<div
			ref={containerRef}
			className="relative inline-block text-left">
			<div className="relative inline-block text-left">
				<button
					type="button"
					onClick={toggleDropdown}
					className={`relative rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
						isOpen
							? "text-emerald-200 bg-emerald-400/10 z-50"
							: "text-stone-300 hover:text-emerald-200 hover:bg-emerald-400/10"
					}`}>
					<span className="absolute -inset-1.5" />
					<span className="sr-only">View notifications</span>
					<BellIcon
						aria-hidden="true"
						className="size-6"
					/>

					{unreadCount > 0 && (
						<span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-lime-300 animate-pulse"/>
					)}
				</button>

				{isOpen && (
					<div>
						<div
							className="fixed inset-0 z-40 cursor-default"
							onClick={handleCloseDropdown}
						/>

						<div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-stone-800 bg-stone-900/95 p-4 shadow-lg ring-1 ring-black/5 focus:outline-none backdrop-blur-md z-50">
							<div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
								<h3 className="text-sm font-semibold text-stone-200">Notifications</h3>
								{unreadCount > 0 && (
									<span className="text-xs bg-lime-500/20 text-lime-300 px-2 py-0.5 rounded-full">
										{unreadCount} new
									</span>
								)}
								{unreadCount > 0 && (
									<button
										type="button"
										onClick={markAllAsRead}
										className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-all focus:outline-none">
										Mark all as read
									</button>
								)}
								{(notifications.length > 0 && unreadCount == 0) && (
									<button
										type="button"
										onClick={deleteAllNotifications}
										className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-all focus:outline-none">
										Delete all notifications
									</button>
								)}
							</div>

							{/* List */}
							<div className="max-h-64 overflow-y-auto space-y-2 flex flex-col custom-scrollbar">
								{notifications.length === 0 ? (
									<p className="text-xs text-stone-500 text-center py-4">
										No notifications at the moment.
									</p>
								) : (
									notifications.map((notification) => (
										<div
											key={notification.id}
											onClick={() => handleNotificationClick(notification)}
											className={`p-2 rounded-lg transition-colors duration-150 border-l-2 ${
												notification.type === "matchInvite"
													? "cursor-default"
													: "cursor-pointer"
											} ${
												notification.read
													? "bg-stone-800/20 hover:bg-stone-800/50 border-stone-700"
													: "bg-stone-800/70 hover:bg-stone-800/90 border-emerald-500"
											}`}>
											<div className="flex items-center justify-between">
											<p className="text-xs font-medium text-stone-200">{notification.title}</p>
											<a className="text-[16px] text-stone-400 hover:text-emerald-400 hover:underline cursor-pointer"
											 	onClick={(e) => {
													e.stopPropagation();
													markOneAsRead(notification.id);
													deleteOneNotification(notification.id);
												}}>	
												x
											</a>
											</div>
											<div className="flex items-start gap-2 mt-1">
												<div className="ring ring-emerald-500 rounded-full w-6 h-6 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 mt-0.5">
													<img
														src={notification.payload?.senderAvatarUrl}
														alt="Sender Avatar"
														className="w-6 h-6 rounded-full"
													/>
												</div>

												<div className="flex-1 min-w-0">
													<div className="text-[11px] text-stone-400 leading-normal">
														<span className="text-emerald-500 font-bold hover:underline cursor-pointer mr-1">
															{notification.payload?.senderUsername}
														</span>
														{notification.message}
													</div>

													{/* 🌟 Buttons of matchInvite*/}
													{notification.type === "matchInvite" && (
														<div className="flex gap-2 mt-2">
															<button
																type="button"
																onClick={(e) =>
																	handleInviteAction(notification, true, e)
																}
																className="bg-emerald-600 hover:bg-emerald-500 text-stone-100 text-[10px] font-semibold px-2.5 py-1 rounded transition-colors shadow-sm focus:outline-none">
																Accept
															</button>
															<button
																type="button"
																onClick={(e) =>
																	handleInviteAction(notification, false, e)
																}
																className="bg-stone-700 hover:bg-stone-600 text-stone-300 text-[10px] font-semibold px-2.5 py-1 rounded transition-colors shadow-sm focus:outline-none">
																Reject
															</button>
														</div>
													)}
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
