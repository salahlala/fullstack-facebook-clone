import { useNavigate } from "react-router-dom";
import { useCreateChatMutation } from "@features/api/messengerApiSlice";

import { useAppSelector } from "@store/hooks";
import { Button } from "@components/ui/button";

import type { TUser } from "@typesFolder/authType";
interface IMessageButtonProps {
  reciver: TUser;
}
const MessageButton = ({ reciver }: IMessageButtonProps) => {
  const [createChat] = useCreateChatMutation();

  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleCreateChat = async () => {
    // console.log({ reciver, user }, "reciver");
    const data = await createChat({
      firstId: user._id,
      secondId: reciver?._id,
    }).unwrap();
    // const messagesData = await getMessages(data._id).unwrap();
    // dispatch(setMessages(messagesData));

    console.log(data, "from create button chat");
    // dispatch(setSelectedChat({ chat: data._id, user: reciver }));
    navigate(`/app/messenger/${data._id}`);
  };
  return (
    <>
      {reciver?._id != user._id && (
        <Button
          onClick={handleCreateChat}
          className="button dark:bg-background"
        >
          Message
        </Button>
      )}
    </>
  );
};

export default MessageButton;
