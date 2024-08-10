import { Outlet } from "react-router";
import { Link } from "react-router-dom";
const SettingLayout = () => {
  return (
    <div className="md:flex gap-4">
      <div className="bg-card h-[150px] md:h-[calc(100vh-70px)] w-full md:w-[300px] lg:w-[400px] relative top-[70px] p-4 ">
        <Link
          to="/app/setting"
          className="block mb-4 py-2 px-4  bg-background rounded-md"
        >
          setting
        </Link>
        <Link
          to="/app/setting/password"
          className="block mb-4 py-2 px-4  bg-background rounded-md"
        >
          change password
        </Link>
      </div>
      <div className="md:min-h-screen pt-24 md:pt-[80px] grid place-content-center flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingLayout;
