import { Button  } from "@/components/ui/button";
import { Link } from "react-router-dom";
export default function NavbarAction(){
    return (
            <Button asChild >
                <Link to="/auth/signin">
                Start Learning With AI
                </Link>
            </Button>
    )
}