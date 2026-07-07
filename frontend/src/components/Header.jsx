import React from "react";
import Logowhite from "../assets/Logo-white.png";
import logo from "../assets/NobgLogo.png";
const Header = () => {
  return (
    <>
      <header className="bg-nav flex justify-around items-center">
        <div className="flex items-center ">
          {/* logo */}
          <img className="w-25 h-auto" src={logo} alt="" />
        </div>
        <div>
          <nav className="flex gap-5">
            <a
              className="font-primary text-white hover:text-accent font-semibold text-xl"
              href=""
            >
              ប្លុកវេទីកា
            </a>
            <a
              className="font-primary text-white hover:text-accent font-semibold text-xl"
              href=""
            >
              បណ្ណាល័យ
            </a>
            <a
              className="font-primary text-white hover:text-accent font-semibold text-xl"
              href=""
            >
              វេដេអូមេរៀន
            </a>
            <a
              className="font-primary text-white hover:text-accent font-semibold text-xl"
              href=""
            >
              អំពីយើង
            </a>
          </nav>
        </div>
        <div className="flex justify-center items-center gap-5">
          <div className="flex text-2xl gap-2">
            <i class="fa-regular fa-sun text-white  hover:text-accent cursor-pointer "></i>
            <i class="fa-regular fa-heart text-white hover:text-red-600 cursor-pointer"></i>
          </div>
          <button className="bg-primary p-3 font-primary text-white rounded text-xl font-semibold cursor-pointer">ចូលគណនី <i class="fa-solid fa-right-to-bracket"></i></button>
        </div>
      </header>
    </>
  );
};

export default Header;
