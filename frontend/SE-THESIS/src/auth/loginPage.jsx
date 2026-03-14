// !Libraries
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
// !Componenets
import { loginUser } from "../services/authService";
import SlideUp from "../components/animations/slideUp";
// !Assets
import { CircleAlert } from 'lucide-react'
import { Toaster } from "../components/ui/sonner.js";
import { toast } from "sonner";
import Logo from "@/assets/icons/logo.png";


// TODO: Comments sa functions
// TODO: QA this login form
// TODO: Fix the UI and responsiveness (breh) ╮(╯∀╰)╭

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const email = watch("email");
  const password = watch("password");
  const isDisabled = !email || !password;

  const onError = (errors) => {
    if (errors.email) {
      toast.error(errors.email.message);
    }
    if (errors.password) {
      toast.error(errors.password.message);
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await loginUser({
        email: data.email,
        password: data.password,
      });

      alert(res.message);
      localStorage.setItem("token", res.token);
      navigate("/iris/home")

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };
  return (
    <div className="w-screen h-screen font-montserrat flex-col gap-9 bg-[#E4E3E1] p-10 flex items-center justify-center overflow-hidden">
      <SlideUp duration={0.7}>

        {/* LOGIN SECTION */}
        <section className="w-[40%] h-fit bg-[#DFDEDA] flex flex-col p-12 gap-9 items-center rounded-4xl shadow-outside-dropshadow">
          <h1 className="primary-text font-bold">Login to your account</h1>
          <div className="w-[90%] py-5 px-5 border border-[#A1A2A6] rounded-3xl flex flex-row items-center justify-center gap-2 ">
            <CircleAlert size={30} className="text-red-400"/>
            <p>The login information is incorrect. Ensure that you enter your email and password</p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className=" w-full flex flex-col items-center gap-5"
          >
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-[90%] bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle"
              type="email"
              placeholder="Email Address"
            />

            <input
              {...register("password", {
                required: "Enter your password",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-[90%] bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle"
              type="password"
              placeholder="Password"
            />
            <button
              type="submit"
              disabled={isDisabled || isSubmitting}
              className={`w-[90%] bg-[#A1A2A6] text-subtitle text-[#E4E3E1] shadow-outside-dropshadow py-4 rounded-3xl  ${isDisabled ? "opacity-70 transition-opacity duration-300 cursor-not-allowed" : "cursor-pointer hover:bg-[#8A8B8E] transition-all duration-300"}`}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <button
            onClick={() => navigate("/iris/signup")}
            className="primary-text hover:text-[#a9a9a9] cursor-pointer"
          >
            Don't Have an Account?
          </button>

        </section>
      </SlideUp>
      

      <section className="absolute bottom-[2vw] flex flex-col items-center gap-2">
        <img src={Logo} alt="Logo" />
        <p className="primary-text text-subtitle font-bold">
          Intelligent Room interaction System
        </p>
      </section>

      <Toaster richColors expand position="top-center" />
    </div>
  );
}
