import React from "react";
import { Outlet } from "react-router-dom";
import GlobalChatBot from "./chat/GlobalChatBot";

const RootLayout = () => {
  return (
    <>
      <Outlet />
      <GlobalChatBot />
    </>
  );
};

export default RootLayout;
