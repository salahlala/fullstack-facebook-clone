import { useState } from "react";
import {
  useGetMeQuery,
  useUpdateUserProfileMutation,
} from "@features/api/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { useToast } from "@components/ui/use-toast";

import type { ApiError } from "@typesFolder/apiError";
const SettingPage = () => {
  const { data, isLoading } = useGetMeQuery();
  const [updateUserProfile, { isLoading: isLoadingUpdate, isError, error }] =
    useUpdateUserProfileMutation();
  const { toast } = useToast();

  const [img, setImg] = useState(data?.profileImg?.url || "");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    username: data?.username || "",
    bio: data?.bio || "",
    email: data?.email || "",
  });
  const { username, email, bio } = formData;

  // console.log(data.)

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setProfileImg(file);
      setImg(URL.createObjectURL(file));
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.name, e.target.value);
    if (e.target.name === "username") {
      setFormData({ ...formData, username: e.target.value });
    } else if (e.target.name === "bio") {
      setFormData({ ...formData, bio: e.target.value });
    } else if (e.target.name === "email") {
      setFormData({ ...formData, email: e.target.value });
    } else if (e.target.name === "profileImg") {
      const file = e.target.files?.[0] || null;
      if (file) {
        console.log(file, "file");
        setProfileImg(file);
        setImg(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(username.trim() === "");
    if (username.trim() === "" || formData.email.trim() === "") {
      return;
    }

    const formDataFile = new FormData();
    formDataFile.append("username", username);
    formDataFile.append("email", email);
    formDataFile.append("bio", bio);
    if (profileImg) {
      formDataFile.append("profileImg", profileImg);
    }
    try {
      const data = await updateUserProfile(formDataFile).unwrap();
      toast({
        // title: "Profile Updated",
        description: "Your profile has been updated",
      });
      console.log(data, "from submit update");
    } catch (error) {
      console.log(error, "from submit update");
    }
  };

  const handleDisplayErrorMessage: () => JSX.Element = () => {
    if (isError) {
      const messsage = (error as ApiError)?.message;
      return <p className="text-red-500">{messsage}</p>;
    }
    return <></>;
  };
  return (
    <div className="">
      <div className="bg-card p-4 w-[350px] md:w-[400px] lg:w-[500px] min-h-[200px] rounded ">
        <div className="mb-4 flex justify-center ">
          <Label htmlFor="profileImg" className="cursor-pointer">
            <Avatar className="w-[80px] h-[80px]">
              <AvatarImage className="w-full h-full" src={img} />
              <AvatarFallback className="text-xl">
                {data?.username.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          </Label>
          <Input
            type="file"
            name="profileImg"
            id="profileImg"
            className="hidden"
            onChange={handleChange}
          />
        </div>
        <form action="" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={handleChange}
          />
          <Label htmlFor="bio">Bio</Label>
          <Input
            name="bio"
            id="bio"
            type="text"
            placeholder="bio"
            value={formData.bio}
            onChange={handleChange}
          />
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
          />
          {handleDisplayErrorMessage()}
          <Button
            type="submit"
            disabled={isLoadingUpdate || !username || !email}
            className="button dark:bg-background"
          >
            Update
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SettingPage;
