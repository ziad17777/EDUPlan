import NavbarBrand from "./NavbarBrand";
import NavbarCon from "./NavbarCon";
import NavbarLink from "./NavbarLink";
import NavbarMenu from "./NavbarMenu";
const routes = [
{
    title:"home",
    url:"/"
},
{
    title:"support",
    url:"/support"
},
{
    title:"service",
    url:"/service"
},
]

export default function Navbar(){
    
    return(
        <NavbarCon>
            <NavbarBrand/>
    <div className="flex justify-between gap-4">
<NavbarMenu>
 {
  routes.map((route) => (
    <NavbarLink 
      key={route.url} 
      title={route.title} 
      url={route.url} 
    />
  ))
}
</NavbarMenu>
    </div>
        </NavbarCon>
    )
}