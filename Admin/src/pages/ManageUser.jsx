import React, { useEffect, useState } from "react";
import api from "../api/api";
import SideBar from "../components/SideBar";
import Dashboard from "../components/DashboardHeader";
const ManageUser = () => {
  const [user, SetUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getAllUser = async () => {
      try {
        const respone = await api.get("get-all-users");
        SetUser(respone.data.filter((user) => user.id >= 3));
        console.log(respone);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    };
    getAllUser();
  }, []);

//   delete user

  const handleDelete = async(id)=>{
    const confirmDelete = confirm("Are You sure you want to delete this user?")
    if(!confirmDelete) return;
    else{
      try{
          await api.delete(`/delete-user/${id}`)
          SetUser((deleteUser)=> deleteUser.filter((user)=>user.id !==id));
          alert("User Delete Successfully")
      }
      catch(ex){
          console.error(ex)
      }
    }
  }

  if (loading) {
    return (
      <div className="font-primary">
        <SideBar />
        <Dashboard />
        <div className="ml-[290px] m-auto p-5 card flex flex-col items-center justify-center gap-3 bg-background">
          <p className="text-lg font-medium text-primary">
            កំពុងទាញយកប្រភេទ...
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <SideBar />
      <Dashboard />

      <main>
        <div className="ml-[290px] p-6 font-primary">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full border-collapse">
                <thead className="bg-primary text-white">
                  <tr className="text-sm uppercase tracking-wide">
                    <th className="px-6 py-4 text-left font-semibold">លេខ</th>
                    <th className="px-6 py-4 text-left font-semibold">ឈ្មោះ</th>
                    <th className="px-6 py-4 text-left font-semibold">
                      អុីមែល
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      លេខទូរស័ព្ទ
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                    <th className="px-6 py-4 text-left font-semibold">
                      ផ្សេងៗ
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-700 font-primary">
                  {user.filter((user) => user.id >= 2)
                  .map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-100 transition duration-200 hover:bg-blue-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-primary">
                        {user.id}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-primary truncate">
                          {user.name}
                        </p>
                      </td>

                      <td className="px-6 py-4">{user.email}</td>

                      <td className="px-6 py-4">{user.phone}</td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-secondary">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button onClick={()=>handleDelete(user.id)}
                         className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                         
                          លុប
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageUser;
