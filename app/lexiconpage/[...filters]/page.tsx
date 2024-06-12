import Nav from "../../components/Nav";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import LexiconGrid from "@/app/components/LexiconGrid";

export default async function LexiconPage(params: any) {
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
  return (
    <main className=" bg-gray-200">
      <Nav />
      <section className="flex flex-col items-center w-full">
        <h2 className="text-green-600 text-center text-6xl mt-24 mb-16">
          Arten-Lexikon{" "}
        </h2>
        <LexiconGrid filters={params.params.filters} params={params} />
      </section>
    </main>
  );
}
