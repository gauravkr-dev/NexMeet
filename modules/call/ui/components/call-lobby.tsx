import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { generatedAvatarUri } from "@/lib/avatar";
import { DefaultVideoPlaceholder, StreamVideoParticipant, ToggleAudioPreviewButton, ToggleVideoPreviewButton, useCallStateHooks, VideoPreview } from "@stream-io/video-react-sdk";
import { LogInIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    onJoin: () => void;
}

export const CallLobby = ({ onJoin }: Props) => {
    const { useCameraState, useMicrophoneState } = useCallStateHooks();
    const { hasBrowserPermission: hasCameraPermissions } = useCameraState();
    const { hasBrowserPermission: hasMicrophonePermissions } = useMicrophoneState();

    const DisabledVideoPreview = () => {
        const { data } = authClient.useSession();
        return <DefaultVideoPlaceholder
            participant={
                {
                    name: data?.user.name ?? "",
                    image: data?.user.image ?? generatedAvatarUri({
                        seed: data?.user.name ?? "",
                        variant: "initials"
                    })
                } as StreamVideoParticipant
            }
        />
    }

    const AllowBrowserPermissions = () => {
        return (
            <p className="text-sm">
                Please grant your browser a permission to access your camera and microphone to join the call.
            </p>
        )
    }
    const hasBrowserMediaPermissions = hasCameraPermissions && hasMicrophonePermissions;
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <div className="py-2 px-8 flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-y-6 max-h-[90vh] bg-background rounded-lg p-10 shadow-sm">
                        <div className="flex flex-col gap-y-2 text-center">
                            <h6 className="text-lg font-medium">Ready to join</h6>
                            <p className="text-sm">Set up your call before joining</p>
                        </div>
                        <VideoPreview
                            DisabledVideoPreview={
                                hasBrowserMediaPermissions ? DisabledVideoPreview : AllowBrowserPermissions
                            } />
                        <div className="flex gap-x-2">
                            <ToggleAudioPreviewButton />
                            <ToggleVideoPreviewButton />
                        </div>
                        <div className="flex gap-x-2 justify-between w-full">
                            <Button>
                                <Link href="/meetings">
                                    Cancel
                                </Link>

                            </Button>
                            <Button onClick={onJoin} disabled={!hasBrowserMediaPermissions} >
                                <LogInIcon />
                                Join Call
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

