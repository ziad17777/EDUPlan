import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NavbarDropMenu() {
  const { user, signout } = useAuth();
  const initials = user?.username ? user.username.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase() : 'CN';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          {user?.username ? <AvatarFallback>{initials}</AvatarFallback> : (
            <>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
              <Link to="/app/profile">
                My Profile
                </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem >
                <Link to="/app/setting">
                Settings
                </Link>
            </DropdownMenuItem>
        <DropdownMenuItem>
            <Link to="/app/history">
                History
                </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
            <Button  variant="destructive" className="w-full " onClick={()=> signout()} >
                logout
                </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
