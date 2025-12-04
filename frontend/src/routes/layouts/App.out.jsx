import NavbarApp from "@/components/layout/Navbar-App";
import { Outlet } from "react-router";

export default function App() {
  return (
    <div className="flex flex-col justify-start items-start w-full">
      <NavbarApp/>
      <main className="min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)] w-full  h-full">
        <Outlet  />
        
      </main>
      <footer></footer>
    </div>
  );
}
