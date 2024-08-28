import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";

const SessionDialog = () => {
  return (
    <Dialog open>
      <DialogContent className="z-50 md:w-auto w-[calc(100%-40px)] ">
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Your session has expired. Please login again.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Login Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDialog;
