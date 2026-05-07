"use client";

import { Selector } from "@/components/selector/Selector";
import Header from "@/components/layout/Header";

import ScriptStep from "@/components/mvid-components/ScriptStep";
import Stepper from "@/components/mvid-components/Stepper";
import UploadStep from "@/components/mvid-components/UploadStep";
import PreviewStep from "@/components/mvid-components/PreviewStep";
import VoiceStep from "@/components/mvid-components/VoiceStep";
import AudioStep from "@/components/mvid-components/AudioStep";

import { useState } from "react";


export default function Home() {

  const [step, setStep] = useState(0);

  const [project, setProject] = useState<any>({
    file: null,
    videoUrl: "",
    videoServerPath: "", // Lưu path video trên server sau bước upload
    geminiKey: "",       // Khóa API của người dùng
    script: "",
    voice: "vi-VN-HoaiMyNeural",
    rate: 0,             // Trạng thái rate dạng số nguyên (VD: 0, 10, -5)
    bgm: null,
    bgmStart: 0,
    bgmEnd: 10, 
    volume: 0.3,
    output: "",
  })

  const steps = [
    <UploadStep project={project} setProject={setProject} next={() => setStep(1)} />,
    <ScriptStep project={project} setProject={setProject} next={() => setStep(2)} back={() => setStep(0)} />,
    <VoiceStep project={project} setProject={setProject} next={() => setStep(3)} back={() => setStep(1)} />,
    <AudioStep project={project} setProject={setProject} next={() => setStep(4)} back={() => setStep(2)} />,
    <PreviewStep project={project} setProject={setProject} back={() => setStep(3)} />
  ]

  // return (
  //   <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
  //     <Header />

  //     <main className="flex flex-1 flex-col items-center gap-10 py-16">
  //       <div className="flex w-full max-w-5xl justify-center bg-white dark:bg-gray-900 py-16 px-8 md:px-16 rounded-2xl shadow-lg transition hover:shadow-xl">
  //         {/* <Selector /> */}
  //         <h1>🎬 AI Video Translate</h1>
  //         <Stepper step={step} />
  //         <div style={{ marginTop: 20}}>{steps[step]}</div>
  //       </div>
  //     </main>
  //   </div>
  // );
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />

      <main className="flex flex-1 justify-center items-start py-10 px-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6">

          {/* Title */}
          <h1 className="text-2xl font-bold mb-6">
            🎬 AI Video Translate
          </h1>

          {/* Stepper */}
          <div className="mb-6">
            <Stepper step={step} />
          </div>

          {/* Content */}
          <div className="min-h-[300px]">
            {steps[step]}
          </div>

        </div>
      </main>
    </div>
  )

}
