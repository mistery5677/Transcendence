import { Outlet } from "react-router-dom";
import { useState } from "react";

import {
  Footer,
  ForgotPassword,
  Login,
  NavBar,
  Signup,
} from "../../../components";

import { FloatingChatContainer } from "../../../components/Chat/FloatingChatContainer";

type ActivateModal = "signup" | "login" | "forgot" | null;

export function AppLayout() {
  const [activeModal, setActiveModal] =
    useState<ActivateModal>(null);

  return (
    <>
      <NavBar onModal={setActiveModal} />

      {activeModal === "signup" && (
        <Signup onModal={setActiveModal} />
      )}

      {activeModal === "login" && (
        <Login onModal={setActiveModal} />
      )}

      {activeModal === "forgot" && (
        <ForgotPassword onModal={setActiveModal} />
      )}

      <Outlet />

      <FloatingChatContainer />

      <Footer />
    </>
  );
}