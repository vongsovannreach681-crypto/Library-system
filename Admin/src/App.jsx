import { useEffect, useState } from "react";
import SideBar from "./components/SideBar";
import Dashboard from "./components/DashboardHeader";
import api from "./api/api";
import LogToAdmin from "./Form/LogToAdmin";

const App = () => {
  

  return (
    <section className="min-h-screen bg-background">
      <LogToAdmin/>

      
    </section>
  );
};

export default App;
