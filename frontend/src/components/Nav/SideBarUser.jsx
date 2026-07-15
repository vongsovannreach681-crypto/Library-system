import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { to: "/profile", label: "ប្រវត្តិរូប", icon: "fa-user" },
  { to: "/library", label: "បណ្ណាល័យ", icon: "fa-book" },
  { to: "/favorites", label: "ចូលចិត្ត", icon: "fa-star" },
];

const SideBarUser = () => {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-2xl px-4 py-3 font-primary text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-accent text-primary shadow-md"
        : "text-slate-200 hover:bg-white/8 hover:text-white"
    }`;

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:hidden">
        <div>
          <p className="font-primary text-sm font-semibold text-primary dark:text-white">
            ម៉ឺនុយគណនី
          </p>
          <p className="font-primary text-xs text-gray-500 dark:text-gray-400">
            ចូលទៅកាន់ទំព័រផ្សេងៗ
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open profile menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-secondary"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-nav p-5 shadow-2xl transition-transform duration-300 ease-in-out md:sticky md:top-28 md:z-auto md:h-fit md:w-full md:max-w-[280px] md:translate-x-0 md:rounded-3xl md:border md:border-slate-700 md:p-4 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-primary text-base font-semibold text-white">
              ម៉ឺនុយគណនី
            </p>
            <p className="font-primary text-xs text-slate-400">
              ចំណុចចូលលឿន
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close profile menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:hidden"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
          <nav className="flex flex-col gap-1.5">
            {menuItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <i
                  className={`fa-solid ${icon} w-4 text-center text-base opacity-90 group-hover:opacity-100`}
                ></i>
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SideBarUser;
