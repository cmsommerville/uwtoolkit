import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppModal from "./AppModal";
import BlankCanvas from "../icons/undraw_blank_canvas_re_2hwy.svg";
import ResumeWork from "../icons/undraw_join_re_w1lh.svg";

interface ResumeOrRestartProps {
  className?: string;
  resumePath: string;
}

const ResumeOrRestart = (props: ResumeOrRestartProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const resumeWorkHandler = () => {
    setOpen(false);
    navigate(props.resumePath);
  };

  const restartWorkHandler = () => {
    setOpen(false);
    navigate("/quotes");
  };

  return (
    <AppModal
      className="bg-slate-50 sm:max-w-lg lg:max-w-2xl p-8"
      open={open}
      onClose={() => setOpen(false)}
      {...props}
    >
      <div className="grid grid-cols-2 gap-x-6">
        <div
          className="bg-white flex flex-col items-center rounded shadow-md overflow-hidden hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer transition duration-300 hover:scale-102"
          onClick={restartWorkHandler}
        >
          <img src={BlankCanvas} alt={"Blank canvas image"} />
          <div className="flex justify-center items-center bg-slate-100 w-full h-full px-4 py-4">
            <h3 className="font-semibold text-center">Start from scratch!</h3>
          </div>
        </div>
        <div
          className="bg-white flex flex-col items-center rounded shadow-md overflow-hidden hover:shadow-xl hover:shadow-primary-500/30 cursor-pointer transition duration-300 hover:scale-102"
          onClick={resumeWorkHandler}
        >
          <img src={ResumeWork} alt={"Resume work image"} />
          <div className="flex justify-center items-center bg-slate-100 w-full h-full px-4 py-4">
            <h3 className="font-semibold text-center">
              Pick up where you left off!
            </h3>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ResumeOrRestart;
