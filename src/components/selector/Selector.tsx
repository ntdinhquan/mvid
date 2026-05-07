"use client";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { selectorData } from "@/data/selector-data";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function Selector() {
  const router = useRouter();
  const t = useTranslations("Selector");
  const [framework, setFramework] = useState("");
  const [componentGroup, setComponentGroup] = useState("");
  const [control, setControl] = useState("");
  const [sample, setSample] = useState("");

  const fw = selectorData.find((f) => f.id === framework);
  const components = fw?.components || [];

  const comp = components.find((c) => c.id === componentGroup);
  const controls = comp?.controls || [];

  const ctrl = controls.find((c) => c.id === control);
  const samples = ctrl?.samples || [];

  const handleSampleChange = (val: string) => {
    setSample(val);
    router.push(`/samples/${val}`);
  };

  const renderCombobox = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: { value: string; label: string }[],
    disabled?: boolean
  ) => (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <Combobox
        className="w-48"
        value={value}
        onChange={onChange}
        options={options}
        disabled={disabled}
        placeholder={t("select_placeholder")}
        searchPlaceholder={t("search_placeholder")}
      />
    </div>
  );

  return (
    <div className="flex flex-row gap-6">
      {renderCombobox("Framework", framework, (v) => {
        setFramework(v);
        setComponentGroup("");
        setControl("");
        setSample("");
      }, selectorData.map((x) => ({ value: x.id, label: x.name })))}

      {renderCombobox(
        "Component",
        componentGroup,
        (v) => {
          setComponentGroup(v);
          setControl("");
          setSample("");
        },
        components.map((x) => ({ value: x.id, label: x.name })),
        !framework
      )}

      {renderCombobox(
        "Control",
        control,
        (v) => {
          setControl(v);
          setSample("");
        },
        controls.map((x) => ({ value: x.id, label: x.name })),
        !componentGroup
      )}

      {renderCombobox(
        "Sample",
        sample,
        handleSampleChange,
        samples.map((x) => ({ value: x.id, label: x.name })),
        !control
      )}
    </div>
  );
}
