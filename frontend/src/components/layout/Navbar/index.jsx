import { useState } from "react";
import { Menu, X } from "lucide-react";
import NavbarAction from "./NavbarAction";
import NavbarBrand from "./NavbarBrand";
import NavbarCon from "./NavbarCon";
import NavbarLink from "./NavbarLink";
import NavbarMenu from "./NavbarMenu";
import { Button } from "@/components/ui/button";
const routes = [
  {
    title: "home",
    url: "/",
  },
  {
    title: "pricing",
    url: "/pricing",
  },
  {
    title: "contact",
    url: "/contact",
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(0);
  return (
    <NavbarCon>
      <NavbarBrand />
      <div className="md:flex justify-between gap-4 hidden ">
        <NavbarMenu>
          {routes.map((route) => (
            <NavbarLink key={route.url} title={route.title} url={route.url} />
          ))}
        </NavbarMenu>
      </div>
      <div className="md:flex hidden">
        <NavbarAction />
      </div>
      <div className="flex md:hidden">
        <Button className="bg-transparent" onClick={() => setIsOpen(1)}>
          <Menu />
        </Button>
      </div>
      <aside
        className={
            `${isOpen ? " w-full" : "hidden  "} w-0 absolute top-0 right-0 transition-all   duration-500   min-h-dvh bg-secondary  pt-14 flex flex-col justify-start items-start`
         }
      >
        <Button
          className=" bg-transparent absolute top-2 right-8  "
          onClick={() => setIsOpen(0)}
        >
          <X />
        </Button>
        <div className="flex flex-col justify-start items-start gap-4 pl-4">
          {routes.map((route) => (
            <NavbarLink key={route.url} title={route.title} url={route.url} />
          ))}
        </div>
      </aside>
    </NavbarCon>
  );
}
