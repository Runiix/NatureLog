import { getTranslations } from "next-intl/server";
import Image from "next/image";
import BackButton from "../general/BackButton";

/**
 * Full-width hero photo for a species, with the photographer and licence
 * credited visibly (the credit used to be rendered at opacity-0, i.e. never
 * shown — which the image licences require).
 */
export default async function AnimalBanner({
  image,
  alt,
  credit_link,
  credit_text,
  license_link,
  license_text,
}: {
  image: string | null;
  alt: string;
  credit_link: string | null;
  credit_text: string | null;
  license_link: string | null;
  license_text: string | null;
}) {
  const t = await getTranslations("Animal");

  return (
    <div className="relative h-[42svh] min-h-64 w-full overflow-hidden bg-surface-sunken sm:h-[55svh]">
      {image && (
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-black/30" />
      <BackButton className="absolute left-4 top-4 sm:left-8 sm:top-6" />
      {(credit_text || license_text) && (
        <p className="absolute bottom-3 right-3 max-w-[80%] truncate rounded-md bg-black/50 px-2 py-1 text-[11px] text-white/85 backdrop-blur">
          {credit_text &&
            (credit_link ? (
              <a href={credit_link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {t("credit", { author: credit_text })}
              </a>
            ) : (
              t("credit", { author: credit_text })
            ))}
          {credit_text && license_text && " · "}
          {license_text &&
            (license_link ? (
              <a href={license_link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {t("license", { license: license_text })}
              </a>
            ) : (
              t("license", { license: license_text })
            ))}
        </p>
      )}
    </div>
  );
}
