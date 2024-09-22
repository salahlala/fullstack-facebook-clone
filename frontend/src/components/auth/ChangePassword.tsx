import { useState } from "react";

import { useToast } from "@components/ui/use-toast";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

import type { ApiError } from "@typesFolder/apiError";

import { useUpdateUserProfileMutation } from "@features/api/userApiSlice";

const ChangePassword = () => {
  const [updateUserProfile, { isLoading, isError, error }] =
    useUpdateUserProfileMutation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: "",
    NewPassword: "",
  });
  const { currentPassword, NewPassword } = formData;
  const handleDisplayErrorMessage: () => JSX.Element = () => {
    if (isError) {
      console.log(error, "from handle display");

      const messsage = (error as ApiError)?.message;
      return <p className="text-red-500">{messsage}</p>;
    }
    return <></>;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "currentPassword") {
      setFormData({ ...formData, currentPassword: e.target.value });
    } else if (e.target.name === "NewPassword") {
      setFormData({ ...formData, NewPassword: e.target.value });
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const dataForm = new FormData();

      dataForm.append("currentPassword", currentPassword);
      dataForm.append("newPassword", NewPassword);
      const data = await updateUserProfile(dataForm).unwrap();
      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setFormData({ currentPassword: "", NewPassword: "" });
      console.log(data, "data");
    } catch (error) {
      console.log(error, "from catch");
    }
  };
  return (
    <div className="">
      <div className="bg-card p-4 w-[350px] md:w-[400px] lg:w-[500px] min-h-[200px] rounded ">
        <form action="" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            type="password"
            id="currentPassword"
            name="currentPassword"
            placeholder="current password"
            value={currentPassword}
            onChange={handleChange}
          />
          <Label htmlFor="NewPassword">New Password</Label>

          <Input
            type="password"
            id="NewPassword"
            name="NewPassword"
            placeholder="new password"
            value={NewPassword}
            onChange={handleChange}
          />
          {handleDisplayErrorMessage()}
          <Button
            type="submit"
            disabled={isLoading || !currentPassword || !NewPassword}
            className="dark:bg-background button"
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
