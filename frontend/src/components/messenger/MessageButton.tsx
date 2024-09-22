import { useNavigate } from "react-router-dom";

import { Button } from "@components/ui/button";

import type { TUser } from "@typesFolder/authType";

import { useAppSelector, useAppDispatch } from "@store/hooks";
import { useCreateChatMutation } from "@features/api/messengerApiSlice";
import { updateCreateChatCache } from "@utils/messengerCache/index";

interface IMessageButtonProps {
  reciver: TUser;
}
const MessageButton = ({ reciver }: IMessageButtonProps) => {
  const [createChat] = useCreateChatMutation();

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCreateChat = async () => {
    const data = await createChat({
      userId: reciver?._id,
    }).unwrap();
    updateCreateChatCache(dispatch, data);
    console.log(data, "from create button chat");
    navigate(`/app/messenger/${data._id}`);
  };
  return (
    <>
      {reciver?._id != user._id && (
        <Button onClick={handleCreateChat} className="button ">
          Message
        </Button>
      )}
    </>
  );
};

export default MessageButton;
