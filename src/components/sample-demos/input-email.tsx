"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function InputEmailDemo() {
  const t = useTranslations("InputEmail");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setMessage(t("error_required"));
      setIsError(true);
    } else if (!emailRegex.test(email)) {
      setMessage(t("error_invalid"));
      setIsError(true);
    } else {
      setMessage(t("submitted"));
      setIsError(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-64">
      <label className="text-sm font-medium">{t("label")}</label>
      <Input
        type="email"
        placeholder={t("placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      {message && (
        <div className={`text-xs ${isError ? "text-red-500" : "text-green-500"}`}>
          {message}
        </div>
      )}
      <div className="text-xs text-gray-500">{email || t("no_value")}</div>
      <Button onClick={handleSubmit} className="mt-2">
        {t("submit")}
      </Button>
    </div>
  );
}
