import { ReactNode } from "react";
import Footer from "@/app/[locale]/components/general/Footer";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
