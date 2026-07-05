import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RouterPaths } from "./RouterPath";
import { Error, Home, Settings, Ze, LeaderBoards, Friends, HistoryPage } from "../../pages";
import { FallBack, Login, Signup, MultiRoute, NavBar } from "../../components";
import { useAuth } from "../../contexts/UserContext";
import { GameProvider } from "../../contexts/GameContext/GameContext";
import { Play } from "../../pages/Play/Play";
import { GlobalSocketProvider } from "../../contexts/GlobalSocketContext/GlobalSocketContext";
import { Rules } from "../../pages/Rules/Rules.tsx";
import { ChatProvider } from "../../contexts/ChatContext/ChatContext.tsx";
import { FloatingChatContainer } from "../../components/Chat/FloatingChatContainer.tsx";
import { NotificationProvider } from "../../contexts/NotificationContext/NotificationContext.tsx";
import { ProfilePage } from "../../pages/Profile/ProfilePage.tsx";

type ActivateModal = "signup" | "login" | null;

function PlayRouteWithProvider() {
	return (
		<GameProvider>
			<Play />
		</GameProvider>
	);
}

export function MainRouter() {
	const { state } = useAuth();

	const [activeModal, setActiveModal] = useState<ActivateModal>(null);

	if (state.isLoading) {
		return (
			<div>
				<FallBack />
			</div>
		);
	}

	return (
		<BrowserRouter>
			<GlobalSocketProvider>
				<NotificationProvider>
					<ChatProvider>
						<NavBar onModal={setActiveModal} />

						{activeModal === "signup" && <Signup onModal={setActiveModal} />}
						{activeModal === "login" && <Login onModal={setActiveModal} />}
						<Routes>
							{MultiRoute(RouterPaths.HOME, <Home />)}
							<Route
								path={RouterPaths.ERROR}
								element={<Error />}
							/>
							<Route
								path={RouterPaths.ZE}
								element={<Ze />}
							/>
							{state.user && (
								<Route
									path={RouterPaths.PLAY}
									element={<PlayRouteWithProvider />}
								/>
							)}
							{!state.user && activeModal === "login" && (
								<Route
									path={RouterPaths.PLAY}
									element={<Login onModal={setActiveModal} />}
								/>
							)}
							{/* Path for the rules*/}
							<Route
								path={RouterPaths.RULES}
								element={<Rules />}
							/>
							{/* Path for the leaderboard*/}
							<Route
								path={RouterPaths.LEADERBOARDS}
								element={<LeaderBoards />}
							/>
							{/* Path for your own history*/}
							<Route
								path={RouterPaths.HISTORY}
								element={<HistoryPage />}
							/>
							{/* Dynamic route for other players, for example with Leaderboards or friend requests */}
							<Route
								path={`${RouterPaths.HISTORY}/:username`}
								element={<HistoryPage />}
							/>
							<Route
								path={`${RouterPaths.PROFILE}/:username`}
								element={<ProfilePage />}
							/>

							{state.user && (
								<Route
									path={RouterPaths.FRIENDS}
									element={<Friends />}
								/>
							)}
							{state.user && (
								<Route
									path={RouterPaths.SETTINGS}
									element={<Settings tabOpt={"profile"} />}></Route>
							)}
						</Routes>
						<FloatingChatContainer />
					</ChatProvider>
				</NotificationProvider>
			</GlobalSocketProvider>
		</BrowserRouter>
	);
}
