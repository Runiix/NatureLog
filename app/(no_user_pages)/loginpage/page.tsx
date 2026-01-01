import Image from "next/image";
import HomeHero from "../../assets/images/HomeHero.webp";
import AuthForm from "../../components/auth/AuthForm";
import BackButton from "@/app/components/general/BackButton";

export default function LoginPage() {
  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center text-slate-100 bg-opacity-50">
      <BackButton />
      <Image
        src={HomeHero}
        alt="hero banner"
        className="absolute top-0 left-0 object-cover w-screen h-screen opacity-80 -z-10"
      />
      <AuthForm />
    </div>
  );
}
