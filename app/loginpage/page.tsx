import Image from "next/image";
import HomeHero from "../assets/images/HomeHero.jpg";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import { login, signup } from "../actions/handleLogin";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-slate-100 bg-opacity-50">
      <Link
        className="absolute left-5 top-5 z-10"
        href="/"
        aria-label="navigate back to landing page"
      >
        <ArrowBack className="text-slate-100 text-4xl hover:text-green-600 bg-gray-900 bg-opacity-50 rounded-full" />
      </Link>
      <div>
        <Image
          src={HomeHero}
          alt="hero banner"
          className="absolute top-0 left-0 object-cover w-screen h-screen opacity-80 -z-10"
        />
      </div>
      <div className="absolute bottom-0 right-0 text-[0.5rem] sm:text-xs opacity-50">
        Image by{" "}
        <a href="https://www.freepik.com/free-photo/dark-vip-cinema-studio-still-life_29015232.htm#query=dark%20movie%20theater&position=3&from_view=keyword&track=ais&uuid=148a6bf7-e535-4ee8-a91b-7a0b1ba24b95">
          Freepik
        </a>
      </div>
      <AuthForm />
    </div>
  );
}
