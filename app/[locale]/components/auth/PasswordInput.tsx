"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { forwardRef, useState } from "react";
import { Input } from "../ui/Field";

/** Password input with a show/hide toggle that is a real, labelled button. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(function PasswordInput(props, ref) {
  const t = useTranslations("Auth");
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </button>
    </div>
  );
});
