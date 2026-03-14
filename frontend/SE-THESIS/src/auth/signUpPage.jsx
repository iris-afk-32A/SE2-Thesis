import { useState } from "react";
import Logo from "@/assets/icons/logo.png";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useForm } from "react-hook-form";

import SlideUp from "../components/animations/slideUp";

//*  Okay so huge update dito sa Signup page. I converted the validation form to react-hook-form. So all validations are done in that process
//* instead of manually declaring function for each field. Also shortends the code by at least 30%.

//TODO: Update the UI design
//TODO: Add toasters for notification
//TODO: Proper page routing

export default function SignUpPage() {
  //* These are the function of react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  //* Watches the password form real-time for validatin
  const passwordValue = watch("password", "");

  //* Well, self explanatory. Sends the formdata to the auth service to express backend
  const onSubmit = async (data) => {
    try {
      const res = await registerUser({
        first_name: data.username,
        last_name: "User",
        email: data.email,
        password: data.password,
      });

      alert(res.message);
      // navigate("/iris/login");
    } catch (error) {
      alert(
        error.response?.data?.message || error.message || "Registration failed",
      );
      console.error(error);
    }
  };

  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen font-montserrat flex-col gap-9 bg-[#E4E3E1] p-10 flex items-center justify-center overflow-hidden">
      <SlideUp duration={0.7}>

        {/* SIGN UP SECTION */}
        <section className="mb-[5%] w-[40%] h-fit bg-[#DFDEDA] flex flex-col p-12 gap-9 items-center rounded-4xl shadow-outside-dropshadow">
          <h1 className="primary-text font-bold">Sign Up</h1>
          <form
            //! Wraps submit to onSubmit function ng react-hook-form, then automatically runs all the validation rules
            onSubmit={handleSubmit(onSubmit)}
            className=" w-full flex flex-col items-center gap-5"
          >
            {/* //! Uses the register field ng react-hook-form. Then a parameter required is added with the error message */}
            <input
              {...register("username", { required: "Username is required" })}
              className="w-[90%] bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle"
              placeholder="Username"
            />
            {/* //! Yung error field ng react-hook-form. So its basically see if there is error sa username field */}
            {errors.username && (
              <p className="text-red-500">{errors.username.message}</p>
            )}

            {/* //! Now all these input fields follow the same patter with some having extra parameters */}

            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email",
                },
              })}
              className="w-[90%] bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle"
              type="email"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-[90%] bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle"
              type="password"
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
            <input
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (val) =>
                  val === passwordValue || "Passwords do not match",
              })}
              className="w-[90%] bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle"
              type="password"
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500">{errors.confirmPassword.message}</p>
            )}
            {/* //! This uses the formState na isSubmitting then base on that state, updates the button itself */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-[90%] bg-[#A1A2A6] text-subtitle text-[#E4E3E1] shadow-outside-dropshadow py-4 rounded-3xl cursor-pointer hover:bg-[#8A8B8E] transition-colors duration-300"
            >
              {isSubmitting ? "Registering..." : "Sign Up"}
            </button>
          </form>

          <button
            onClick={() => navigate("/iris/login")}
            className="primary-text hover:text-[#a9a9a9] cursor-pointer"
          >
            Already Have an Account?
          </button>
        </section>

      
      </SlideUp>

      <SlideUp>
        <section className="absolute bottom-[2vw] flex flex-col items-center gap-2">
          <img src={Logo} alt="Logo" />
          <p className="primary-text text-subtitle font-bold">
            Intelligent Room interaction System
          </p>
        </section>
      </SlideUp>
    </div>
  );
}
