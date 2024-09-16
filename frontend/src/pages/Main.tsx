import Login from "@components/auth/Login";

const Main = () => {
  return (
    <div className="flex-col-reverse items-center flex 2xl:flex-row 2xl:items-start justify-between  mx-auto gap-4 ">
      <Login />
      <div className="ml-5 p-4">
        <h1 className="font-bold text-[50px] ">RippleChat</h1>
        <p className="text-2xl hidden 2xl:block text-secondary-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias,
          quam!
        </p>
      </div>
    </div>
  );
};

export default Main;
