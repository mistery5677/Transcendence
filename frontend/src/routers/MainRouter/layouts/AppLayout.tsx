import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

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
  const [activeModal, setActiveModal] =
    useState<ActivateModal>(null);

  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");

    if(token)
    {
      setResetToken(token);
      setActiveModal("resetPassword");
    }

  }, []);


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