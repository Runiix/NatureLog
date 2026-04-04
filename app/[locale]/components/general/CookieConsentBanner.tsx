"use client";
import CookieConsent from "react-cookie-consent";
import Link from "next/link";

export default function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Alle erlauben"
      declineButtonText="Ablehnen"
      enableDeclineButton
      cookieName="NaturteLogCookieConsent"
      style={{ background: "#E5E7EB", color: "#111", padding: "20px" }}
      buttonStyle={{
        backgroundColor: "#16A34A",
        color: "#FFF",
        fontSize: "14px",
        borderRadius: "5px",
      }}
      declineButtonStyle={{
        backgroundColor: "#f44336",
        color: "#FFF",
        fontSize: "14px",
        borderRadius: "5px",
      }}
      expires={365} // Number of days before the cookie expires
      onAccept={() => {
        // Add functionality when user accepts cookies
      }}
      onDecline={() => {
        // Add functionality when user declines cookies
      }}
    >
      This website uses cookies to enhance your experience. By using our
      website, you consent to the use of cookies. You can read more in our{" "}
      <Link href="/privacy-policy" className="underline hover:text-green-600">
        privacy policy
      </Link>
      .
    </CookieConsent>
  );
}
