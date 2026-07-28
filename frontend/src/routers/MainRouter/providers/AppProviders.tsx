import { ReactNode } from "react";

import { GlobalSocketProvider } from "../../../context/GlobalSocket/GlobalSocketContext";
import { MatchMakingProvider } from "../../../context/MatchMaking/MatchMakingContext";
import { NotificationProvider } from "../../../context/NotificationContext/NotificationContext";
import { ChatProvider } from "../../../context/Chat/ChatContext";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GlobalSocketProvider>
      <MatchMakingProvider>
        <NotificationProvider>
          <ChatProvider>{children}</ChatProvider>
        </NotificationProvider>
      </MatchMakingProvider>
    </GlobalSocketProvider>
  );
}