import { TailSpin  } from "react-loader-spinner";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <TailSpin  height={40} width={40} color="orange" ariaLabel="loading" />
    </div>
  );
};

export default LoadingSpinner;

