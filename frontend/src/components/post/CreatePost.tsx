import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { openDialog, closeDialog } from "@store/uiSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { Input } from "@components/ui/input";
import { useCreatePostMutation } from "@features/api/postSlice";
const CreatePost = () => {
  const { isDialogOpen } = useAppSelector((state) => state.ui);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const [createPost, { isLoading, isError }] = useCreatePostMutation();
  const handleChangeDialog = (open: boolean) => {
    if (!open) {
      dispatch(closeDialog());
    }
    console.log(open);
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    console.log({ text, image });
    formData.append("text", text);
    if (image) {
      formData.append("image", image);
    }
    console.log(formData);
    try {
      const response = await createPost(formData).unwrap();
      console.log(response);
    } catch (error) {
      console.log("error in create post", error);
    }
  };
  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={handleChangeDialog}>
        {/* <DialogTrigger>
          <div className="flex items-center gap-2 transition duration-75 hover:bg-black/10 dark:hover:bg-white/10 rounded-md px-2 py-1 lg:px-4 lg:py-2 cursor-pointer">
            <p className="h-5">create post</p>
          </div>
        </DialogTrigger> */}
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="mb-2 text-center text-lg">
              Create Post
            </DialogTitle>
            {/* <Separator className="!my-2 w-full dark:bg-white/10 bg-black/10" /> */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Textarea
                className="resize-none outline-none"
                placeholder="Write a post"
                name="text"
                value={text}
                onChange={handleTextInputChange}
              />
              <Input
                type="file"
                name="image"
                className=""
                onChange={handleFileInputChange}
                accept="image/*"
              />
              <Button className="!mt-4 shadow-md transition bg-primary text-white hover:bg-card hover:text-black dark:bg-card dark:text-white dark:hover:bg-primary dark:hover:text-black ">
                Post
              </Button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;
