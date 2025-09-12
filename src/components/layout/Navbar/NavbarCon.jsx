export default function NavbarCon({children}){
    return (
        <header className=" static top-0 px-4 py-2 w-full">
            <div className=" container  flex justify-between items-center">
                {
                    children
                }
            </div>
        </header>
    )
}