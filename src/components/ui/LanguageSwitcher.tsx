"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setOpen(false);
  };

  const currentLang = i18n.language.toUpperCase();

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      <button onClick={() => setOpen(!open)}>
        {currentLang} ⌄
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            background: "#fff",
            border: "1px solid #ddd",
            padding: "5px",
            minWidth: "60px",
          }}
        >
          <div onClick={() => changeLanguage("en")}>EN</div>
          <div onClick={() => changeLanguage("fr")}>FR</div>
          <div onClick={() => changeLanguage("es")}>ES</div>
        </div>
      )}
    </div>
  );
}