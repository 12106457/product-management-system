"use client"

import dynamic from "next/dynamic";

const GridLoader = dynamic(
  () => import("react-spinners").then((mod) => mod.GridLoader),
  { ssr: false }
);
  

interface SpinnerProps {
    loading: boolean; 
}




const Spinner:React.FC<SpinnerProps> = ({ loading })  => {
  return (
    <div className="flex items-center justify-center h-screen">
      <GridLoader color="#386077" loading={loading} size={10} />
    </div>
  );
};

export default Spinner;
