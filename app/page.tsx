import Image from "next/image";
import Link from "next/link";
import Nav from "./components/Nav";
import HomeHero from "./assets/images/HomeHero.jpg";
import { createClient } from "@/utils/supabase/server";
import LandingInfo from "./components/LandingInfo";
import Placeholder from "./assets/images/Placeholder.jpg";

const getUser = async (supabase: any) => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
};

export default async function page() {
  const supabase = await createClient();

  const user = await getUser(supabase);
  return (
    <main className="bg-gray-900 bg-opacity-50 w-screen">
      <Nav user={user} />
      <section className="h-screen w-screen flex flex-col items-center justify-center gap-10 shadow-md shadow-gray-700 ">
        <Image
          src={HomeHero}
          alt=" Forrest Home Hero"
          height={900}
          width={1920}
          className="absolute w-screen h-screen object-cover -z-10 "
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
            <h1 className="text-4xl sm:text-6xl">Wilkommen bei </h1>
            <h1 className="text-green-600 text-4xl sm:text-6xl"> NatureLog</h1>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-center mx-10 sm:mx-20 text-xs sm:text-base">
            Melde dich an, um deine Naturbeobachtungen deine Naturbeobachtungen
            zu organisieren und mit Anderen zu teilen
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
      <section className="bg-slate-200 w-screen">
        <LandingInfo
          src={Placeholder}
          position="left"
          title="Das Lexikon"
          text="Entdecke unsere heimische Tierwelt, durch Filter und die Suchfunktion ganz einfach"
        />
      </section>
    </main>
  );
}
