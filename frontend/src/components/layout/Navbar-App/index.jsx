import NavbarBrand from "./NavbarBrand";
import NavbarDropMenu from "./NavbarDropMenu";
import NavbarCon from "./NavbarCon";
// const routes = [
// {
//     title:"home",
//     url:"/"
// },
// {
//     title:"pricing",
//     url:"/pricing"
// },
// {
//     title:"contact",
//     url:"/contact"
// },
// ]

export default function NavbarApp(){
    
    return(
        <NavbarCon>
            <NavbarBrand/>
    
<NavbarDropMenu/>

        </NavbarCon>
    )
}