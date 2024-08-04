export type ApiError = {
  message?: string;
  status: number;
  data: {
    message: string;
  };
}