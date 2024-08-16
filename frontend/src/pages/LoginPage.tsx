import Login from "@components/auth/Login";

const LoginPage = () => {
  return (
    <div className={` flex items-center justify-center flex-col`}>
      <h1 className="text-center  font-bold text-[50px] ">facebook</h1>

      <Login />
    </div>
  );
};

export default LoginPage;
