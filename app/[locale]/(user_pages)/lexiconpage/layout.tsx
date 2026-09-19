import { ReactNode } from "react";
import LexiconFilter from "@/app/[locale]/components/lexicon/LexiconFilter";
import LexiconFilterNav from "@/app/[locale]/components/lexicon/LexiconFilterNav";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getUser } from "@/app/[locale]/utils/data";
import { createClient } from "@/utils/supabase/server";

export default async function LexiconLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  return (
    <PageShell className="max-w-7xl">
      <div className="flex gap-8">
        <LexiconFilterNav>
          <LexiconFilter user={user} />
        </LexiconFilterNav>
        <div className="flex min-w-0 flex-1 flex-col gap-6 pb-20 lg:pb-0">{children}</div>
      </div>
    </PageShell>
  );
}
