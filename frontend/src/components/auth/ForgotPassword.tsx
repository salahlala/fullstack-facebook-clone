import { useState } from "react";
import { Link } from "react-router-dom";

import { useForgotPasswordMutation } from "@features/api/authSlice";
import type { ApiError } from "@typesFolder/apiError";

import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
const ForgotPassword = () => {
  const [forgotPassword, { data, isLoading, isError, error }] =
    useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await forgotPassword(email).unwrap();
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-[340px]  lg:w-[400px]  rounded-md p-4 shadow-xl bg-card">
        <form
          action=""
          className="flex  flex-col gap-3 mb-3"
          onSubmit={handleSubmit}
        >
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="email"
            value={email}
            className="!ring-offset-0 !ring-0"
            required
            onChange={handleChange}
          />
          <p className="text-green-500">{data?.message}</p>
          {isError && (
            <p className="text-red-500">{(error as ApiError)?.message}</p>
          )}
          <div className="flex gap-3">
            <Button className="dark:bg-secondary button">
              <Link to="/login">Back to login</Link>
            </Button>
            <Button
              type="submit"
              className="dark:bg-background button"
              disabled={isLoading}
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
