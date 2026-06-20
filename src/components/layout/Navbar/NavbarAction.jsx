import { Button  } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/store/auth';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function NavbarAction(){
    const { user, signout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async ()=>{
        setLoading(true);
        await signout();
        setLoading(false);
        // after logout go to home
        navigate('/');
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <Button variant="outline" asChild>
                    <Link to="/app">Go to App</Link>
                </Button>
                <Button onClick={handleLogout} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Logout'}
                </Button>
            </div>
        )
    }

    return (
        <Button asChild>
            <Link to="/auth/signin">Start Learning With AI</Link>
        </Button>
    )
}