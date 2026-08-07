import { Outlet } from "react-router-dom";
import { useState } from "react";

import {
  Footer,
  ForgotPassword,
  Login,
  NavBar,
  Signup,
  CheckEmail,
  ResetPassword
} from "../../../components";

import { FloatingChatContainer } from "../../../components/Chat/FloatingChatContainer";

type ActivateModal = "signup" | "login" | "forgot" | "checkEmail" | "resetPassword" | null;

export function AppLayout() {
  const getTokenFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") ?? "";
  };

  const [activeModal, setActiveModal] = useState<ActivateModal>(() => {
    const token = getTokenFromUrl();
    return token ? "resetPassword" : null;
  });

  const [resetEmail, setResetEmail] = useState("");
  const [resetToken] = useState(getTokenFromUrl);

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
        <ForgotPassword onModal={setActiveModal} setResetEmail={setResetEmail} />
      )}

      {activeModal === "checkEmail" && (
        <CheckEmail
          email={resetEmail}
          onModal={setActiveModal}
          />
      )}

      {activeModal === "resetPassword" && (
        <ResetPassword
          onModal={setActiveModal}
          token={resetToken}
        />
      )}

      <Outlet />

      <FloatingChatContainer />

      <Footer />
    </>
  );
}