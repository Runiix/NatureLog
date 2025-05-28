"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CircleLoader } from "react-spinners";
import { login, signup } from "../../actions/auth/handleLogin";

export default function AuthForm() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [emailData, setEmailData] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [regsisterSuccess, setRegisterSuccess] = useState(false);
  const supabase = createClient();

  const sendResetPassword = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        emailData,
        {
          redirectTo: "https://naturelog.de/passwordreset",
        }
      );
    } catch (error) {
      console.error(error);
    }
    alert("E-Mail erfolgreich versendet!");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData(e.target.value);
  };

  let signInMessage = "Anmelden";

  if (isSigningIn && isNewUser) {
    signInMessage = "Die Registirerung läuft";
  } else if (isSigningIn) {
    signInMessage = "Sie werden angemeldet";
  } else if (isNewUser) {
    signInMessage = "Registrieren";
  }

  const signUpMessage = (
    <p className="text-green-600">
      E-Mail versendet! Überprüfen Sie Ihr Postfach, um Ihr Passwort zu ändern.
    </p>
  );

  const handleLogin = async (formData: FormData) => {
    const { error } = await login(formData);
    if (error) setLoginError(true);
    setIsSigningIn(false);
  };

  const handleSignUp = async (formData: FormData) => {
    const { validationError, usernameError, success } = await signup(formData);
    if (validationError) setValidationError(true);
    if (usernameError) setUsernameError(true);
    if (success) setRegisterSuccess(true);
    setIsSigningIn(false);
    setIsNewUser(false);
  };
  const handleFormChangeToLogin = () => {
    setIsNewUser(false);
    if (validationError) setValidationError(false);
  };
  const handleFormChangeToSignUp = () => {
    setIsNewUser(true);
    if (loginError) setLoginError(false);
  };

  return (
    <div className=" z-10">
      {!resetPassword && (
        <div>
          <div className="flex flex-col  text-center mb-6 sm:mb-10  font-bold ">
            <h1 className="mb-4 text-green-600 text-5xl sm:text-6xl">
              NatureLog{" "}
            </h1>
            <h1 className="mb-4 text-slate-100 text-3xl sm:text-4xl">
              {isNewUser ? "Registrierung" : "Anmeldung"}
            </h1>
            {loginError && (
              <h2 className="text-red-500">
                Ihre E-Mail oder Passwort sind nicht korrekt!
              </h2>
            )}
            {validationError && (
              <div className=" mx-5 text-start bg-gray-900 border bg-opacity-80 border-slate-300 rounded-lg p-2 text-xs">
                <h2 className="font-bold ">
                  Ihr Passwort muss folgende Anforderungen erfüllen:
                </h2>
                <ul className="text-start text-red-500">
                  <li>mindestens 10 Zeichen</li>
                  <li>mindestens 1 kleinen Buchstaben</li>
                  <li>mindestens 1 großen Buchstaben</li>
                  <li>mindestens 1 Zahl</li>
                  <li>mindestens 1 Sonderzeichen</li>
                </ul>
              </div>
            )}
            {usernameError && (
              <h2 className="text-red-500">
                Der Benutzername ist bereits vergeben!
              </h2>
            )}
            {regsisterSuccess && (
              <h2 className="text-green-600 bg-gray-900 bg-opacity-70 p-1 rounded-lg">
                Eine E-Mail zur Bestätigung Ihres Accounts wurde an die von
                Ihnen angegeben E-Mail Adresse gesendet!
              </h2>
            )}
          </div>
          <form className="flex flex-col items-center gap-5">
            {isNewUser && (
              <input
                pattern="\S*"
                id="username"
                onInvalid={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity(
                    "Benutzername darf keine Leerzeichen enthalten"
                  );
                  setIsSigningIn(false);
                }}
                onInput={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity("");
                }}
                name="username"
                type="text"
                placeholder="Benutzername"
                required
                className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
              />
            )}
            <input
              id="email"
              name="email"
              type="email"
              onInvalid={() => setIsSigningIn(false)}
              required
              placeholder="E-Mail"
              className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Passwort"
              className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 bg-opacity-80 border border-slate-300 text-lg hover:border-slate-100 "
            />
            <button
              formAction={isNewUser ? handleSignUp : handleLogin}
              className="bg-green-600 hover:text-gray-900 py-3 flex gap-4 justify-around items-center px-20 rounded-lg hover:bg-green-700 transition-all duration-200"
              onClick={() => setIsSigningIn(true)}
              aria-label="Anmelden oder Registrieren"
            >
              <p className="text-2xl">{signInMessage} </p>
              {isSigningIn && (
                <div className="">
                  <CircleLoader color="#000000" size={12} />{" "}
                </div>
              )}
            </button>
            <div>
              {isNewUser ? (
                <>
                  Haben Sie schon einen Account?{" "}
                  <button
                    type="button"
                    onClick={handleFormChangeToLogin}
                    className="underline hover:text-green-600 transition-all duration-200"
                    aria-label="Form zu Anmeldungsform ändern"
                  >
                    Anmelden
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-center justify-center">
                  <div>
                    Haben Sie noch keinen Account?{" "}
                    <button
                      type="button"
                      onClick={handleFormChangeToSignUp}
                      className="underline hover:text-green-600 transition-all duration-200"
                      aria-label="Form zu Registrierungsform ändern"
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
                Geben Sie ihre Konto E-Mail ein. <br /> Sie erhalten einen Link
                zur Änderung Ihres Passworts
              </label>
              <input
                type="email"
                placeholder="E-Mail"
                value={emailData}
                onInvalid={() => setIsSigningIn(false)}
                required
                onChange={handleEmailChange}
                className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
              />
              <button
                type="submit"
                className="bg-green-600 text-gray-900 py-4 shadow-md px-10 text-2xl rounded-lg hover:text-slate-100 hover:bg-green-700"
                onClick={sendResetPassword}
                aria-label="Passwort Änderungsvorgang starten"
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
