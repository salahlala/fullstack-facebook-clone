import { useEffect } from "react";
import {
  createBrowserRouter,
  useNavigate,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import useAuth from "@hooks/useAuth";
import { useAppSelector } from "@store/hooks";

import ChangePassword from "@components/auth/ChangePassword";
import ForgotPassword from "@components/auth/ForgotPassword";
import ResetPassword from "@components/auth/ResetPassword";
import SessionDialog from "@components/auth/SessionDialog";

import Main from "@pages/Main";
import LoginPage from "@pages/LoginPage";
import HomePage from "@pages/HomePage";
import SignupPage from "@pages/SignupPage";
import SettingPage from "@pages/SettingPage";
import ProfilePage from "@pages/ProfilePage";
import PostPage from "@pages/PostPage";
import SuggestedUserPage from "@pages/SuggestedUserPage";
import MessengerPage from "@pages/MessengerPage";

import MainLayout from "@layouts/MainLayout";
import ProtectLayout from "@layouts/ProtectLayout";
import SettingLayout from "@layouts/SettingLayout";
import MessengerLayout from "@layouts/MessengerLayout";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoading, user } = useAuth();
  const { type, isDialogOpen } = useAppSelector((state) => state.ui);

  if (!isLoading && !user?._id) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) return null;

  return (
    <>
      {children}
      {type == "sessionExpired" && isDialogOpen && <SessionDialog />}
    </>
  );
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
      {
        path: "forgotPassword",
        element: <RedirectRoute children={<ForgotPassword />} />,
      },
      {
        path: "resetPassword/:token",
        element: <RedirectRoute children={<ResetPassword />} />,
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
        path: "post/:id",
        element: <PostPage />,
      },
      {
        path: "profile/:id",
        element: <ProfilePage />,
      },
      {
        path: "suggested-users",
        element: <SuggestedUserPage />,
      },
      {
        path: "messenger",
        element: <MessengerLayout />,
        children: [
          {
            path: ":chatId",
            element: <MessengerPage />,
          },
        ],
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
