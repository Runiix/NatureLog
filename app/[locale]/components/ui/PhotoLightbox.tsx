"use client";

import Image, { type StaticImageData } from "next/image";
import Modal from "../general/Modal";

/** Full-size photo in an accessible dialog (Escape, focus trap, backdrop close). */
export function PhotoLightbox({
  src,
  alt,
  label,
  onClose,
}: {
  src: string | StaticImageData;
  alt: string;
  /** Dialog name for screen readers. */
  label: string;
  onClose: () => void;
}) {
  return (
    <Modal
      label={label}
      closeModal={onClose}
      styles="max-w-5xl bg-surface-sunken p-2 pt-12 sm:p-3 sm:pt-12"
    >
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={1280}
        unoptimized
        className="max-h-[80vh] w-full rounded-lg object-contain"
      />
    </Modal>
  );
}
