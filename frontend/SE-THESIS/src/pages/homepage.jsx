import { useEffect, useState } from "react";
import Logo from "@/assets/images/slanted_logo.png";
import Logo2 from "@/assets/images/slanted_logo2.png";
import { getHomeMessage, getPeopleCount } from "../api/home.api.js";
import GrayButton from "../components/common/grayButton.jsx";
import { useNavigate } from "react-router-dom";

import SlideRight from "../components/animations/slideRight.jsx";
import SlideLeft from "../components/animations/slideLeft.jsx";

import Bulb from "@/assets/icons/bulb.png";
import Target from "@/assets/icons/target.png";
import Copy from "@/assets/icons/copy.png";

export default function HomePage() {
  const [message, setMessage] = useState("Offline");
  const image = "/sample.jpg";
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const detectImage = () => {
    getPeopleCount().then((data) => {
      setData(data);
      console.log("IMAGE DETECTED:", data);
    });
  };

  return (
    <div className="w-screen h-screen font-montserrat bg-[#E4E3E1] p-10 flex items-end justify-center overflow-hidden relative">
      <SlideRight>
        <section className="absolute w-[30%] h-fit flex flex-row gap-6 top-[2vw] left-[3vw]">
          <div className="flex flex-col gap-6 secondary-text">
            <div className="w-28 aspect-square bg-[#ABAAA9] flex flex-col p-4 items-start justify-between rounded-2xl shadow-inner-neumorphic hover:scale-105 hover:bg-[#b1b1b1] transition-transform duration-300 cursor-pointer">
              <img src={Bulb} alt="Bulb Icon" className="w-9 aspect-square" />
              <p className="text-subtitle">Smart</p>
            </div>
            <div className="w-28 aspect-square bg-[#ABAAA9] flex flex-col p-4 items-start justify-between rounded-2xl shadow-inner-neumorphic hover:scale-105 hover:bg-[#b1b1b1] transition-transform duration-300 cursor-pointer">
              <img src={Target} alt="Bulb Icon" className="w-9 aspect-square" />
              <p className="text-subtitle">Detect</p>
            </div>
            <div className="w-28 aspect-square bg-[#ABAAA9] flex flex-col p-4 items-start justify-between rounded-2xl shadow-inner-neumorphic hover:scale-105 hover:bg-[#b1b1b1] transition-transform duration-300 cursor-pointer">
              <img src={Copy} alt="Bulb Icon" className="w-9 aspect-square" />
              <p className="text-subtitle">Adapt</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 justify-between">
            <div className="w-5 aspect-square rounded-full bg-[#C8C8C8]"></div>
            <div className="w-5 aspect-square rounded-full bg-[#C8C8C8]"></div>
            <div className="w-5 aspect-square rounded-full bg-[#C8C8C8]"></div>
            <div className="absolute self-center w-[0.1rem] h-full bg-[#C8C8C8]"></div>
          </div>

          <div className="flex flex-col gap-6 font-bold justify-between text-subheader primary-text">
            <p>01</p>
            <p>02</p>
            <p>03</p>
          </div>
        </section>
      </SlideRight>

      <section className="relative w-3/4 h-screen group left-[22vw]">
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
      </section>

      <SlideLeft selector=".text-stagger" stagger={0.3}>
        <section className="w-[30%] h-[15vh] flex flex-col items-end primary-text absolute top-[2vw] right-[3vw]">
          <h1 className="text-title w-fit text-stagger font-montserrat font-bold">
            Intelligent Room Interaction System
          </h1>
          <p className="text-subtitle text-stagger font-medium">
            Adapted Spaces for Learning
          </p>
        </section>
      </SlideLeft>

      <SlideRight selector=".stagger-box" stagger={0.2}>
        <section className="font-montserrat absolute flex flex-col gap-10 left-[5vw] bottom-[5vw] primary-text">
          <h1 className="text-header stagger-box font-bold w-fit leading-tight">
            Awareness-Driven
            <br />
            Energy Control
          </h1>
          <div className="stagger-box">
            <GrayButton
              onClick={() => navigate("/iris/login")}
              buttonText="Get Started"
            />
          </div>
        </section>
      </SlideRight>
    </div>
  );
}
