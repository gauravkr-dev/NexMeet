import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { CircleUser, CreditCard, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export const DashboardUserButton = () => {
    const router = useRouter();
    const { data, isPending } = authClient.useSession();

    if (isPending || !data?.user) {
        return null;
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-lg border border-gray-300 px-3 py-2 w-full flex items-center">
                {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                    </Avatar>
                ) : (
                    <Avatar className="items-center">
                        <CircleUser size={28} />
                    </Avatar>
                )}
                <div className="flex flex-col items-start ml-3 text-left">
                    <p className="text-sm font-medium truncate">{data.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{data.user.email}</p>
                </div>

            </DropdownMenuTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuContent className="w-56 ml-2" align="end" side="right" forceMount>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/upgrade")}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => authClient.signOut({
                        fetchOptions: {
                            onSuccess: () => router.push('/sign-in'),
                        }
                    })}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}