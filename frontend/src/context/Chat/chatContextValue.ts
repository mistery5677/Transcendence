import { createContext } from "react";
import type { ChatContextType } from "./ChatContextType";

export const ChatContext = createContext<ChatContextType | undefined>(undefined);
