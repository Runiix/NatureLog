import Image from "next/image";
import HomeHero from "../../assets/images/HomeHero.webp";
import BackButton from "../general/BackButton";

/** Photo backdrop with a centred card, shared by sign-in and password reset. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-[100svh] items-center justify-center px-4 py-16 font-normal text-fg">
      <Image src={HomeHero} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
      <BackButton className="absolute left-4 top-4" />
      <div className="w-full max-w-md rounded-2xl border border-border-muted bg-surface p-6 shadow-overlay sm:p-8">
        {children}
      </div>
    </div>
  );
}
