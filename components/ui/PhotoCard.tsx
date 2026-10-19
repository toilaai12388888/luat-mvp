import React from "react";
import Image from "next/image";

interface PhotoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  height?: number | string;
  isSoon?: boolean;
  objectPosition?: string;
  children?: React.ReactNode;
}

export function PhotoCard({
  src,
  alt,
  height = 112,
  isSoon = false,
  objectPosition = "center",
  className = "",
  children,
  ...props
}: PhotoCardProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{ height }}
      {...props}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        className={`object-cover ${isSoon ? "grayscale contrast-[0.85]" : ""}`}
        style={{ objectPosition }}
      />
      <div className="photo-shade absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white z-10">
        {children}
      </div>
    </div>
  );
}