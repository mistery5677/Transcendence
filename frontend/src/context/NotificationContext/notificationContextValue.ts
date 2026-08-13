import { createContext } from "react";
import type { NotificationContextType } from "./notificationTypes";

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
