import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { RouterPaths } from "./RouterPath";
import {
  Error,
  Home,
  Settings,
  Ze,
  LeaderBoards,
  Friends,
  HistoryPage,
  Privacy,
  Terms,
} from "../../pages";
import { FallBack, Login, Signup, MultiRoute, NavBar, Footer, ForgotPassword } from "../../components";
import { useAuth } from "../../context/auth/index.ts";
import { GameProvider } from "../../context/Game/GameContext.tsx";
import { Play } from "../../pages/Play/Play";
import { GlobalSocketProvider } from "../../context/GlobalSocket/GlobalSocketContext.tsx";
import { Rules } from "../../pages/Rules/Rules.tsx";
import { ChatProvider } from "../../context/Chat/ChatContext.tsx";
import { FloatingChatContainer } from "../../components/Chat/FloatingChatContainer.tsx";
import { NotificationProvider } from "../../context/NotificationContext/NotificationContext.tsx";
import { ProfilePage } from "../../pages/Profile/ProfilePage.tsx";
import { LiveGames } from "../../pages/LiveGames/LiveGames";
import { MatchMakingProvider } from "../../context/MatchMaking/MatchMakingContext.tsx";

type ActivateModal = "signup" | "login" | "forgot" | null;

function GameProviderLayout() {
  return (
    <GameProvider>
      <Outlet />
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
        <MatchMakingProvider>
          <NotificationProvider>
            <ChatProvider>
              <NavBar onModal={setActiveModal} />
              {activeModal === "signup" && <Signup onModal={setActiveModal} />}
              {activeModal === "login" && <Login onModal={setActiveModal} />}
              {activeModal === "forgot" && <ForgotPassword onModal={setActiveModal} />}
              <Routes>
                {MultiRoute(RouterPaths.HOME, <Home />)}
                <Route path={RouterPaths.ERROR} element={<Error />} />
                <Route path={RouterPaths.ZE} element={<Ze />} />
                {state.user && (
                  <Route element={<GameProviderLayout />}>
                    <Route path={RouterPaths.PLAY} element={<Play />} />
                    <Route
                      path={RouterPaths.LIVEGAMES}
                      element={<LiveGames />}
                    />
                  </Route>
                )}
                {!state.user && activeModal === "login" && (
                  <Route
                    path={RouterPaths.PLAY}
                    element={<Login onModal={setActiveModal} />}
                  />
                )}
                
                {/* Path for the rules*/}
                <Route path={RouterPaths.RULES} element={<Rules />} />
                {/* Path for the leaderboard*/}
                <Route
                  path={RouterPaths.LEADERBOARDS}
                  element={<LeaderBoards />}
                />
                {/* Path for your own history*/}
                <Route path={RouterPaths.HISTORY} element={<HistoryPage />} />
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
                  <Route path={RouterPaths.FRIENDS} element={<Friends />} />
                )}
                {state.user && (
                  <Route
                    path={RouterPaths.SETTINGS}
                    element={<Settings tabOpt={"profile"} />}
                  ></Route>
                )}
                {/* Public legal pages (LEGAL-01, LEGAL-02) */}
                <Route path={RouterPaths.PRIVACY} element={<Privacy />} />
                <Route path={RouterPaths.TERMS} element={<Terms />} />
              </Routes>
              <FloatingChatContainer />
              <Footer />
            </ChatProvider>
          </NotificationProvider>
        </MatchMakingProvider>
      </GlobalSocketProvider>
    </BrowserRouter>
  );
}
