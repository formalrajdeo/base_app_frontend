// app/components/AnimatedAvatarGroup.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "../animate-ui/primitives/animate/avatar-group";
import { AvatarGroupTooltip } from "../animate-ui/components/animate/avatar-group";

const AVATARS = [
    { src: "https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg", fallback: "SK", tooltip: "Skyleen" },
    { src: "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg", fallback: "CN", tooltip: "Shadcn" },
    { src: "https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg", fallback: "AW", tooltip: "Adam Wathan" },
    { src: "https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg", fallback: "GR", tooltip: "Guillermo Rauch" },
    { src: "https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg", fallback: "JH", tooltip: "Jhey" },
];

export function AnimatedAvatarGroup() {
    return (
        <AvatarGroup translate="-20%" invertOverlap>
            {AVATARS.map((avatar, idx) => (
                <Avatar key={idx} className="w-12 h-12 border-2 border-background">
                    <AvatarImage src={avatar.src} />
                    <AvatarFallback>{avatar.fallback}</AvatarFallback>
                    <AvatarGroupTooltip>{avatar.tooltip}</AvatarGroupTooltip>
                </Avatar>
            ))}
        </AvatarGroup>
    );
}