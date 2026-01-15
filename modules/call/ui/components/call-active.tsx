import Link from "next/link";
import Image from "next/image";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";

interface Props {
    onLeave: () => void;
    meetingName?: string;
}

export const CallActive = ({ onLeave, meetingName }: Props) => {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="flex flex-col justify-between p-4 h-full text-white">
                <div className="bg-black rounded-full p-4 flex items-center gap-4">
                    <Link href="/" className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
                        <Image src="/favicon.ico" alt="Nexmeet Logo" width={24} height={24} />
                    </Link>
                    <h4 className="text-base">{meetingName}</h4>
                </div>
                <SpeakerLayout />
                <div className="bg-black rounded-full px-4">
                    <CallControls onLeave={onLeave} />
                </div>
            </div>
        </div>
    )
}