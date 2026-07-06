import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { to: "/", label: "ទិន្ន័យបណ្នាល័យ", icon: "fa-chart-bar" },
  { to: "/manageBook", label: "គ្រប់គ្រងសៀវភៅ", icon: "fa-book" },
  { to: "/categories", label: "គ្រប់គ្រងប្រភេទសៀវភៅ", icon: "fa-file" },
  { to: "/requests", label: "ការស្នើសុំ", icon: "fa-chart-bar" },
  { to: "/users", label: "គ្រប់គ្រងអ្នកប្រើ", icon: "fa-user" },
  { to: "/settings", label: "គ្រប់គ្រង", icon: "fa-cog" },
];

const SideBar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[300px] bg-primary align-middle">
      <div className="m-auto flex justify-center">
        <img
          src="https://libre-shelf-final-project-dun.vercel.app/img/white-logo.png"
          alt="Logo"
          className="h-[150px] w-[150px]"
        />
      </div>
      <hr className="h-5 w-full border-gray-200" />
      <nav className="mt-1 flex flex-col gap-3 p-3">
        <p className="font-primary text-lg text-white">គ្រប់គ្រងមីនុយ</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-xl px-2 py-2 text-2xl font-primary transition ${
                isActive
                  ? "bg-gray-200 text-primary"
                  : "text-white hover:text-accent"
              }`
            }
          >
            <i className={`fa-solid ${item.icon} mr-2`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SideBar;
