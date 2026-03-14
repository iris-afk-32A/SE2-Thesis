import React, { useState, useEffect } from "react";
import Logo from "@/assets/images/slanted_logo.png";
import Logo2 from "@/assets/images/slanted_logo2.png";

export default function LoadingPage() {
  return (
    <div className="w-screen h-screen font-montserrat bg-[#E4E3E1] p-10 flex items-end justify-center overflow-hidden">
      <div className="absolute left-[7vw] bottom-[5vw] flex flex-row gap-4 items-center">
        <span class="loader"></span>
        <h1 className="font-montserrat font-bold text-[#858585] text-title">
          Intelligent Room Interaction System
        </h1>
      </div>
      <div className="relative w-3/4 h-screen group left-[22vw]">
        <img
          src={Logo}
          alt="Logo"
          className="w-full absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100 group-hover:opacity-0"
        />
        <img
          src={Logo2}
          alt="Logo2"
          className="w-full absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100"
        />
      </div>
    </div>
  );
}
