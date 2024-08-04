// import { Button } from "@/components/ui/button";
import {Button} from "@components/ui/button";
import { Input } from "@components/ui/input";
import "./App.css";

function App() {
  return (
    <>
      <div className="container mx-auto px-4">
        <Button className="w-40" variant="default">
          Button
        </Button>
        <p className="text-gray-700">hello world</p>
        <Input type="text" placeholder="text" />
      </div>
    </>
  );
}

export default App;
