"use client";

import changePublicProfile from "@/app/[locale]/actions/profile/changePublicProfile";
import Switch from "@/app/[locale]/components/general/Switch";
import { Language, Public } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import DeleteUserModal from "../general/DeleteUserModal";
import LanguageSwitcher from "../general/LanguageSwitcher";
import { use } from "react";
import { useTranslations } from "next-intl";

export default function SettingsList({
  user,
  isPublic,
}: {
  user: any;
  isPublic: boolean;
}) {
  const t = useTranslations("Settings");
  const router = useRouter();
  const handleChange = () => {
    changePublicProfile(user.id, isPublic);
    router.refresh();
  };
  return (
    <div className="flex flex-col border-slate-400 border rounded-lg w-full md:w-1/2 mx-auto p-4 relative gap-6">
      <div className="flex gap-1 items-center justify-between">
        <div className="flex">
          <Public className="text-gray-900" />
          <p className="text-gray-900">{t("publicProfile")}</p>
        </div>
        <Switch value={isPublic} onChange={handleChange} />
      </div>
      <div className="flex gap-1 items-center justify-between">
        <div className="flex">
          <Language className="text-gray-900" />
          <p className="text-gray-900">{t("language")}</p>
        </div>
        <LanguageSwitcher />
      </div>
      <DeleteUserModal user={user} />
    </div>
  );
}
