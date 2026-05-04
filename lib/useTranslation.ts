import { useLocale } from "./localeContext";
import { getTranslation } from "./i18n";

export function useTranslation() {
  const { locale } = useLocale();

  const t = (key: string): string => {
    return getTranslation(locale, key);
  };

  return { t, locale };
}
