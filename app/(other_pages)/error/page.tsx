import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="w-full m-auto mt-44 flex flex-col gap-10 justify-center items-center">
      <p className="text-black text-3xl">
        Es ist leider etwas schief gelaufen :/
      </p>
      <Link
        href="/loginpage"
        className="bg-green-600 text-center py-5 px-10 text-2xl sm:text-3xl rounded-lg hover:cursor-pointer hover:bg-green-700 hover:text-zinc-900 transition-all
           duration-200 shadow-md m-auto "
      >
        Zurück zur Anmeldung
      </Link>
    </div>
  );
}
