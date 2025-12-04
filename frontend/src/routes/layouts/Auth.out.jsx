import { Outlet } from "react-router";
import Navbar from "@/components/layout/Navbarold";

export default function Auth() {
  return (
    <div className="flex flex-col justify-start items-start w-full">
      <Navbar/>
      <main className="w-full min-h-[calc(100dvh-52px)] flex flex-col justify-center items-center">
        <Outlet />
      </main>
    </div>
  );
}
