"use client"

import Lottie from "lottie-react";

import blueDog from "@/public/blue_dog_walking.json";
import brownDog from "@/public/brown_dog_walking.json";
import orangeDog from "@/public/orange_dog_walking.json";

import { Marquee } from "@/components/magicui/marquee";

export function BrownDogLeft() {
    return (
        <div className="pl-[1234px]">
            <div className="w-48 h-48 transform -scale-x-100 p-7 pt-10">
                <Lottie animationData={brownDog} loop autoplay />
            </div>
        </div>
    )
}

export function OrangeDogLeft() {
    return (
        <div className="pl-[3456px]">
            <div className="w-48 h-48 transform -scale-x-100 pt-2">
                <Lottie animationData={orangeDog} loop autoplay />
            </div>
        </div>
    )
}
export function BlueDogLeft() {
    return (
        <div className="pl-[5678px]">
            <div className="w-48 h-48 transform -scale-x-100 p-7 pt-14">
                <Lottie animationData={blueDog} loop autoplay />
            </div>
        </div>
    )
}

export function BrownDogRight() {
    return (
        <div className="pr-[2345px]">
            <div className="w-48 h-48 p-7 pt-10">
                <Lottie animationData={brownDog} loop autoplay />
            </div>
        </div>
    )
}

export function OrangeDogRight() {
    return (
        <div className="pr-[4567px]">
            <div className="w-48 h-48 pt-2">
                <Lottie animationData={orangeDog} loop autoplay />
            </div>
        </div>
    )
}
export function BlueDogRight() {
    return (
        <div className="pr-[6789px]">
            <div className="w-48 h-48 p-7 pt-14">
                <Lottie animationData={blueDog} loop autoplay />
            </div>
        </div>
    )
}

export default function MarqueeDemo() {
    return (
        <div className="flex w-full flex-col items-center justify-center overflow-hidden fixed bottom-14 right-0 left-0 -z-50 dark:opacity-70">
            <Marquee className="[--duration:900s] fixed pointer-events-none">
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
            </Marquee>
            <Marquee reverse className="[--duration:960s] fixed pointer-events-none">
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
            </Marquee>
            <Marquee className="[--duration:1020s] fixed pointer-events-none">
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
                <BrownDogLeft />
                <BlueDogLeft />
                <OrangeDogLeft />
            </Marquee>
            <Marquee reverse className="[--duration:1080s] fixed pointer-events-none">
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
                <OrangeDogRight />
                <BlueDogRight />
                <BrownDogRight />
            </Marquee>
        </div>
    );
}
