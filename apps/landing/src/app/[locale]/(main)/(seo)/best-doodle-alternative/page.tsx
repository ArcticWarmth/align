import type { Metadata } from "next";
import { Trans } from "react-i18next/TransWithoutContext";
import Bonus from "@/components/home/bonus";
import { MarketingHero } from "@/components/home/hero";
import { BigTestimonial, Marketing, MentionedBy } from "@/components/marketing";
import { getTranslation } from "@/i18n/server";

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { t } = await getTranslation(params.locale, ["home"]);
  return (
    <Marketing>
      <MarketingHero
        title={t("doodleAlternative", {
          ns: "home",
        })}
        description={t("doodleAlternativeDescription", {
          ns: "home",
        })}
        callToAction={<Trans t={t} ns="home" i18nKey="createAPoll" />}
      />
      <Bonus t={t} />
      <BigTestimonial />
      <MentionedBy />
    </Marketing>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getTranslation(params.locale, "home");
  return {
    title: t("doodleAlternativeMetaTitle", {
      ns: "home",
    }),
    description: t("doodleAlternativeMetaDescription", {
      ns: "home",
    }),
  };
}
