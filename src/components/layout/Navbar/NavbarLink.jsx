// NavbarLink.jsx
import { NavLink } from "react-router-dom";

export default function NavbarLink({ title, url }) {
  return (
    <NavLink
      to={url}
      end
      className={({ isActive }) =>
        [
          "navbar-link px-2 py-1 inline-block", 
          isActive ? "active-nav-link" : ""
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <span className="capitalize text-sm">{title}</span>
    </NavLink>
  );
}
