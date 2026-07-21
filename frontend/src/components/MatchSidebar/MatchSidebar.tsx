import { useState } from "react";
import { Chat } from "../Chat/Chat";
import { MatchSidebarButton } from "./MatchSidebarButton/MatchSidebarButton";
import { GameSettings } from "./GameSettings/GameSettings";
import { PlayOptions } from "./PlayOptions/PlayOptions";
import { Actions } from "./Actions/Actions";
import { SurrenderButton } from "./SurrenderButton/SurrenderButton";
import { useGame } from "../../contexts/GameContext/GameContext";
import { OfferDrawButton } from "./OfferDrawButton/OfferDrawButton";
import { GameSettingsButton } from "./GameSettingsButton/GameSettingsButton";

export type currentTabOpt = "chat" | "actions" | "settings" | "playOptions" | null;

type Menu = {
	currentTab: currentTabOpt;
	isOpen: boolean;
};

export function MatchSidebar() {
	const [menu, setMenu] = useState<Menu>({ currentTab: null, isOpen: false });
	const { surrender, proposeDraw, gameId, gameOver, mode } = useGame();

	const toggleMenu = (value: currentTabOpt) => {
		setMenu((prev) => ({
			currentTab: value,
			isOpen: prev.currentTab !== value ? true : !prev.isOpen,
		}));
		console.log(menu.currentTab);
	};
	const dontShowOfferDrawButton = mode === "ai" || mode === "bot" || Boolean(gameOver) || !gameId;

	return (
		<div
			className="flex flex-col bg-sidebar-bg text-stone-200 rounded-xl shadow-md border
		 border-stone-700 overflow-hidden h-full min-h-100 sm:min-h-125 xl:min-h-0 w-full">
			<header className="w-full p-5 sm:p-6 bg-stone-800 border-b border-stone-700 shrink-0">
				<p className="mb-3 text-xs font-semibold tracking-[0.18em] uppercase text-stone-400">Match controls</p>
				<div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
					<MatchSidebarButton
						onClick={() => toggleMenu("chat")}
						className="flex-1 text-sm sm:text-base md:text-lg">
						Chat
					</MatchSidebarButton>
					<MatchSidebarButton
						onClick={() => toggleMenu("actions")}
						className="flex-1 text-sm sm:text-base md:text-lg">
						Actions
					</MatchSidebarButton>
					<MatchSidebarButton
						variant="playNow"
						className="text-sm sm:text-base md:text-lg whitespace-nowrap"
						onClick={() => toggleMenu("playOptions")}>
						PLAY NOW
					</MatchSidebarButton>
				</div>
			</header>

			{/* Middle Section */}
			<section
				className={`flex-1 flex flex-col min-h-0 overflow-y-auto scroll ${menu.isOpen ? "flex" : "hidden"}`}>
				<div className={menu.currentTab === "chat" ? "block h-full flex-1" : "hidden"}>
					<Chat classname="h-full flex-1" />
				</div>
				{menu.currentTab === "settings" && <GameSettings />}
				{menu.currentTab === "playOptions" && <PlayOptions />}
				<div className={menu.currentTab === "actions" ? "block h-full flex-1" : "hidden"}>
					<div className="flex flex-col gap-4 p-4">
						<p className="text-sm sm:text-base md:text-lg text-stone-400">Actions</p>
						<Actions />
					</div>
				</div>
			</section>

			{/* Bottom Section */}
			<section className="mt-auto w-full p-5 bg-sidebar-bg border-t border-stone-700/60 shrink-0">
				<div className="grid grid-cols-3 gap-3 w-full h-14">
					{/* Surrender Button (Left) */}
					{gameId && !Boolean(gameOver) && <SurrenderButton onSurrender={surrender} />}

					{/* Settings Button */}
					<div className="col-2">
						<GameSettingsButton toggleMenu={toggleMenu} />
					</div>

					{/* Offer Draw Button (Right) */}
					{!dontShowOfferDrawButton && <OfferDrawButton onOfferDraw={proposeDraw} />}
				</div>
			</section>
		</div>
	);
}
