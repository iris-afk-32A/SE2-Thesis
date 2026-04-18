import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import changeProfile from "@/assets/icons/changeProfile.png";
import personalInfo from "@/assets/icons/personalInfo.png";
import applyOrg from "@/assets/icons/applyOrg.png";
import logout from "@/assets/icons/logout.png";
import personalInfo_w from "@/assets/icons/personalInfo_w.png";
import applyOrg_w from "@/assets/icons/applyOrg_w.png";
import logout_w from "@/assets/icons/logout_w.png";
import { getOrganization } from "@/shared/services/organization";
import { uploadProfilePicture } from "@/shared/services/userService";
import { toast } from "sonner";

const NAV_ITEMS = [
  { key: "personal", label: "Personal Information", icon: personalInfo, iconActive: personalInfo_w },
  { key: "apply",    label: "Apply organization",   icon: applyOrg,     iconActive: applyOrg_w },
  { key: "logout",   label: "Logout",               icon: logout,       iconActive: logout_w },
];

export default function ProfileSidebar({ activeTab, onTabChange, user }) {
  const [organizationName, setOrganizationName] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (user?.is_authorized && user?.user_organization) {
      const fetchOrganizationName = async () => {
        try {
          setLoading(true);
          const organizations = await getOrganization();
          const org = organizations.find((o) => o._id === user.user_organization);
          setOrganizationName(org?.organization_name || "Organization not found");
        } catch (error) {
          console.error("Error fetching organization:", error);
          setOrganizationName("Error loading organization");
        } finally {
          setLoading(false);
        }
      };
      fetchOrganizationName();
    }
  }, [user?.user_organization, user?.is_authorized]);

  useEffect(() => {
    if (user?.profilePicture) {
      console.log("=== RECEIVED PROFILE PICTURE FROM USER PROP ===");
      console.log("Full data URI:", user.profilePicture);
      console.log("Data URI length:", user.profilePicture.length);
      console.log("Starts with 'data:'?", user.profilePicture.startsWith("data:"));
      
      // Extract base64 part and validate
      const base64Part = user.profilePicture.split(",")[1];
      if (base64Part) {
        console.log("Base64 part length:", base64Part.length);
        console.log("Base64 first 50 chars:", base64Part.substring(0, 50));
        console.log("Base64 last 50 chars:", base64Part.substring(base64Part.length - 50));
        
        // Check for valid base64 characters
        const invalidChars = base64Part.replace(/[A-Za-z0-9+/=]/g, "");
        if (invalidChars.length > 0) {
          console.warn("⚠️ Invalid base64 characters found:", invalidChars);
        } else {
          console.log("✓ Base64 characters valid");
        }
      }
      
      setProfilePicture(user.profilePicture);
    }
  }, [user?.profilePicture]);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPicture(true);
    try {
      const result = await uploadProfilePicture(file);
      setProfilePicture(result.user.profilePicture);
      toast.success("Profile picture updated successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to upload profile picture.");
    } finally {
      setUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  return (
    <div className="relative w-[18vw] h-full aspect-video rounded-2xl shadow-outside-dropshadow flex flex-col justify-start items-center text-header pt-4 px-4">
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 w-10 h-10 bg-transparent rounded-full flex items-center justify-center cursor-pointer hover:bg-[#d4d3d1] transition-colors duration-300"
      >
        <ChevronLeft size={30} className="text-[#858585]" />
      </button>
      <button
        type="button"
        onClick={handleProfilePictureClick}
        disabled={uploadingPicture}
        className="relative group w-40 h-40 mt-12"
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#E4E3E1] to-[#D4D3D1] flex items-center justify-center border-4 border-[#C4C4C4] hover:border-[#A1A2A6] transition-all cursor-pointer"
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
              onLoad={() => {
                console.log("✓ Image loaded successfully");
              }}
              onError={(e) => {
                console.error("✗ Image failed to load:", {
                  eventType: e.type,
                  error: e,
                  srcLength: profilePicture?.length,
                  srcStart: profilePicture?.substring(0, 100),
                  srcMimeType: profilePicture?.split(";")[0],
                  imgElement: {
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight,
                    width: e.target.width,
                    height: e.target.height,
                    complete: e.target.complete,
                  },
                });
              }}
            />
          ) : (
            <img src={changeProfile} alt="Logo" className="w-40 h-40" />
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
            {uploadingPicture ? "Uploading..." : "Change"}
          </span>
        </div>
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePictureSelect}
        className="hidden"
        disabled={uploadingPicture}
      />

      <h2 className="text-lg font-bold text-[#1E1E1E] mt-4">
        {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
      </h2>
      <p className="text-sm text-[#858585] mb-6">
        {user?.is_authorized ? (loading ? "Loading..." : organizationName || "No organization") : "No organization"}
      </p>

      <div className="flex flex-col gap-3 w-full pt-30">
        {NAV_ITEMS.map(({ key, label, icon, iconActive }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`w-full py-2 px-4 flex items-center gap-2 rounded-lg text-base font-medium transition-colors duration-300 ${
              activeTab === key
                ? "bg-[#A7A7A3] text-white shadow-inner"
                : "bg-transparent text-[#1E1E1E] hover:bg-[#c4c3c1]"
            }`}
          >
            <img src={activeTab === key ? iconActive : icon} alt="" className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}