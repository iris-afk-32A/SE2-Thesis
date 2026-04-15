// !Libraries
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
// !Components
import { useAuth } from "../../context/authContext.jsx";
import SlideUp from "../../shared/components/animations/slideUp.jsx";
import { useServerStatus } from "../../context/serverStatusContext.jsx";
import { handleServerDown } from "../../shared/utils/serverDownHandler.js";
import { Toaster } from "../../shared/components/ui/sonner.js";
import { socket } from "../../shared/services/socketService.js";
import { useRooms } from "../../context/roomContext.jsx";
// !Services
import { validateUserEmail } from "../../shared/services/authService.js";
import { sendOTP, verifyOTP, resetPassword } from "../../shared/services/forgotPasswordService.js";
// !Assets
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/assets/icons/logo.png";
import Dialog from "@mui/material/Dialog";

export default function LoginPage() {
  const navigate = useNavigate();
  const { fetchRooms } = useRooms();
  const { isServerUp, setIsServerUp } = useServerStatus();
  const [loginError, setLoginError] = useState("");
  const { login } = useAuth();

  // Forgot password state
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);

  // OTP state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  // Reset password state
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    resetField,
  } = useForm();

  const email = watch("email");
  const password = watch("password");
  const isDisabled = !email || !password;

  const onError = (errors) => {
    if (errors.email) toast.error(errors.email.message);
    if (errors.password) toast.error(errors.password.message);
  };

  const onSubmit = async (data) => {
    try {
      const res = await login(data.email, data.password);
      if (!res.success) {
        setLoginError(res.message);
        resetField("email");
        resetField("password");
        return;
      }
      setLoginError("");
      toast.success(res.message);
      fetchRooms();
      navigate("/iris/home");
    } catch (error) {
      if (handleServerDown(error, setIsServerUp, navigate)) return;
      const message = error.response?.data?.message || "Login failed";
      setLoginError(message);
      resetField("email");
      resetField("password");
    }
  };

  // --- Step 1: Email dialog ---
  const handleForgotPasswordClick = () => {
    setForgotPasswordDialogOpen(true);
    setForgotPasswordEmail("");
  };

  const handleForgotPasswordCancel = () => {
    setForgotPasswordDialogOpen(false);
    setForgotPasswordEmail("");
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmittingForgotPassword(true);
      await sendOTP(forgotPasswordEmail); // 👈 sends OTP and validates email in one shot
      setForgotPasswordDialogOpen(false);
      setOtpDialogOpen(true);
      setOtpInput("");
      toast.success("OTP sent! Check your email.");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSubmittingForgotPassword(false);
    }
  };

  // --- Step 2: OTP dialog ---
  const handleOtpCancel = () => {
    setOtpDialogOpen(false);
    setOtpInput("");
    setForgotPasswordDialogOpen(true); // go back to email dialog
  };

  const handleOtpConfirm = async () => {
    if (!otpInput.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setIsSubmittingOtp(true);
      await verifyOTP(forgotPasswordEmail, otpInput);
      setOtpDialogOpen(false);
      setResetPasswordDialogOpen(true); // 👈 move to reset password dialog
      setNewPassword("");
      setConfirmPassword("");
      toast.success("OTP verified!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  // --- Step 3: Reset password dialog ---
  const handleResetPasswordCancel = () => {
    setResetPasswordDialogOpen(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsSubmittingReset(true);
      await resetPassword(forgotPasswordEmail, otpInput, newPassword);
      toast.success("Password reset successfully! Please log in.");
      setResetPasswordDialogOpen(false);
      setForgotPasswordEmail("");
      setOtpInput("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="w-screen h-screen font-montserrat flex-col gap-9 bg-[#E4E3E1] p-10 flex items-center justify-center overflow-hidden">
      <SlideUp duration={0.7}>
        <section className="w-[40%] h-fit bg-[#DFDEDA] flex flex-col p-12 gap-9 items-center rounded-4xl shadow-outside-dropshadow">
          <h1 className="primary-text font-bold">Login to your account</h1>
          {loginError && (
            <div className="w-[90%] py-5 px-5 border border-[#A1A2A6] primary-text rounded-3xl flex flex-row items-center justify-center gap-2 mt-4">
              <CircleAlert size={30} className="text-red-400" />
              <p>{loginError}</p>
            </div>
          )}
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="w-full flex flex-col items-center gap-5"
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
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
              className="w-[90%] bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle"
              type="password"
              placeholder="Password"
            />
            <div className="w-[90%] flex justify-end">
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="bg-transparent text-primary-text text-sm hover:opacity-70 transition-opacity duration-300 px-0"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={isDisabled || isSubmitting}
              className={`w-[90%] bg-[#A1A2A6] text-subtitle text-[#E4E3E1] shadow-outside-dropshadow py-4 rounded-3xl ${isDisabled ? "opacity-70 transition-opacity duration-300 cursor-not-allowed" : "cursor-pointer hover:bg-[#8A8B8E] transition-all duration-300"}`}
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
        <p className="primary-text text-subtitle font-bold">Intelligent Room interaction System</p>
      </section>

      <Toaster richColors expand position="bottom-right" />

      {/* Step 1 — Email Dialog */}
      <Dialog
        open={forgotPasswordDialogOpen}
        onClose={handleForgotPasswordCancel}
        disableEscapeKeyDown={true}
        PaperProps={{ sx: { backgroundColor: "#DFDEDA", borderRadius: "15px" } }}
      >
        <div className="w-96 rounded-lg flex flex-col gap-4 p-5 bg-[#DFDEDA] items-center">
          <div className="w-27 h-27 rounded-full bg-[#A7A7A4] flex items-center justify-center shadow-inner-neumorphic text-[#E4E3E1] font-bold text-7xl">
            !
          </div>
          <h2 className="text-lg font-bold text-[#4F4F4F]">Forgot Password</h2>
          <p className="text-base text-[#4F4F4F] text-center">
            Enter your email and we'll send you a one-time password.
          </p>
          <input
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-[#E4E3E1] primary-text rounded-2xl px-4 py-2 shadow-inside-dropshadow-small font-light text-subtitle"
          />
          <div className="flex flex-row gap-3 justify-center w-full">
            <button
              onClick={handleForgotPasswordCancel}
              disabled={isSubmittingForgotPassword}
              className="px-6 py-2 flex-1 bg-[#DFDEDA] text-[#A1A2A6] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#d4d3d1] transition-colors duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleForgotPasswordSubmit}
              disabled={isSubmittingForgotPassword}
              className="px-6 py-2 flex-1 bg-[#A1A2A6] text-[#DFDEDA] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              {isSubmittingForgotPassword ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Step 2 — OTP Dialog */}
      <Dialog
        open={otpDialogOpen}
        onClose={() => {}}
        disableEscapeKeyDown={true}
        PaperProps={{ sx: { backgroundColor: "#DFDEDA", borderRadius: "15px" } }}
      >
        <div className="w-96 rounded-lg flex flex-col gap-4 p-5 bg-[#DFDEDA] items-center">
          <div className="w-27 h-27 rounded-full bg-[#A7A7A4] flex items-center justify-center shadow-inner-neumorphic text-[#E4E3E1] font-bold text-7xl">
            !
          </div>
          <h2 className="text-lg font-bold text-[#4F4F4F]">Enter OTP</h2>
          <p className="text-base text-[#4F4F4F] text-center">
            Please enter the code we sent to <strong>{forgotPasswordEmail}</strong>
          </p>
          <input
            type="text"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="One-time Password"
            maxLength={6}
            className="w-full bg-[#E4E3E1] primary-text rounded-2xl px-4 py-2 shadow-inside-dropshadow-small font-light text-subtitle tracking-widest text-center"
          />
          <div className="flex flex-row gap-3 justify-center w-full">
            <button
              onClick={handleOtpCancel}
              disabled={isSubmittingOtp}
              className="px-6 py-2 flex-1 bg-[#DFDEDA] text-[#A1A2A6] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#d4d3d1] transition-colors duration-300 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleOtpConfirm}
              disabled={isSubmittingOtp}
              className="px-6 py-2 flex-1 bg-[#A1A2A6] text-[#DFDEDA] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              {isSubmittingOtp ? "Verifying..." : "Confirm"}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Step 3 — Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialogOpen}
        onClose={() => {}}
        disableEscapeKeyDown={true}
        PaperProps={{ sx: { backgroundColor: "#DFDEDA", borderRadius: "15px" } }}
      >
        <div className="w-96 rounded-lg flex flex-col gap-4 p-5 bg-[#DFDEDA] items-center">
          <div className="w-27 h-27 rounded-full bg-[#A7A7A4] flex items-center justify-center shadow-inner-neumorphic text-[#E4E3E1] font-bold text-7xl">
            !
          </div>
          <h2 className="text-lg font-bold text-[#4F4F4F]">Reset Password</h2>
          <p className="text-base text-[#4F4F4F] text-center">
            Enter your new password below.
          </p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full bg-[#E4E3E1] primary-text rounded-2xl px-4 py-2 shadow-inside-dropshadow-small font-light text-subtitle"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="w-full bg-[#E4E3E1] primary-text rounded-2xl px-4 py-2 shadow-inside-dropshadow-small font-light text-subtitle"
          />
          <div className="flex flex-row gap-3 justify-center w-full">
            <button
              onClick={handleResetPasswordCancel}
              disabled={isSubmittingReset}
              className="px-6 py-2 flex-1 bg-[#DFDEDA] text-[#A1A2A6] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#d4d3d1] transition-colors duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPasswordSubmit}
              disabled={isSubmittingReset}
              className="px-6 py-2 flex-1 bg-[#A1A2A6] text-[#DFDEDA] rounded-lg drop-shadow-2xl font-bold text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              {isSubmittingReset ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}