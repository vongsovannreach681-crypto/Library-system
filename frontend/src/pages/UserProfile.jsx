import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SideBarUser from "../components/Nav/SideBarUser";
import Header from '../components/Header'
const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profile, setProfile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name,
      email: parsedUser.email,
      phone: parsedUser.phone,
    });
  }, [navigate]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("_method", "PUT");

      if (profile) {
        data.append("profile", profile);
      }

      const response = await api.post(`/user/${user.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setProfile(null);
      setProfilePreview(null);
      setSuccess("Profile updated successfully!");
    } catch (ex) {
      const errorMessage =
        ex.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
    
      <section className="flex gap-10 justify-center p-5 ">
        <section className="w-[15%] h-screen">
          <SideBarUser />
        </section>
        <section className="w-[85%] bg-accent">content</section>
      </section>
    </>
  );
};

export default UserProfile;
