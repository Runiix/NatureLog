"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AdminPanelSettings,
  AutoStories,
  Close,
  Collections,
  Home,
  Login,
  Map,
  Menu,
  Person,
  PowerSettingsNew,
  Settings,
  Summarize,
} from "@mui/icons-material";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { cn } from "@/app/[locale]/utils/cn";
import GlobalSearch from "./GlobalSearch";

type NavItem = { href: string; label: string; icon: React.ReactNode };

/** Closes a popover on Escape or on a click outside `ref`. */
function useDismiss(
  open: boolean,
  close: () => void,
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close, ref]);
}

const linkBase =
  "flex items-center gap-1.5 rounded-md px-2 py-1 text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function NavLink({
  item,
  active,
  onNavigate,
  className,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        linkBase,
        active && "font-semibold text-accent-text hover:text-accent-text",
        className,
      )}
    >
      <span aria-hidden className="flex [&_svg]:h-5 [&_svg]:w-5">
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

function SignOutButton() {
  const t = useTranslations("Navigation");
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-solid/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <PowerSettingsNew fontSize="small" aria-hidden />
        {t("logout")}
      </button>
    </form>
  );
}

const panel =
  "absolute right-0 top-full mt-2 flex min-w-[14rem] flex-col gap-1 rounded-xl border border-border-muted bg-surface p-2 text-base font-normal text-fg shadow-raised";

export default function Nav({
  user,
  isAdmin = false,
}: {
  user: User | null;
  isAdmin?: boolean;
}) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => setMenuOpen(false);
  const closeAccount = () => setAccountOpen(false);
  useDismiss(menuOpen, closeMenu, menuRef);
  useDismiss(accountOpen, closeAccount, accountRef);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const name = user?.user_metadata.displayName as string | undefined;

  const primary: NavItem[] = user
    ? [
        { href: "/homepage", label: t("home"), icon: <Home /> },
        {
          href: `/collectionpage/${name}`,
          label: t("collection"),
          icon: <Collections />,
        },
        { href: "/lexiconpage", label: t("lexicon"), icon: <AutoStories /> },
        {
          href: `/animallistspage/${name}`,
          label: t("lists"),
          icon: <Summarize />,
        },
        { href: "/animallistspage/map", label: t("map"), icon: <Map /> },
      ]
    : [{ href: "/lexiconpage", label: t("lexicon"), icon: <AutoStories /> }];

  const account: NavItem[] = user
    ? [
        { href: `/profilepage/${name}`, label: t("profile"), icon: <Person /> },
        { href: "/settingspage", label: t("settings"), icon: <Settings /> },
        ...(isAdmin
          ? [{ href: "/adminpage", label: t("admin"), icon: <AdminPanelSettings /> }]
          : []),
      ]
    : [];

  return (
    <nav
      aria-label="NatureLog"
      className="fixed inset-x-0 top-0 z-50 flex h-10 items-center border-b border-border-muted bg-canvas/95 font-normal backdrop-blur supports-[backdrop-filter]:bg-canvas/80 sm:h-16"
    >
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            href={user ? "/homepage" : "/"}
            className="rounded-md text-xl font-bold tracking-tight text-accent-text transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-3xl"
          >
            NatureLog
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            {primary.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GlobalSearch signedIn={!!user} />
          {user ? (
            <div ref={accountRef} className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                className={cn(
                  linkBase,
                  "text-fg",
                  accountOpen && "text-accent-text",
                )}
              >
                <Person aria-hidden />
                <span className="hidden xl:inline">{name}</span>
                <span className="sr-only xl:hidden">{t("profile")}</span>
              </button>
              {accountOpen && (
                <div className={panel}>
                  {account.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                      onNavigate={closeAccount}
                      className="px-3 py-2"
                    />
                  ))}
                  <div className="mt-1 border-t border-border-muted pt-2">
                    <SignOutButton />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/loginpage"
              className="hidden items-center gap-1.5 rounded-lg bg-accent-solid px-4 py-1.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:flex"
            >
              <Login fontSize="small" aria-hidden />
              {t("login")}
            </Link>
          )}

          <div
            ref={menuRef}
            className={cn("relative", user ? "lg:hidden" : "sm:hidden")}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="nav-menu"
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              className="flex rounded-md p-1 text-fg transition-colors hover:text-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {menuOpen ? <Close /> : <Menu />}
            </button>
            {menuOpen && (
              <div id="nav-menu" className={panel}>
                {[...primary, ...account].map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                    onNavigate={closeMenu}
                    className="px-3 py-2"
                  />
                ))}
                <div className="mt-1 border-t border-border-muted pt-2">
                  {user ? (
                    <SignOutButton />
                  ) : (
                    <Link
                      href="/loginpage"
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-2 rounded-lg bg-accent-solid px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
                    >
                      <Login fontSize="small" aria-hidden />
                      {t("login")}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
