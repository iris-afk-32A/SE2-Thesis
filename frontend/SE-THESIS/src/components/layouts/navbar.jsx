import React from "react";
import Logo from "@/assets/icons/logo_w.png";
import Home from "@/assets/icons/home.png";
import Dashboard from "@/assets/icons/dashboard.png";
import Activity from "@/assets/icons/activity.png";
import Notif from "@/assets/icons/notif.png";
import Dev from "@/assets/icons/dev.png";
import Ex from "@/assets/icons/ex.png";

import { useNavigate } from "react-router-dom";

import SlideRight from "../animations/slideRight";

export default function Navbar() {
  const navigate = useNavigate();
  return (
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
              <img src={Home} alt="Home" />
            </button>

            <button
              onClick={() => navigate("/iris/analytics")}
              className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
            >
              <img src={Dashboard} alt="Dashboard" />
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

            <button
              onClick={() => navigate("/iris/development")}
              className="w-full aspect-square stagger bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
            >
              <img src={Dev} alt="Notifications" />
            </button>
          </div>
        </SlideRight>
        <button
          onClick={() => navigate("/iris")}
          className="w-full aspect-square bg-[#E4E3E1] rounded-full flex items-center shadow-outside-dropshadow-small justify-center cursor-pointer hover:scale-102 hover:bg-[#d4d3d1] transition-transform duration-300 tooltip"
        >
          <img src={Ex} alt="Notifications" />
        </button>
      </div>
    </SlideRight>
  );
}
