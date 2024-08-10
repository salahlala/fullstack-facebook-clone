import { useAppSelector } from "@store/hooks";
import PostEditorForm from "@components/post/PostEditorForm";

const CreatePost = () => {
  const { isDialogOpen } = useAppSelector((state) => state.ui);

  return (
    <div>
      <PostEditorForm
        isDialogOpen={isDialogOpen}
        type="create"
        title="Create"
      />
    </div>
  );
};

export default CreatePost;
