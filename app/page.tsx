import Image from "next/image";
import Link from "next/link";
import Nav from "./components/general/Nav";
import HomeHero from "./assets/images/HomeHero.webp";
import { createClient } from "@/utils/supabase/server";
import LandingInfo from "./components/landing/LandingInfo";
import Lexikon from "./assets/images/Lexikon.png";
import Sammlung from "./assets/images/Sammlung.png";
import Profil from "./assets/images/Profil.png";
import Community from "./assets/images/community.png";
import Footer from "./components/general/Footer";
import { getUser } from "@/app/utils/data";

export default async function page() {
  const supabase = await createClient();

  const LandingInfoData = [
    {
      src: Lexikon,
      position: "left" as "right" | "left",
      titel: "Das Lexikon",
      text: "Entdecke unsere heimische Tierwelt - durch Filter und die Suchfunktion ganz einfach.",
    },
    {
      src: Sammlung,
      position: "right" as "right" | "left",
      titel: "Die Sammlung",
      text: "Tracke deine Sichtungen und lade dein Lieblingsfoto für jede Art hoch.",
    },
    {
      src: Profil,
      position: "left" as "right" | "left",
      titel: "Das Profil",
      text: "Lade ein Profilblid hoch, wähle ein Team aus und lade deine Lieblingsfotos hoch.",
    },
    {
      src: Community,
      position: "right" as "right" | "left",
      titel: "Interagiere mit der Community",
      text: "Sieh dir an, welche Arten andere bereits gesichtet haben, und entdecke ihre Profile.",
    },
  ];

  const user = await getUser(supabase);
  return (
    <main className="bg-gray-900 bg-opacity-50 w-full">
      <Nav user={user} />
      <section className="h-screen w-full flex flex-col items-center justify-center gap-10 shadow-md shadow-gray-700 ">
        <Image
          src={HomeHero}
          alt=" Forrest Home Hero"
          height={800}
          width={1200}
          className="absolute w-screen h-screen object-cover -z-10 "
          priority
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
            <h1 className="text-4xl sm:text-6xl">Wilkommen bei </h1>
            <h1 className="text-green-600 text-4xl sm:text-6xl"> NatureLog</h1>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-center mx-10 sm:mx-20 text-xs sm:text-base">
            Melde dich an, um deine Naturbeobachtungen zu organisieren und mit
            Anderen zu teilen
          </p>
          <Link
            href="/loginpage"
            className="bg-green-600 text-center py-5 px-10 text-2xl sm:text-3xl rounded-lg hover:cursor-pointer hover:bg-green-700 hover:text-zinc-900 transition-all
           duration-200 shadow-md"
          >
            Zur Anmeldung
          </Link>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-center px-10 sm:mx-20 text-xs sm:text-base">
            Oder entdecke unsere heimische Tierwelt als extensives Lexikon
          </p>
          <Link
            href="/lexiconpage"
            className="bg-green-600 text-center py-5 px-10  text-2xl sm:text-3xl rounded-lg hover:cursor-pointer hover:bg-green-700 hover:text-zinc-900 transition-all
           duration-200 shadow-md"
          >
            Zum Lexikon
          </Link>
        </div>
      </section>
      <section className="bg-slate-200 w-full max-w-screen overflow-hidden px-0 mx-0">
        {LandingInfoData.map((info) => (
          <LandingInfo
            key={info.titel}
            src={info.src}
            position={info.position}
            title={info.titel}
            text={info.text}
          />
        ))}
      </section>
      <Footer />
    </main>
  );
}
