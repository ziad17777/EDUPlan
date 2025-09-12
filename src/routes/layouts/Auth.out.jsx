import { Outlet } from "react-router";

export default function Auth() {
  return (
    <div className="flex flex-col justify-start items-center">
      <nav></nav>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </div>
  );
}
