import { ErrorOutline, Login } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "../../components/ui/Button";

/** Generic "something went wrong" page for auth redirects. */
export default async function ErrorPage() {
  const t = await getTranslations("ErrorPage");
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 font-normal text-fg">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger [&_svg]:h-8 [&_svg]:w-8"
        >
          <ErrorOutline />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-fg-muted">{t("somethingWentWrong")}</p>
        <ButtonLink href="/loginpage" icon={<Login />}>
          {t("backToLogin")}
        </ButtonLink>
      </div>
    </div>
  );
}
