import Data from "@/components/Data";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen overflow-hidden ">
      <div className="w-1/4 bg-blue-950  text-white rounded-2xl my-2 ml-1">
        <Data />
      </div>

      <div className="w-3/4  text-white flex flex-col overflow-y-auto h-full">
        <Navbar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
