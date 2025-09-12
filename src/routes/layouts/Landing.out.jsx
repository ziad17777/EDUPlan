import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router";

export default function Landing() {
  return (
    <div className="flex flex-col justify-start items-center">
      <Navbar/>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </div>
  );
}
