"use client";
import { useState, useEffect, useRef } from "react";

export default function ScriptStep({ project, setProject, next, back }: any) {
  const [loadingStatus, setLoadingStatus] = useState(""); 
  const [loadingUpload, setLoadingUpload] = useState(false);
  
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalScript, setOriginalScript] = useState("");
  // const [detectedLang, setDetectedLang] = useState("");
  const [error, setError] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (!hasAutoStarted.current && !project.script && !originalScript && (project.file || project.videoServerPath)) {
      hasAutoStarted.current = true;
      autoProcessPipeline();
    }
  }, []);

  const autoProcessPipeline = async () => {
    setError("");
    let currentOriginalText = originalScript;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // --- PHẦN 1: BÓC BĂNG ÂM THANH (STT) ---
      if (!currentOriginalText) {
        setLoadingStatus("🎧 Đang bóc băng âm thanh từ video...");
        const formData = new FormData();
        if (project.file) formData.append("file", project.file);
        else formData.append("video_path", project.videoServerPath);

        const resSTT = await fetch("https://quan2002-mvid-api.hf.space/get-original-script", {
          method: "POST",
          body: formData,
          signal, 
        });

        if (!resSTT.ok) throw new Error("Lỗi khi bóc băng video. Vui lòng thử lại.");
        
        const dataSTT = await resSTT.json();
        currentOriginalText = dataSTT.original_script;
        
        setOriginalScript(currentOriginalText);
        setProject((prev: any) => ({ ...prev, videoServerPath: dataSTT.video_path })); 
      }

      if (signal.aborted) throw new Error("AbortError");

      // --- PHẦN 2: DỊCH KỊCH BẢN ---
      if (project.geminiKey && currentOriginalText) {
        setLoadingStatus("✨ AI đang dịch sang Tiếng Việt...");
        const formDataTrans = new FormData();
        formDataTrans.append("text", currentOriginalText);
        formDataTrans.append("api_key", project.geminiKey);

        const resTrans = await fetch("https://quan2002-mvid-api.hf.space/translate-text", {
          method: "POST",
          body: formDataTrans,
          signal, 
        });

        if (!resTrans.ok) {
          const errData = await resTrans.json();
          throw new Error(errData.detail || "Lỗi AI Gemini khi dịch.");
        }

        const dataTrans = await resTrans.json();
        setProject((prev: any) => ({ ...prev, script: dataTrans.script }));
        // setDetectedLang(dataTrans.detected_language);
      } else if (!project.geminiKey) {
        setError("Bạn chưa nhập Gemini API Key nên hệ thống chỉ lấy được kịch bản gốc.");
        setShowOriginal(true);
      }

    } catch (err: any) {
      if (err.name === "AbortError" || err.message === "AbortError" || signal.aborted) {
        setError("⏹ Đã chủ động dừng quá trình dịch.");
        if (currentOriginalText) setShowOriginal(true);
      } else {
        setError(`Lỗi: ${err.message}. Bạn có thể copy kịch bản gốc để tự xử lý.`);
        if (currentOriginalText) setShowOriginal(true);
      }
    } finally {
      if (abortControllerRef.current?.signal === signal) {
        setLoadingStatus(""); 
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleManualTranslate = () => {
    autoProcessPipeline(); 
  };

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalScript);
    alert("✅ Đã copy kịch bản gốc!");
  };

  const handleNext = async () => {
    if (project.videoServerPath) { next(); return; }
    if (project.script && !project.videoServerPath) {
      setLoadingUpload(true);
      setError("");
      try {
        const formData = new FormData();
        formData.append("file", project.file);
        const res = await fetch("https://quan2002-mvid-api.hf.space/upload-only", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Lỗi tải video");
        const data = await res.json();
        setProject({ ...project, videoServerPath: data.video_path });
        next();
      } catch (err: any) { setError(err.message); } 
      finally { setLoadingUpload(false); }
    }
  };

  const isWorking = loadingStatus !== "" || loadingUpload;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🎤 Kịch Bản
            {/* {detectedLang && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">🌍 Nguồn: {detectedLang}</span>} */}
          </h2>
          <p className="text-sm text-gray-500">Chỉnh sửa lại lời thoại trước khi lồng tiếng</p>
        </div>

        {/* SWAP NÚT: CHỈ CHO DỪNG KHI ĐANG DỊCH */}
        {loadingStatus === "✨ AI đang dịch sang Tiếng Việt..." ? (
          <button
            onClick={handleStop}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-md transition flex items-center gap-2"
          >
            ⏹ Dừng dịch
          </button>
        ) : loadingStatus === "🎧 Đang bóc băng âm thanh từ video..." ? (
          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded-lg opacity-80 font-medium shadow-md transition cursor-not-allowed flex items-center gap-2"
          >
            ⏳ Đang lấy kịch bản gốc...
          </button>
        ) : (
          <button
            onClick={handleManualTranslate}
            disabled={loadingUpload || !project.geminiKey}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium shadow-md transition"
          >
             ✨ {project.script ? "Dịch lại" : originalScript ? "Tiếp tục Dịch" : "Dịch tự động"}
          </button>
        )}
      </div>

      {loadingStatus && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-200 flex items-center justify-between animate-pulse font-medium shadow-inner">
          <div className="flex items-center gap-3">
            <span className="text-xl animate-spin">⚙️</span> {loadingStatus}
          </div>
        </div>
      )}

      {error && <div className="text-red-600 text-sm p-4 border border-red-200 bg-red-50 rounded-xl font-medium shadow-sm">❌ {error}</div>}

      <div className="relative">
        <textarea
          rows={10}
          disabled={isWorking}
          className={`w-full p-4 border-2 rounded-xl focus:outline-none resize-y transition ${project.script ? 'border-green-400 bg-green-50/20' : 'border-gray-200 focus:border-black'} disabled:opacity-50 disabled:bg-gray-50`}
          placeholder={isWorking ? "Vui lòng đợi..." : "Nhập kịch bản vào đây..."}
          value={project.script}
          onChange={(e) => setProject({ ...project, script: e.target.value })}
        />
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          disabled={!originalScript}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            🎧 Kịch bản gốc (Tiếng bản địa) {!originalScript && "(Chưa có)"}
          </span>
          <span className="text-gray-400">{showOriginal ? "▲" : "▼"}</span>
        </button>

        {showOriginal && originalScript && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 relative">
            <button 
              onClick={handleCopyOriginal}
              className="absolute top-6 right-6 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-100 transition shadow-sm"
            >
              📋 Copy
            </button>
            <textarea
              readOnly
              rows={6}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none resize-y"
              value={originalScript}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between border-t pt-4 mt-2">
        <button onClick={back} disabled={isWorking} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">← Quay lại</button>
        <button
          onClick={handleNext}
          disabled={!project.script || isWorking}
          className="px-8 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 disabled:opacity-40 transition font-bold shadow-md"
        >
          {loadingUpload ? "⏳ Đang tải..." : "Tiếp tục →"}
        </button>
      </div>
    </div>
  );
}