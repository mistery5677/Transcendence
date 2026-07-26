import { IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/auth";
import { useEffect, useState } from "react";
import { NotificationBell } from "../NotificationBell/NotificationBell";
const navigation = [
	{ name: "Login", href: "/login", current: false },
	{ name: "Register", href: "/signup", current: false },
	{ name: "Play", href: "/play", current: false },
	{ name: "LeaderBoards", href: "/leaderboards", current: false },
	{ name: "Friends", href: "/friends", current: false },
];

function classNames(...classes: (string | undefined | false)[]): string {
	return classes.filter(Boolean).join(" ");
}

type NavBarProps = {
	onModal: (modal: "signup" | "login" | null) => void;
};

export function NavBar({ onModal }: NavBarProps) {
	const { state, logout } = useAuth();
	const navigate = useNavigate();
	const [avatarUrlKey, setAvatarUrlKey] = useState(Date.now());

	useEffect(() => {
		if (state.user) {
			setAvatarUrlKey(Date.now());
		}
	}, [state.user, state.user?.avatarUrl]);

	const handleLogout = async () => {
		console.log("POST Logout");

		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.log(err);
		}
	};

	const handleLoginClick = () => {
		if (state.user) {
			navigate("/play");
		} else {
			onModal("login");
		}
	};

	const avatarSrc = state.user?.avatarUrl ? `${state.user.avatarUrl}?t=${avatarUrlKey}` : undefined; // -> /api/assets/avatars/default1.png
	const isLoggedIn = !!state.user;

	return (
		<Disclosure
			as="nav"
			className={classNames(
				"relative z-50 bg-linear-to-r from-stone-900/90 via-stone-900/90 to-stone-900/90 backdrop-blur-md shadow-[0_8px_24px_-16px_rgba(0,0,0,0.8)] border-b border-emerald-300/15",
			)}>
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
				<div className="relative flex h-18 items-center justify-between">
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						{/* Mobile menu button*/}
						<DisclosureButton className="group relative inline-flex items-center justify-center rounded-xl p-2 text-stone-300 hover:bg-emerald-400/12 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
							<span className="absolute -inset-0.5" />
							<span className="sr-only">Open main menu</span>
							<Bars3Icon
								aria-hidden="true"
								className="block size-6 group-data-open:hidden"
							/>
							<XMarkIcon
								aria-hidden="true"
								className="hidden size-6 group-data-open:block"
							/>
						</DisclosureButton>
					</div>
					<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
						<a
							href="/"
							className="flex items-center group transition-transform hover:scale-105 active:scale-95 duration-200">
							<div className="flex shrink-0 items-center select-none text-stone-200 bg-stone-900/80 rounded-xl p-2 border border-stone-700">
								<span className="text-4xl leading-none">♞</span>
							</div>
							<span className="ml-3 font-semibold tracking-tight text-xl text-stone-100 hidden sm:block">
								42 <span className="text-button-green">Transcendence</span>
							</span>
						</a>

						<div className="hidden sm:ml-auto sm:flex sm:items-center">
							<a
								href="/rules"
								className="mr-4 text-stone-300 hover:text-emerald-200 hover:bg-emerald-400/10 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200">
								Rules
							</a>
							<a
								href="/leaderboards"
								className="mr-4 text-stone-300 hover:text-emerald-200 hover:bg-emerald-400/10 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200">
								Leaderboards
							</a>
							<div className="flex items-center rounded-full bg-stone-900/40 border border-emerald-300/10 p-1.5 overflow-visible">
								<div
									className={classNames(
										"flex items-center gap-2 overflow-hidden transition-[max-width,opacity,transform,margin] duration-500 ease-out",
										isLoggedIn
											? "max-w-0 opacity-0 -translate-x-5 scale-95 pointer-events-none mr-0"
											: "max-w-80 opacity-100 translate-x-0 scale-100 mr-2",
									)}>
									<button
										type="button"
										onClick={() => onModal("login")}
										className="text-stone-300 hover:text-stone-100 hover:bg-stone-800/70 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 border border-transparent hover:border-stone-600/60 whitespace-nowrap">
										Login
									</button>

									<button
										type="button"
										onClick={() => onModal("signup")}
										className="text-emerald-100 bg-emerald-500/18 hover:bg-emerald-500/28 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 border border-emerald-300/35 hover:border-emerald-300/55 whitespace-nowrap">
										Register
									</button>
								</div>

								<button
									type="button"
									onClick={handleLoginClick}
									className="block rounded-2xl border border-button-green bg-button-green px-6 py-2 text-sm tracking-wide text-white font-extrabold shadow-button-green transition-all duration-200 hover:from-lime-200 hover:to-emerald-200 hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900">
									Play
								</button>
							</div>
						</div>
					</div>
					<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
						{state.user && <NotificationBell />}

						{/* Profile dropdown or Button */}
						{state.user ? (
							<Menu
								as="div"
								className="relative ml-4">
								<MenuButton
									disabled={!state.user}
									className="relative flex rounded-full ring-2 ring-emerald-300/40 hover:ring-emerald-300/70 transition-all duration-200 focus:outline-none focus:ring-emerald-400 hover:scale-[1.03] active:scale-95 shadow-sm">
									<span className="absolute -inset-1.5" />
									<span className="sr-only">Open user menu</span>
									{avatarSrc ? (
										<img
											src={avatarSrc}
											alt="avatar"
											className="size-10 rounded-full object-fit"
										/>
									) : (
										<IconUser
											className="max-w-7 max-h-7"
											size={40}
											color="white"
										/>
									)}
								</MenuButton>
								<MenuItems
									transition
									className="absolute right-0 z-10 mt-3 w-56 origin-top-right rounded-2xl bg-stone-900/95 py-2 border border-emerald-300/20 shadow-[0_12px_36px_-14px_rgba(0,0,0,0.8)] transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
									<MenuItem>
										<a
											href="/friends"
											className="block px-4 py-2.5 text-sm font-medium text-stone-300 hover:bg-emerald-400/12 hover:text-stone-100 transition-colors">
											Friends
										</a>
									</MenuItem>

									<MenuItem>
										<a
											href="/live-games"
											className="block px-4 py-2.5 text-sm font-medium text-stone-300 hover:bg-emerald-400/12 hover:text-stone-100 transition-colors">
											Live Games
										</a>
									</MenuItem>

									<MenuItem>
										<a
											href="/settings"
											className="block px-4 py-2.5 text-sm font-medium text-stone-300 hover:bg-emerald-400/12 hover:text-stone-100 transition-colors">
											Settings
										</a>
									</MenuItem>
									<MenuItem>
										<a
											href={`/history/${state.user.username}`}
											className="block px-4 py-2.5 text-sm font-medium text-stone-300 hover:bg-emerald-400/12 hover:text-stone-100 transition-colors">
											History
										</a>
									</MenuItem>
									<MenuItem>
										<button
											onClick={handleLogout}
											className="block w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
											Sign out
										</button>
									</MenuItem>
								</MenuItems>
							</Menu>
						) : (
							<button
								className="text-white relative ml-4 mr-2"
								type="button"
								onClick={() => onModal("login")}>
								<IconUser
									className="max-w-7 max-h-7 "
									size={40}
									color="white"
								/>
							</button>
						)}
					</div>
				</div>
			</div>

			<DisclosurePanel className="sm:hidden border-t border-emerald-300/15 bg-stone-950/95">
				<div className="space-y-2 px-4 pt-3 pb-4">
					{navigation.map((item) => {
						if (state.user && (item.name === "Login" || item.name === "Register")) return null;
						if (item.name === "Login" || item.name === "Register") {
							return (
								<DisclosureButton
									key={item.name}
									onClick={item.name === "Login" ? () => onModal("login") : () => onModal("signup")}
									aria-current={item.current ? "page" : undefined}
									className={classNames(
										item.current
											? "bg-emerald-400/15 text-stone-100"
											: "text-stone-300 hover:bg-emerald-400/12 hover:text-stone-100",
										"block rounded-xl px-4 py-3 text-base font-bold transition-all",
									)}>
									{item.name}
								</DisclosureButton>
							);
						}
						return (
							<DisclosureButton
								key={item.name}
								as="a"
								href={item.href}
								aria-current={item.current ? "page" : undefined}
								className={classNames(
									item.current
										? "bg-emerald-400/15 text-stone-100"
										: "text-stone-300 hover:bg-emerald-400/12 hover:text-stone-100",
									"block rounded-xl px-4 py-3 text-base font-bold transition-all",
								)}>
								{item.name}
							</DisclosureButton>
						);
					})}
				</div>
			</DisclosurePanel>
		</Disclosure>
	);
}
