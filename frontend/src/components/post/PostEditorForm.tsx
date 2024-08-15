import { useState } from "react";
import { closeDialog } from "@store/uiSlice";
import { useAppDispatch } from "@store/hooks";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "@features/api/postSlice";

import type { ApiError } from "@typesFolder/apiError";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

interface PostEditorFormProps {
  isDialogOpen?: boolean;
  title: string;
  type: string;
  oldText?: string;
  oldImage?: string;
  postId?: string;
  setOldImage?: React.Dispatch<React.SetStateAction<string>>;
}
const PostEditorForm = ({
  isDialogOpen,
  title,
  postId,
  type,
  oldText,
  oldImage,
  setOldImage,
}: PostEditorFormProps) => {
  const [text, setText] = useState(oldText || "");
  const [image, setImage] = useState<File | null>(null);

  const dispatch = useAppDispatch();
  const [createPost, { isLoading, isError, error }] = useCreatePostMutation();
  const [
    updatePost,
    { isLoading: isLoadingUpdate, isError: isErrorUpdate, error: errorUpdate },
  ] = useUpdatePostMutation();

  const loading = isLoading || isLoadingUpdate;
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      console.log(file, "file from input");
      setImage(file);
    }
  };
  const handleChangeDialog = (open: boolean) => {
    if (!open && !loading) {
      dispatch(closeDialog());
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text && !image) return;

    const formData = new FormData();
    formData.append("text", text);

    image && formData.append("img", image);
    if (type == "edit" && postId) {
      formData.append("postId", postId);
      !image && !oldImage && formData.append("removeImg", "true");
    }
    try {
      if (type == "edit") {
        const response = await updatePost(formData).unwrap();
        console.log(response, "post updated");
      } else if (type == "create") {
        const response = await createPost(formData).unwrap();
        console.log(response, "post created");
      }
      dispatch(closeDialog());
      setText("");
    } catch (error) {
      console.log("error in editor post", error);
    }
  };

  const handleDisplayErrorMessage: () => JSX.Element = () => {
    const checkError = isError || isErrorUpdate;
    if (checkError) {
      const messsage =
        (error as ApiError)?.message || (errorUpdate as ApiError)?.message;
      return <p className="text-red-500">{messsage}</p>;
    }
    return <></>;
  };
  console.log(errorUpdate, "error update");
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleChangeDialog}>
      <DialogContent
        aria-describedby={undefined}
        className="w-[calc(100%-40px)] md:w-full"
      >
        <DialogHeader>
          <DialogTitle className="mb-2 text-center text-lg">
            {title} Post
          </DialogTitle>
          {/* <Separator className="!my-2 w-full dark:bg-white/10 bg-black/10" /> */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
              className="resize-none outline-none"
              placeholder={`${title} a post`}
              name="text"
              value={text}
              onChange={handleTextInputChange}
              disabled={loading}
            />
            {oldImage && (
              <div className="relative">
                <img
                  src={oldImage}
                  alt="post image"
                  className="w-full h-[200px] object-cover"
                />
                <div
                  className="absolute top-2 right-2 bg-background py-1 px-2 rounded-md cursor-pointer"
                  onClick={() => setOldImage && setOldImage("")}
                >
                  x
                </div>
              </div>
            )}
            {type == "edit" && !oldImage && (
              <Input
                type="file"
                name="image"
                className=""
                onChange={handleFileInputChange}
                accept="image/*"
                disabled={loading}
              />
            )}
            {type == "create" && (
              <Input
                type="file"
                name="image"
                className=""
                onChange={handleFileInputChange}
                accept="image/*"
                disabled={loading}
              />
            )}
            {handleDisplayErrorMessage()}
            <Button disabled={loading || (!text && !image)} className="button ">
              {loading
                ? "Loading..."
                : type == "edit"
                ? "Update Post"
                : "Create Post"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PostEditorForm;
// !mt-4 shadow-md transition bg-primary text-white hover:bg-card hover:text-black dark:bg-card dark:text-white dark:hover:bg-primary dark:hover:text-black