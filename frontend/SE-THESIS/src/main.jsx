import React from "react";
import ReactDOM from "react-dom/client";
import App from "./apps/App";
import { Toaster } from "./shared/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { ServerStatusProvider } from "./context/serverStatusContext";
import { RoomProvider } from "./context/roomContext";
import { AuthProvider } from "./context/authContext";
import { CameraProvider } from "./context/cameraContext";
import { SubjectProvider } from "./context/subjectContext";
import { ScheduleProvider } from "./context/scheduleContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ServerStatusProvider>
      <AuthProvider>
        <RoomProvider>
          <SubjectProvider>
            <ScheduleProvider>
              <CameraProvider>
                <App />
                <Toaster richColors position="bottom-right" />
              </CameraProvider>
            </ScheduleProvider>
          </SubjectProvider>
        </RoomProvider>
      </AuthProvider>
    </ServerStatusProvider>
  </BrowserRouter>,
);
