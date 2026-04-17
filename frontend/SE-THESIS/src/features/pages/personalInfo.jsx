import { useState, useEffect } from "react";
import EditIcon from "@/assets/icons/edit.png";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";
import { getMyProfile, updateMyProfile } from "../../shared/services/userService";

export default function PersonalInfo() {
  const { token } = useAuth(); // get JWT token from context
  const [original, setOriginal] = useState({});
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "",
  });
  const [editMode, setEditMode] = useState({
    firstName: false, lastName: false, email: false, password: false,
  });

  // Load existing user data on mount
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const data = await getMyProfile();

      const loaded = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        password: "",
      };

      setFormData(loaded);
      setOriginal(loaded);
    } catch (err) {
      toast.error(err.message || "Failed to load profile.");
    }
  };

  if (token) fetchUser();
}, [token]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEditMode = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    // Build patch object — only include fields that changed
    const patch = {};
    for (const key of ["firstName", "lastName", "email", "password"]) {
      if (formData[key] !== original[key] && formData[key] !== "") {
        patch[key] = formData[key];
      }
    }

    if (Object.keys(patch).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    try {
      await updateMyProfile(patch);

      toast.success("Profile updated successfully.");
      setOriginal({ ...formData, password: "" }); // reset baseline
      setFormData((prev) => ({ ...prev, password: "" }));
      setEditMode({ firstName: false, lastName: false, email: false, password: false });
    } catch (err) {
      toast.error(err.message || "Failed to save changes.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-end justify-between gap-8 p-8">
      <div className="w-full flex flex-col gap-5">
        <div className="w-full flex flex-row items-end gap-4">
          <div className="w-1/2 flex flex-col gap-2">
            <label className="text-base">First Name</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder=""
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                disabled={!editMode.firstName}
                className="flex-1 bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle placeholder:text-[#858585] outline-none focus:ring-2 focus:ring-[#C4C4C4] disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => toggleEditMode("firstName")}
                className="flex items-center justify-center p-2 transition hover:opacity-80"
              >
                <img src={EditIcon} alt="Edit" className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="w-1/2 flex flex-col gap-2">
            <label className="text-base">Last Name</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder=""
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={!editMode.lastName}
                className="flex-1 bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle placeholder:text-[#858585] outline-none focus:ring-2 focus:ring-[#C4C4C4] disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => toggleEditMode("lastName")}
                className="flex items-center justify-center p-2 transition hover:opacity-80"
              >
                <img src={EditIcon} alt="Edit" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base">Email Address</label>
          <div className="flex items-center gap-3">
            <input
              type="email"
              placeholder=""
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={!editMode.email}
              className="flex-1 bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle placeholder:text-[#858585] outline-none focus:ring-2 focus:ring-[#C4C4C4] disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => toggleEditMode("email")}
              className="flex items-center justify-center p-2 transition hover:opacity-80"
            >
              <img src={EditIcon} alt="Edit" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base">Password</label>
          <div className="flex items-center gap-3">
            <input
              type="password"
              placeholder=""
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={!editMode.password}
              className="flex-1 bg-[#E4E3E1] primary-text rounded-3xl px-6 py-4 shadow-inside-dropshadow-small font-light text-subtitle placeholder:text-[#858585] outline-none focus:ring-2 focus:ring-[#C4C4C4] disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => toggleEditMode("password")}
              className="flex items-center justify-center p-2 transition hover:opacity-80"
            >
              <img src={EditIcon} alt="Edit" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          className="w-62 h-10 bg-[#A1A2A6] text-white px-6 rounded-lg text-base hover:bg-[#7E808C] transition-colors duration-300"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
