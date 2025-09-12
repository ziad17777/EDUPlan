import { NavLink } from "react-router-dom";
export default function NavbarLink({ title, url }) {
  return (
    <NavLink to={url} activeClassName="active-nav-link" className="px-4 py-2 ">
      <span className="">{title}</span>
    </NavLink>
  );
}
