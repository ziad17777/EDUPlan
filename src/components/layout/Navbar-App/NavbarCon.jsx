export default function NavbarCon({children}){
    return (
        <header className="   px-4 py-2 w-full bg-background/60 backdrop-blur-lg">
            <div className=" container  flex justify-between items-center">
                {
                    children
                }
            </div>
        </header>
    )
}