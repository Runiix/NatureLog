import Image from "next/image";
import Link from "next/link";
import Nav from "./components/Nav";
import HomeHero from "./assets/images/HomeHero.jpg";

export default function page() {
  return (
    <main className="bg-gray-900 bg-opacity-50">
      <section className="h-screen flex flex-col items-center justify-center gap-10">
        <Image
          src={HomeHero}
          alt=" Forrest Home Hero"
          height={900}
          width={1920}
          className="absolute w-screen h-screen object-cover -z-10"
        />
        <div className="flex flex-col gap-6">
          <div className="flex gap-4 justify-center items-center">
            <h1 className="text-6xl">Wilkommen bei </h1>
            <h1 className="text-green-600 text-6xl"> NatureLog</h1>
          </div>
          <p className="text-center">
            Organisiere deine Naturbeobachtungen und teile sie mit anderen
          </p>
        </div>
        <Link
          href="/loginpage"
          className="bg-green-600 text-center py-5 px-10 text-3xl rounded-lg hover:cursor-pointer hover:bg-green-700 hover:text-zinc-900 transition-all
           duration-200 shadow-md"
        >
          Zur Anmeldung
        </Link>
      </section>
      <section></section>
    </main>
  );
}
