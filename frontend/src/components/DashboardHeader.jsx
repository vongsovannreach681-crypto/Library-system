import React from "react";
import me from "../assets/me.jpg";
const Dashboard = () => {
  return (
    <>
      <header className="ml-[290px] m-auto p-5 px-10 bg-primary font-primary text-white text-2xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">សួរស្តី!​ វង​ សុវណ្ណរាជ</h1>
          <p className="text-lg font-primary text-white pt-1">
            ផ្ទាំងគ្រប់គ្រងសៀវភៅ
          </p>
        </div>
        <div className="flex items-center gap-3 border-1 rounded-lg p-2 bg-gray-600 backdrop-blur">
            <img
              src={me}
              alt="avatar"
              className="w-[50px] h-[50px] rounded-full"
            />
           <div>
             <p className="text-lg font-primary text-white">វង​ សុវណ្ណរាជ</p>
            <p className="text-sm font-primary text-white">អ្នកគ្រប់គ្រង</p>
           </div>
        </div>
      </header>
    </>
  );
};

export default Dashboard;
