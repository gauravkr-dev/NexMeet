import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { CircleUser, CreditCard, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const DashboardUserButton = () => {
    const isMobile = useIsMobile();
    const router = useRouter();
    const { data, isPending } = authClient.useSession();

    const handleSignOut = () => authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                router.push("/sign-in");
                toast.success("Successfully signed out!");
            }

        }
    });

    if (isPending || !data?.user) {
        return null;
    }

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger className="rounded-lg hover:bg-gray-100 px-3 py-2 w-full flex items-center">
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
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <div className="flex items-center">
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
                        </div>
                    </DrawerHeader>
                    <div className="px-4 pb-6 space-y-1">
                        <button
                            type="button"
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={() => router.push("/profile")}
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </button>
                        <button
                            type="button"
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={() => router.push("/upgrade")}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                        </button>
                        <div className="border-t border-gray-200 my-2" />
                        <Button
                            variant='ghost'
                            type="button"
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Sign Out</span>
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-lg hover:bg-gray-100 px-3 py-2 w-full flex items-center">
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
                    className="text-red-600"
                    onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}