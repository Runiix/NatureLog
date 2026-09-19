import { ArrowForward, FormatListBulleted, ThumbUp } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ProfileList } from "@/app/[locale]/utils/profile-queries";
import { Card } from "../ui/Card";
import { ButtonLink } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

export default async function ProfileAnimalLists({
  data,
  username,
  isOwner,
}: {
  data: ProfileList[];
  username: string;
  isOwner: boolean;
}) {
  const [t, tl] = await Promise.all([getTranslations("Profile"), getTranslations("Lists")]);
  const listsHref = `/animallistspage/${username}`;

  return (
    <section aria-labelledby="profile-lists" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="profile-lists" className="text-xl font-semibold tracking-tight">
          {t("publicLists")}
        </h2>
        {data.length > 0 && (
          <ButtonLink href={listsHref} variant="link" icon={<ArrowForward />} iconPosition="end">
            {t("allLists")}
          </ButtonLink>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={<FormatListBulleted />}
          title={isOwner ? t("noListsOwnerTitle") : t("noListsVisitorTitle")}
          description={isOwner ? t("noListsOwnerText") : undefined}
          action={
            isOwner ? (
              <ButtonLink href={listsHref} variant="secondary">
                {t("createList")}
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {data.map((list) => (
            <li key={list.id}>
              <Card
                as={Link}
                href={`${listsHref}?listId=${list.id}`}
                interactive
                className="flex h-full flex-col gap-2"
              >
                <h3 className="line-clamp-2 font-semibold leading-snug">
                  {list.title || tl("untitled")}
                </h3>
                {list.description && (
                  <p className="line-clamp-2 text-sm text-fg-muted">{list.description}</p>
                )}
                <div className="mt-auto flex items-center gap-4 pt-2 text-sm text-fg-subtle">
                  <span className="flex items-center gap-1">
                    <ThumbUp aria-hidden fontSize="inherit" />
                    {t("upvotes", { count: list.upvotes })}
                  </span>
                  <span>{tl("entries", { count: list.entry_count })}</span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
