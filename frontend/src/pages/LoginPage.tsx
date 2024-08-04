import Login from "@components/auth/Login";
import useAuth from "@hooks/useAuth";
import { useAppSelector } from "@store/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";
const LoginPage = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
// ${// isLoggedIn && "hidden"// }
  return (
    <div
      className={` flex items-center justify-center flex-col`}
    >
      <h1 className="text-center  font-bold text-[50px] ">facebook</h1>

      <Login />
    </div>
  );
};

export default LoginPage;
