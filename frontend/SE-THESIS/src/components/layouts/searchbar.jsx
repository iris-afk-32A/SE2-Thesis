import React from "react";
import User from "@/assets/icons/user.png";
import Search from "@/assets/icons/search.png";

export default function SearchBar() {
  return (
    <div className="w-full h-16 flex flex-row shadow-outside-dropshadow-small items-center justify-between bg-transparent px-4 ">
      <h1 className="text-subtitle text-[#1E1E1E] opacity-75 font-bold">
        Intelligent Room Interaction System
      </h1>
      <div className="flex flex-row w-[50%] h-full items-center justify-end gap-4">
        <div className="w-[70%] h-[70%] bg-[#E4E3E1] text-subtitle rounded-3xl shadow-inside-dropshadow-small flex items-center px-4">
          <img src={Search} alt="Logo" className="w-5 h-5 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-[#1e1e1e] font-light text-subtitle outline-none"
          />
        </div>
        <button className="w-10 aspect-square rounded-full shadow-outside-dropshadow-small flex items-center justify-center bg-[#A1A2A6] cursor-pointer hover:bg-[#b1b1b1] hover:scale-105 transition-transform duration-300">
          <img src={User} alt="Logo" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
