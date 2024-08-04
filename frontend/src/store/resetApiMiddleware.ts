import { Middleware , Action} from "@reduxjs/toolkit";
import { apiSlice } from "@features/api/apiSlice";
import { logout } from "@store/authSlice";

const resetApiMiddleware: Middleware = (api) => (next) => (action: Action) => {
  if (action.type == logout.type) {
    api.dispatch(apiSlice.util.resetApiState());
  }
  return next(action);
};

export default resetApiMiddleware;
