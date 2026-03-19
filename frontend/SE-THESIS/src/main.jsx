import React from "react";
import ReactDOM from "react-dom/client";
import App from "./apps/App";
import { Toaster } from "./shared/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { ServerStatusProvider } from "./context/serverStatusContext";
import { RoomProvider } from "./context/roomContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ServerStatusProvider>
      <RoomProvider>
        <App />
        <Toaster richColors position="bottom-right" />
      </RoomProvider>
    </ServerStatusProvider>
  </BrowserRouter>,
);
