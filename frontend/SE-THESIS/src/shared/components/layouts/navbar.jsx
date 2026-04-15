import React, { useState } from "react";
import Logo from "@/assets/icons/logo_w.png";
import Dashboard from "@/assets/icons/home.png";
import Room from "@/assets/icons/dashboard.png";
import Activity from "@/assets/icons/activity.png";
import Notif from "@/assets/icons/notif.png";
import Dev from "@/assets/icons/dev.png";
import Organization from "@/assets/icons/orgGroup.png";
import Ex from "@/assets/icons/ex.png";
import ExW from "@/assets/icons/Ex_w.png";

import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { useRooms } from "../../../context/roomContext";
import { useCamera } from "../../../context/cameraContext.jsx";
import { socket } from "../../services/socketService";
import { toast } from "sonner";
import Dialog from "@mui/material/Dialog";
import SlideRight from "../animations/slideRight";

export default function Navbar() {
  const navigate = useNavigate();
  const { resetRooms } = useRooms();
  const { logout, user } = useAuth();
  const { stopAllCameras } = useCamera();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      logout();
      resetRooms();
      stopAllCameras();
      setLogoutDialogOpen(false);
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <SlideRight>
        <div className="flex flex-col w-full h-full bg-[#A1A2A6] justify-between shadow-outside-dropshadow rounded-2xl p-4 gap-6">
          <div>
            <img src={Logo} alt="Logo" className="w-full" />
          </div>
          <SlideRight selector=".stagger" stagger={0.2} duration={0.5}>
            <div className="relative flex flex-col gap-5">
              <button
                onClick={() => navigate("/iris/home")}
                className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
              >
                <img src={Dashboard} alt="Home" />
              </button>

              <button
                onClick={() => navigate("/iris/room_management")}
                className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
              >
                <img src={Room} alt="Dashboard" />
              </button>

              <button
                onClick={() => navigate("/iris/activity")}
                className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
              >
                <img src={Activity} alt="Activity" />
              </button>

              <button
                onClick={() => navigate("/iris/notifications")}
                className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
              >
                <img src={Notif} alt="Notifications" />
              </button>
              
              {(user?.is_admin || user?.is_authorized) && (
                <button
                  onClick={() => navigate("/iris/organization")}
                  className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
                >
                  <img src={Organization} alt="Organization" />
                </button>
              )}

              <button
                onClick={() => navigate("/iris/development")}
                className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
              >
                <img src={Dev} alt="Notifications" />
              </button>
            </div>
          </SlideRight>
          <button
            onClick={handleLogoutClick}
            className="w-full aspect-square bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
          >
            <img src={Ex} alt="Logout" />
          </button>
        </div>
      </SlideRight>
      
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            backgroundColor: "#DFDEDA",
            borderRadius: "15px",
          },
        }}
      >
        <div className="w-96 rounded-lg flex flex-col gap-4 p-5 bg-[#DFDEDA] items-center">
          <div className="w-27 h-27 rounded-full bg-[#A7A7A4] flex items-center justify-center shadow-inner-neumorphic text-[#E4E3E1] font-bold text-7xl">
            <img src={ExW} alt="Logout" className="w-16 h-16" />
          </div>
          <h2 className="text-lg font-bold text-[#4F4F4F] items-center justify-center flex gap-2">
            Logout
          </h2>
          <p className="text-base text-[#4F4F4F] text-center">
            Are you sure you want to logout?
          </p>
          <div className="flex flex-row gap-3 justify-center">
            <button
              onClick={handleLogoutCancel}
              disabled={isLoggingOut}
              className="px-6 py-2 w-35 bg-[#DFDEDA] text-[#A1A2A6] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#d4d3d1] transition-colors duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
              className="px-6 py-2 w-35 bg-[#A1A2A6] text-[#DFDEDA] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
