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
        className="absolute left-5 top-5 z-10 text-slate-100 p-2 hover:text-green-600 bg-gray-900 bg-opacity-50 rounded-full"
        href="/"
        aria-label="navigate back to landing page"
      >
        {" "}
        &lt; zurück zur Landingpage
      </Link>
      <div>
        <Image
          src={HomeHero}
          alt="hero banner"
          className="absolute top-0 left-0 object-cover w-screen h-screen opacity-80 -z-10"
        />
      </div>
      <AuthForm />
    </div>
  );
}
