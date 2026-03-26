import Footer from "@/app/components/general/Footer";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10">
      <section className="mx-auto w-full">{children}</section>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
