import { Outlet } from "react-router";
const MainLayout = () => {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
