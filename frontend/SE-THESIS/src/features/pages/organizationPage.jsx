import React, { useState, useEffect } from "react";
import Search from "@/assets/icons/Search.png";
import Remove from "@/assets/icons/Remove.png";
import Leave from "@/assets/icons/Leave.png";
import Popover from "@mui/material/Popover";
import { toast } from "sonner";
import { getOrganizationMembers, removeMemberFromOrganization } from "@/shared/services/organization";
import { useAuth } from "@/context/authContext";

export default function OrganizationPage() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setLoading(true);
        // Use the organization name directly from user data
        
        console.log("User organization:", user);
        
        const membersData = await getOrganizationMembers(user.user_organization);
        setOrganizationName(membersData.organization || null);
        setMembers(membersData.members || []);
        setFilteredMembers(membersData.members || []);


        console.log("Fetched members data:", membersData);

        // Fetch members if user has an organization
        // if (user?.user_organization) {
        //   const membersData = await getOrganizationMembers(user.user_organization);
        //   // setMembers(membersData.members || []);
        //   // setFilteredMembers(membersData.members || []);
        //   console.log("Fetched members data:", membersData);
        // }
      } catch (err) {
        console.error("Error fetching organization members:", err);
        setError("Failed to load organization members");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrgData();
    }
  }, [user]);

  useEffect(() => {
    const filtered = members.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const email = member.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || email.includes(search);
    });
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const handleRemoveClick = (event, member, type) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMemberToRemove(member);
    setActionType(type);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMemberToRemove(null);
    setActionType(null);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove?._id) return;
    try {
      setIsRemoving(true);
      await removeMemberFromOrganization(memberToRemove._id, actionType);
      toast.success(`${memberToRemove.first_name} ${memberToRemove.last_name} has been removed from the organization.`);
      
      // Refresh members list
      const membersData = await getOrganizationMembers(user.user_organization);
      setMembers(membersData.members || []);
      setFilteredMembers(membersData.members || []);
      
      handleClose();
    } catch (err) {
      console.error("Error removing member:", err);
      toast.error("Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "remove-member-popover" : undefined;

  return (
    <div className="w-full h-full bg-[#E4E3E1] min-h-0">
      <section className="relative w-full h-full flex flex-col gap-6 min-h-0">
        <div className="w-full flex flex-row items-end justify-between text-[#1E1E1E] opacity-75">
          <h1 className="text-subheader font-bold">Organization {organizationName && `- ${organizationName}`}</h1>
        </div>
        <div className="w-full h-full min-h-0 rounded-2xl shadow-outside-dropshadow flex flex-col bg-[#E4E3E1] p-4 gap-6">
          <div className="w-[45%] h-[7%] bg-[#E4E3E1] text-subtitle rounded-3xl shadow-inside-dropshadow-small flex items-center px-4">
            <img src={Search} alt="Logo" className="w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-[#1e1e1e] font-light text-subtitle outline-none"
            />
          </div>
          <div className="flex-1 bg-[#E4E3E1] border border-[#d4d3d1] rounded-xl shadow-inside-dropshadow-small overflow-y-auto">
            <div className="w-full h-16 bg-[#E4E3E1] border-b border-[#d4d3d1] flex items-center shadow-inside-dropshadow-small px-4 gap-4 sticky top-0">
              <div className="flex flex-row justify-between items-center gap-70 p-4 w-full">
                <span className="text-base font-semibold">Name</span>
                <span className="text-base font-semibold">Email</span>
                <span className="text-base font-semibold w-45"></span>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32 text-[#1E1E1E]">
                <span>Loading members...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32 text-red-500">
                <span>{error}</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-[#1E1E1E] opacity-50">
                <span>No members found</span>
              </div>
            ) : (
              filteredMembers.map((member, index) => (
                <div
                  key={index}
                  className="w-full h-16 border-b border-[#d4d3d1] flex items-center px-4 gap-4 hover:bg-[#d4d3d1] transition-colors"
                >
                  <div className="flex flex-row justify-between items-center w-full p-4">
                    <span className="text-base">{member.first_name} {member.last_name}</span>
                    <span className="text-base absolute right-198 w-20 text-left">{member.email}</span>
                    <div className="flex items-center gap-4 w-20 justify-end">
                      {member.first_name === user?.first_name && member.last_name === user?.last_name && (
                        <button
                          onClick={(e) => handleRemoveClick(e, member, "leave")}
                          className="p-1 hover:bg-[#A7A7A3] rounded transition-colors"
                          title="Leave organization"
                        >
                          <img src={Leave} alt="Leave" className="w-5 h-5" />
                        </button>
                      )}
                      {user?.is_admin && (
                        <button
                          onClick={(e) => handleRemoveClick(e, member, "remove")}
                          className="p-1 hover:bg-[#A7A7A3] rounded transition-colors"
                          title="Remove member"
                        >
                          <img src={Remove} alt="Remove" className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#DFDEDA",
              borderRadius: "15px",
              marginY: -2,
            },
          },
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <div className="w-96 rounded-lg flex flex-col gap-4 p-5 bg-[#DFDEDA]">
          <h2 className="text-lg font-semibold text-[#4F4F4F]">
            {actionType === "leave" ? "Leave Organization" : "Remove Member"}
          </h2>
          <p className="text-base text-[#4F4F4F]">
            {actionType === "leave"
              ? "Are you sure you want to leave the organization?"
              : `Are you sure you want to remove ${memberToRemove?.first_name} ${memberToRemove?.last_name} from your organization?`}
          </p>
          <div className="flex flex-row gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={isRemoving}
              className="px-6 py-2 bg-[#A1A2A6] text-white rounded-lg text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              className="px-6 py-2 bg-[#A1A2A6] text-white rounded-lg text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              {isRemoving ? "Removing..." : "Yes"}
            </button>
          </div>
        </div>
      </Popover>
    </div>
  );
}
