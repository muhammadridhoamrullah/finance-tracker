import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#F4F6FA] text-blue-950">
      <AiOutlineLoading3Quarters className="text-5xl animate-spin" />
    </div>
  );
}
