import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";

import type { ApiError } from "@typesFolder/apiError";

import { useAppDispatch } from "@store/hooks";
import { login } from "@store/authSlice";

import { useResetPasswordMutation } from "@features/api/authApiSlice";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useParams();
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "password") {
      setFormData({ ...formData, password: e.target.value });
    } else if (e.target.name === "confirmPassword") {
      setFormData({ ...formData, confirmPassword: e.target.value });
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dataApi = {
      password: formData.password,
      passwordConfirm: formData.confirmPassword,
      token: token as string,
    };
    const data = await resetPassword(dataApi).unwrap();
    setFormData({ password: "", confirmPassword: "" });
    console.log(data);
    dispatch(login(data?.user));
    // if (data?.token) {
    navigate("/app", { replace: true });
    // }
  };
  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-[340px]  lg:w-[400px]  rounded-md p-4 shadow-xl bg-card">
        <form
          action=""
          className="flex  flex-col gap-3 mb-3"
          onSubmit={handleSubmit}
        >
          <Label htmlFor="password">New Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="new password"
            className="!ring-offset-0 !ring-0"
            required
            value={formData.password}
            onChange={handleChangeInput}
          />
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="confirm password"
            className="!ring-offset-0 !ring-0"
            required
            value={formData.confirmPassword}
            onChange={handleChangeInput}
          />
          {error && (
            <p className="text-red-500">{(error as ApiError)?.message}</p>
          )}
          <Button type="submit" className=" button" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
