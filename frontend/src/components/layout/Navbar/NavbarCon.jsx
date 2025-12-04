export default function NavbarCon({children}){
    return (
        <header className="  sticky z-50 top-0 px-4 py-2 w-full bg-background/60 backdrop-blur-lg">
            <div className=" container  flex justify-between items-center">
                {
                    children
                }
            </div>
        </header>
    )
}