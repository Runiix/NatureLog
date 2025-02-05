import Image, { StaticImageData } from "next/image";
export default function LandingInfo({
  src,
  position,
  title,
  text,
}: {
  src: StaticImageData;
  position: "left" | "right";
  title: string;
  text: string;
}) {
  if (position === "right") {
    return (
      <div className="flex items-center justify-around w-full">
        <div>{text}</div>
        <Image
          src={src}
          alt=""
          width={500}
          height={500}
          className="rounded-lg"
        />
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-around w-screen ">
        {" "}
        <Image
          src={src}
          alt=""
          width={500}
          height={500}
          className="rounded-2xl w-1/2 mask-fade-circle object-cover"
        />
        <div className="">
          <h2 className="text-xl sm:text-3xl  text-gray-900">{title} </h2>
          <p className="text-xs sm:text-base text-gray-800">{text}</p>
        </div>
      </div>
    );
  }
}
