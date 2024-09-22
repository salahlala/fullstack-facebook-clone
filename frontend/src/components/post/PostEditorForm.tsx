import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useToast } from "@components/ui/use-toast";
import { Label } from "@components/ui/label";

import type { ApiError } from "@typesFolder/apiError";

import { closeDialog } from "@store/uiSlice";
import { useAppDispatch } from "@store/hooks";

import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "@features/api/postApiSlice";

import { FaUpload } from "react-icons/fa6";
interface PostEditorFormProps {
  isDialogOpen?: boolean;
  title: string;
  type: string;
  oldText?: string;
  oldImage?: string;
  postId?: string;
  setOldImage?: React.Dispatch<React.SetStateAction<string>>;
  setIsEdit?: React.Dispatch<React.SetStateAction<boolean>>;
}
const PostEditorForm = ({
  isDialogOpen,
  title,
  postId,
  type,
  oldText,
  oldImage,
  setOldImage,
  setIsEdit,
}: PostEditorFormProps) => {
  const [text, setText] = useState(oldText || "");
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const { toast } = useToast();
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
      setImage(file);
      setCurrentImage(URL.createObjectURL(file));
    }
  };
  const handleChangeDialog = (open: boolean) => {
    if (!open && !loading) {
      dispatch(closeDialog());
      setIsEdit && setIsEdit(false);
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
        await updatePost(formData).unwrap();
        toast({
          title: "Success",
          description: "Post updated successfully",
        });
        // console.log(response, "post updated");
      } else if (type == "create") {
        await createPost(formData).unwrap();
        toast({
          title: "Success",
          description: "Post created successfully",
        });
        // console.log(response, "post created");
      }
      dispatch(closeDialog());
      setIsEdit && setIsEdit(false);
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

  const cancelUploadImg = () => {
    if (loading) return;
    setCurrentImage("");
    setImage(null);
  };
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
                  className="absolute top-2 right-2 icon text-xl font-semibold bg-background cursor-pointer"
                  onClick={() => setOldImage && setOldImage("")}
                >
                  x
                </div>
              </div>
            )}
            {/* {type == "edit" && !oldImage && (
              <div className="">
                {!currentImage && (
                  <Label
                    htmlFor="image"
                    className={`cursor-pointer block  text-center mb-3 `}
                  >
                    <div className="text-center bg-background hover-color px-4 py-3 rounded-md flex justify-center items-center gap-2 font-bold">
                      <FaUpload />
                      <p>Upload image</p>
                    </div>
                  </Label>
                )}
                {currentImage && (
                  <div className="relative">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-[300px] object-cover"
                    />
                    <span
                      onClick={cancelUploadImg}
                      className={` absolute top-0 right-0 icon text-lg font-medium bg-background cursor-pointer`}
                    >
                      x
                    </span>
                  </div>
                )}

                <Input
                  type="file"
                  name="image"
                  id="image"
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept="image/*"
                  disabled={loading}
                />
              </div>
            )} */}

            <div className="">
              {!currentImage && !oldImage && (
                <Label
                  htmlFor="image"
                  className="cursor-pointer block text-center mb-3"
                >
                  <div className="text-center bg-background hover-color px-4 py-3 rounded-md flex justify-center items-center gap-2 font-bold">
                    <FaUpload />
                    <p>Upload image</p>
                  </div>
                </Label>
              )}
              {currentImage && (
                <div className="relative">
                  <img
                    src={currentImage}
                    alt=""
                    className="w-full h-[200px] object-cover"
                  />
                  <span
                    onClick={cancelUploadImg}
                    className="absolute top-2 right-2 icon text-lg font-medium bg-background cursor-pointer"
                  >
                    x
                  </span>
                </div>
              )}

              <Input
                type="file"
                name="image"
                id="image"
                className="hidden"
                onChange={handleFileInputChange}
                accept="image/*"
                disabled={loading}
              />
            </div>

            {/* {type == "create" && (
              <div className="">
                {!currentImage && (
                  <Label
                    htmlFor="image"
                    className="cursor-pointer block text-center mb-3"
                  >
                    <div className="text-center bg-background hover-color px-4 py-3 rounded-md flex justify-center items-center gap-2 font-bold">
                      <FaUpload />
                      <p>Upload image</p>
                    </div>
                  </Label>
                )}
                {currentImage && (
                  <div className="relative">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-[200px] object-cover"
                    />
                    <span
                      onClick={cancelUploadImg}
                      className="absolute top-0 right-0 icon text-lg font-medium bg-background cursor-pointer"
                    >
                      x
                    </span>
                  </div>
                )}

                <Input
                  type="file"
                  name="image"
                  id="image"
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept="image/*"
                  disabled={loading}
                />
              </div>
            )} */}
            {handleDisplayErrorMessage()}
            <Button
              disabled={loading || (!text && !image)}
              className="button !mt-2"
              type="submit"
            >
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
