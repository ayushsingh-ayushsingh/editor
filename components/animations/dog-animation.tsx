"use client"

import Lottie from "lottie-react";

import blueDog from "@/public/blue_dog_walking.json";
import brownDog from "@/public/brown_dog_walking.json";
import orangeDog from "@/public/orange_dog_walking.json";

import { Marquee } from "@/components/magicui/marquee";

export default function MarqueeDemo() {
    return (
        <div className="flex w-full flex-col items-center justify-center overflow-hidden fixed bottom-14 right-0 left-0 -z-50 dark:opacity-70">
            <Marquee className="[--duration:120s] fixed pointer-events-none">
                <div className="pl-[5000px]">
                    <div className="w-48 h-48 transform -scale-x-100 p-7 pt-10">
                        <Lottie animationData={brownDog} loop autoplay />
                    </div>
                </div>
                <div className="pl-[5000px]">
                    <div className="w-48 h-48 transform -scale-x-100 pt-2">
                        <Lottie animationData={orangeDog} loop autoplay />
                    </div>
                </div>
                <div className="pl-[5000px]">
                    <div className="w-48 h-48 transform -scale-x-100 p-7 pt-14">
                        <Lottie animationData={blueDog} loop autoplay />
                    </div>
                </div>
                <div className="w-[100vw]"></div>
            </Marquee>
            <Marquee reverse className="[--duration:120s] fixed pointer-events-none">
                <div className="w-[100vw]"></div>
                <div className="pr-[5000px]">
                    <div className="w-48 h-48 pt-2">
                        <Lottie animationData={orangeDog} loop autoplay />
                    </div>
                </div>
                <div className="pr-[5000px]">
                    <div className="w-48 h-48 p-7 pt-10">
                        <Lottie animationData={brownDog} loop autoplay />
                    </div>
                </div>
                <div className="pr-[5000px]">
                    <div className="w-48 h-48 p-7 pt-14">
                        <Lottie animationData={blueDog} loop autoplay />
                    </div>
                </div>
            </Marquee>
        </div>
    );
}
