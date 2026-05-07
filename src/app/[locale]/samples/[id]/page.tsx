import { selectorData } from "@/data/selector-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DemoWrapper } from "./DemoWrapper";
import Header from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

interface SampleInfo {
  framework: string;
  component: string;
  control: string;
  sample: string;
}


export default async function SamplePage({ params }: Props) {
  const t = await getTranslations("SamplePage");
  const { id, locale } = await params;



  let sampleInfo: SampleInfo | null = null;


  for (const fw of selectorData) {
    for (const cg of fw.components) {
      for (const ctrl of cg.controls) {
        for (const s of ctrl.samples) {
          if (s.id === id) {
            sampleInfo = {
              framework: fw.name,
              component: cg.name,
              control: ctrl.name,
              sample: s.name,
            };
            break;
          }
        }
        if (sampleInfo) break;
      }
      if (sampleInfo) break;
    }
    if (sampleInfo) break;
  }

  if (!sampleInfo) return notFound();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="flex-1 py-10 px-4 md:px-20">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {sampleInfo.framework} / {sampleInfo.component} / {sampleInfo.control}
          </div>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back_button")}
          </Link>
        </div>
        <h1 className="text-xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          {sampleInfo.sample}
        </h1>

        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200 dark:border-gray-700 transition hover:shadow-xl">
          <DemoWrapper id={id} />
        </div>
      </div>
    </div >
  );

}
