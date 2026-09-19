"use client";

import { Add } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import addAnimalList from "@/app/[locale]/actions/animallists/addAnimalList";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import ListForm from "./ListForm";

/**
 * Client island for the page header: the header itself stays a server
 * component, only the button and its dialog need state.
 */
export default function CreateListButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const t = useTranslations("Lists");
  const toast = useToast();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<Add />} variant={variant} onClick={() => setOpen(true)}>
        {t("create")}
      </Button>
      {open && (
        <Modal title={t("createTitle")} closeModal={() => setOpen(false)}>
          <ListForm
            mode="create"
            onCancel={() => setOpen(false)}
            onSubmit={async (values) => {
              const result = await addAnimalList({
                title: values.title,
                description: values.description,
                publicList: values.publicList,
                lat: values.location?.lat ?? null,
                lng: values.location?.lng ?? null,
              });
              if (result.success) {
                setOpen(false);
                // addAnimalList revalidates this page, so the new list
                // arrives with the action's response; no refresh needed.
                toast(t("toast.created"));
              }
              return result;
            }}
          />
        </Modal>
      )}
    </>
  );
}
