import Image from "next/image";
import Link from "next/link";
import Nav from "./components/Nav";
import HomeHero from "./assets/images/HomeHero.jpg";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const getUser = async (supabase: any) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    console.log("USER:", user);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default async function page() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );
  const user = await getUser(supabase);
  return (
    <main className="bg-gray-900 bg-opacity-50">
      <Nav user={user} />
      <section className="h-screen flex flex-col items-center justify-center gap-10">
        <Image
          src={HomeHero}
          alt=" Forrest Home Hero"
          height={900}
          width={1920}
          className="absolute w-screen h-screen object-cover -z-10"
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
          <p className="text-center mx-10 sm:mx-20 text-xs sm:text-base">
            Oder entdecke unsere heimische Tierwelt als extensives Lexikon
          </p>
          <Link
            href="/lexiconpage/all/all/0/1000/common_name/true"
            className="bg-green-600 text-center py-5 px-10  text-2xl sm:text-3xl rounded-lg hover:cursor-pointer hover:bg-green-700 hover:text-zinc-900 transition-all
           duration-200 shadow-md"
          >
            Zum Lexikon
          </Link>
        </div>
      </section>
      <section></section>
    </main>
  );
}
