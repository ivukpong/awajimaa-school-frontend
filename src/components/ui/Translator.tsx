"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

export default function Translator() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("login")}</p>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => changeLanguage("en")}>English</button>
        <button onClick={() => changeLanguage("fr")}>French</button>
        <button onClick={() => changeLanguage("es")}>Spanish</button>
      </div>
    </div>
  );
}