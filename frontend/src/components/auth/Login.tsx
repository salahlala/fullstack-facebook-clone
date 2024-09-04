import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@features/api/authApiSlice";
import { useAppDispatch } from "@store/hooks";
import { login as loginAction } from "@store/authSlice";

import type { ApiError } from "@typesFolder/apiError";

import useSignIn from "react-auth-kit/hooks/useSignIn";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [login, { isLoading, error, isError }] = useLoginMutation();
  // const signIn = useSignIn();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app";
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "email") {
      setFormData({ ...formData, email: e.target.value });
    } else if (e.target.name === "password") {
      setFormData({ ...formData, password: e.target.value });
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await login(formData).unwrap();
      const { _id, email, username } = data.data;
      // signIn({
      //   auth: {
      //     token: data.token,
      //     // type: "Bearer",
      //   },
      //   userState: {
      //     uid: _id,
      //     name: username,
      //   },
      // });
      dispatch(
        loginAction({
          _id: _id,
          email: email,
          username: username,
        })
      );
      setFormData({ email: "", password: "" });
      navigate("/app", { replace: true });
    } catch (error) {
      console.log(error, "error");
    }
  };
  // console.log(error, "error from out");
  return (
    <div className="w-[340px] min-h-[320px] lg:w-[400px] lg:h-[350px] rounded-md p-4 shadow-xl bg-card">
      <form onSubmit={handleSubmit} className="flex  flex-col gap-3">
        <Label htmlFor="email" className="text-foregronud">
          Email
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          onChange={handleChange}
          className="!ring-offset-0 !ring-0"
        />
        <Label htmlFor="password" className="text-card-foreground">
          Password
        </Label>
        <Input
          type="password"
          id="password"
          name="password"
          onChange={handleChange}
          className="!ring-offset-0 !ring-0"
        />
        {isError && (
          <p className="text-red-500 text-center">
            {(error as ApiError)?.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-primary text-background hover:bg-secondary hover:text-foreground transition-colors duration-200"
          disabled={isLoading}
        >
          Login
        </Button>
        <Link to="/forgotPassword" className="mt-3">
          <p className="text-center text-primary">Forgot Password</p>
        </Link>
        <Link to="/signup" className="mt-3">
          <p className="text-center text-primary">Create new account</p>
        </Link>
      </form>
    </div>
  );
};

export default Login;
