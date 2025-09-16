import { Album, Image, ImagePlus, Brush } from "lucide-react";

export const links = [
    {
        metadata: "https://pixabay.com/",
        name: "Pixabay",
        icon: <Image className="text-foreground" strokeWidth={1} />,
    },
    {
        metadata: "https://www.pexels.com/",
        name: "Pexels",
        icon: <ImagePlus className="text-foreground" strokeWidth={1} />,
    },
    {
        metadata: "https://excalidraw.com/",
        name: "Excalidraw",
        icon: <Brush className="text-foreground" strokeWidth={1} />,
    },
    {
        metadata: "https://www.wikipedia.org/",
        name: "Wiki",
        icon: <Album className="text-foreground" strokeWidth={1} />,
    },
];
