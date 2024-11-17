"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { GridLoader } from "react-spinners";
import { login, signup } from "../actions/handleLogin";

export default function AuthForm() {
  const [isNewUser, setIsNewUser] = useState(false);
  //  const [displayName, setDisplayName] = useState("");
  //  const [email, setEmail] = useState("");
  //  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [emailData, setEmailData] = useState("");
  const supabase = createClient();
  //  const router = useRouter();

  /*  useEffect(() => {
    setDisplayName(email.split("@")[0]);
  }, [email]);*/

  /* async function handleLogin(e: any) {
    e.preventDefault();
    setIsSigningIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      router.push("/homepage");
    } else {
      alert("Email or Password not correct");
      setIsSigningIn(false);
    }
  }

  function validatePassword(password: string) {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;
    return passwordRegex.test(password);
  }

  async function handleSignUp(e: any) {
    e.preventDefault();
    if (!validatePassword(password)) {
      alert(
        "Password must be at least 10 characters long and contain at least one capital letter, one number, and one special symbol."
      );
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName: displayName,
        },
      },
    });
    if (!error) {
      setIsSigningUp(true);
    } else {
      alert("Error Signing Up");
    }
  }*/

  const sendResetPassword = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        emailData,
        {
          redirectTo: "https://moment-app-8mtl.vercel.app/passwordreset",
        }
      );
    } catch (error) {
      console.error(error);
    }
    alert("Email sent successfully");
  };

  const handleEmailChange = (e: any) => {
    setEmailData(e.target.value);
  };

  let signInMessage = "Anmelden";

  if (isSigningIn) {
    signInMessage = "Sie werden angemeldet";
  } else if (isNewUser) {
    signInMessage = "Die Registrierung läuft";
  }

  const signUpMessage = (
    <p className="text-green-600">
      E-Mail versendet! Überprüfen Sie Ihr Postfach, um Ihr Passwort zu ändern.
    </p>
  );

  return (
    <div className=" z-10">
      {!resetPassword && (
        <div>
          <div className="flex flex-col  text-center mb-6 sm:mb-10  font-bold ">
            <h1 className="mb-4 text-green-600 text-5xl sm:text-6xl">
              NatureLog{" "}
            </h1>
            <h1 className="mb-4 text-slate-100 text-3xl sm:text-4xl">
              Anmeldung
            </h1>
          </div>
          <form className="flex flex-col items-center gap-5">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="E-Mail"
              className="text-slate-100 w-80 py-5 pl-3 rounded-2xl bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Passwort"
              className="text-slate-100 w-80 py-5 pl-3 rounded-2xl bg-gray-900 bg-opacity-80 border border-slate-300 text-lg hover:border-slate-100 "
            />
            <button
              formAction={isNewUser ? signup : login}
              className="bg-green-600 text-zinc-900 py-3 flex gap-4 justify-around items-center px-20  rounded-2xl hover:text-slate-100 hover:bg-green-700"
              onClick={() => setIsSigningIn(true)}
            >
              <p className="text-2xl">{signInMessage} </p>
              {isSigningIn && (
                <div className="">
                  <GridLoader color="#000000" margin={0} size={12} />{" "}
                </div>
              )}
            </button>
            <div>
              {isNewUser ? (
                <>
                  Haben Sie schon einen Account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsNewUser(false)}
                    className="underline hover:text-green-600"
                  >
                    Anmelden
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div>
                    Haben Sie noch keinen Account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsNewUser(true)}
                      className="underline hover:text-green-600"
                    >
                      Zur Registrierung
                    </button>
                  </div>
                  <p
                    className="underline hover:text-green-600 hover:cursor-pointer"
                    onClick={() => setResetPassword(!resetPassword)}
                  >
                    Passwort vergessen?
                  </p>
                </div>
              )}
            </div>
            {isSigningUp && signUpMessage}
          </form>
        </div>
      )}
      {resetPassword && (
        <div>
          <div className="min-h-screen flex flex-col gap-3 items-center justify-center text-center">
            <h1 className="text-5xl font-bold  text-slate-100">
              Passwort vergessen?
            </h1>
            <div className="flex flex-col items-center gap-4">
              <label className="mb-4 sm:mb-10">
                Geben Sie ihre E-Mail ein, um ihr Passwort zu ändern
              </label>
              <input
                type="email"
                placeholder="E-Mail"
                value={emailData}
                onChange={handleEmailChange}
                className="text-slate-100 w-80 py-5 pl-3 rounded-2xl bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
              />
              <button
                type="submit"
                className="bg-green-600 text-zinc-900 py-4 shadow-md px-10 text-2xl rounded-lg hover:text-slate-100 hover:bg-green-700"
                onClick={sendResetPassword}
              >
                E-Mail versenden
              </button>
              <p
                onClick={() => setResetPassword(!resetPassword)}
                className="underline hover:text-green-600 hover:cursor-pointer"
              >
                Zurück zur Anmeldung?
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
