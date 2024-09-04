import { useAppSelector } from "@store/hooks";
const OnlineStatus = ({ reciver }: { reciver: string }) => {
  const { onlineUsers } = useAppSelector((state) => state.socket);
  const isOnline = onlineUsers.includes(reciver);

  return (
    <>
      {isOnline && (
        <div className="absolute bottom-1 z-10 w-3 h-3 rounded-full bg-green-500" />
      )}
    </>
  );
};

export default OnlineStatus;
