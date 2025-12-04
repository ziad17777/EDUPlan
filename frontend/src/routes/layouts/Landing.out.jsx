import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router";

export default function Landing() {
  return (
    <div className="flex flex-col justify-start items-start w-full">
      <Navbar/>
      <main className="min-h-[calc(100dvh-52px)] w-full flex flex-col justify-start items-center">
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
}
