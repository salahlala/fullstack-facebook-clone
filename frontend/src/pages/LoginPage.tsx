import Login from "@components/auth/Login";

const LoginPage = () => {
  return (
    <div className={` flex items-center justify-center flex-col`}>
      <h1 className="text-center  font-bold text-[40px] ">RippleChat</h1>

      <Login />
    </div>
  );
};

export default LoginPage;
