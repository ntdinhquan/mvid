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
  
  const [showDonate, setShowDonate] = useState(false);

  const [project, setProject] = useState<any>({
    file: null,
    videoUrl: "",
    videoServerPath: "", 
    geminiKey: "",      
    script: "",
    voice: "vi-VN-HoaiMyNeural",
    rate: 0,            
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 relative">
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

      {/* FLOATING DONATE WIDGET */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        
        {/* Bảng Popup QR Code */}
        {showDonate && (
          <div className="mb-4 p-5 bg-white rounded-2xl shadow-2xl border border-gray-100 w-64 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-gray-800 text-sm">Ủng hộ Quân 1 ly cafe ☕</p>
              <button 
                onClick={() => setShowDonate(false)} 
                className="text-gray-400 hover:text-red-500 font-bold px-2"
              >
                ✕
              </button>
            </div>
            
            {/* Vùng chứa mã QR */}
            <div className="bg-gray-50 rounded-xl p-2 flex justify-center items-center h-56 border border-dashed border-gray-300">
              
              <img 
                src="https://res.cloudinary.com/dxpghnb5n/image/upload/v1778390197/kheudonate_fscnhm.jpg" 
                alt="QR Donate" 
                className="max-h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-400 text-center">Chèn ảnh QR vào thẻ img nhé</span>';
                }}
              />

            </div>
            <p className="text-xs text-center text-gray-500 mt-3 font-medium">
              Cảm ơn bạn rất nhiều! ❤️
            </p>
          </div>
        )}

        <button
          onClick={() => setShowDonate(!showDonate)}
          className={`w-14 h-14 bg-yellow-400 hover:bg-yellow-500 text-2xl rounded-full shadow-lg shadow-yellow-400/40 flex items-center justify-center transition-all hover:scale-110 ${!showDonate ? 'animate-bounce' : ''}`}
          title="Buy me a coffee"
        >
          🎁
        </button>

      </div>
    </div>
  )
}