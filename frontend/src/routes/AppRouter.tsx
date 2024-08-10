import { useEffect } from "react";
import {
  createBrowserRouter,
  useNavigate,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import MainLayout from "@layouts/MainLayout";
import ProtectLayout from "@layouts/ProtectLayout";
import SettingLayout from "@layouts/SettingLayout";
import Main from "@pages/Main";
import LoginPage from "@pages/LoginPage";
import HomePage from "@pages/HomePage";
import SignupPage from "@pages/SignupPage";
import SettingPage from "@pages/SettingPage";
// import { useAppSelector } from "@store/hooks";
import ProfilePage from "@pages/ProfilePage";

import useAuth from "@hooks/useAuth";
import ChangePassword from "@components/auth/ChangePassword";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoading, user } = useAuth();
  // const { user } = useAppSelector((state) => state.auth);

  if (!isLoading && !user?._id) {
    console.log("triggre protect route");
    return <Navigate to="/login" replace />;
  }

  if (isLoading) return null;

  return children;
};

const RedirectRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoading, user } = useAuth();
  // const location = useLocation();
  const navigate = useNavigate();
  // const location = useLocation();
  useEffect(() => {
    if (!isLoading && user?._id) {
      // Replace the current state
      // window.history.replaceState(null, '', window.location.pathname);

      navigate("/app", { replace: true });
    }
  }, [isLoading, user._id, navigate]);

  if (isLoading) return;

  if (!user._id) {
    return children;
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <RedirectRoute children={<Main />} />,
      },
      {
        path: "login",
        element: <RedirectRoute children={<LoginPage />} />,
      },
      {
        path: "signup",
        element: <RedirectRoute children={<SignupPage />} />,
      },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute children={<ProtectLayout />} />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "profile/:id",
        element: <ProfilePage />,
      },
      {
        path: "setting",
        element: <SettingLayout />,
        children: [
          {
            index: true,
            element: <SettingPage />,
          },
          {
            path: "password",
            element: <ChangePassword />,
          },
        ],
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
