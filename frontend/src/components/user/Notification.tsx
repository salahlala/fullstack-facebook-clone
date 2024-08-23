import { Link } from "react-router-dom";
import type { TNotification } from "@typesFolder/notificationType";

import ReactTimeAgo from "react-time-ago";

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
const Notification = ({ notification }: { notification: TNotification }) => {
  let message = "";
  switch (notification.type) {
    case "like":
      message = "liked your post";
      break;
    case "comment":
      message = "commented on your post";
      break;
    case "follow":
      message = "started following you";
      break;
    default:
      break;
  }
  return (
    <div className="bg-secondary rounded-md py-2 px-3 mb-3">
      {notification.postId ? (
        <Link to={`/app/post/${notification.postId}`}>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={notification.from?.profileImg.url} />
              <AvatarFallback>
                {notification.from?.username.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{notification.from?.username}</p>
              <p>{message}</p>
              <p className="font-medium dark:text-white/60 text-black/60 text-sm">
                <ReactTimeAgo
                  date={new Date(notification?.createdAt || Date.now())}
                  locale="en-US"
                />
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={notification.from?.profileImg.url} />
            <AvatarFallback>
              {notification.from?.username.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{notification.from?.username}</p>
            <p>{message}</p>
            <p className="font-medium dark:text-white/60 text-black/60 text-sm">
              <ReactTimeAgo
                date={new Date(notification?.createdAt || Date.now())}
                locale="en-US"
              />
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
