"use client";
import { useState, useEffect, useRef } from "react";
import { apiFetch, readError, scriptLines, type Segment } from "@/lib/api";

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, "0");
  return `${m}:${sec}`;
};

export default function ScriptStep({ project, setProject, next, back }: any) {
  const [loadingStatus, setLoadingStatus] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [showOriginal, setShowOriginal] = useState(false);
  // Khôi phục kịch bản gốc từ segments nếu quay lại bước này
  const [originalScript, setOriginalScript] = useState(
    () => (project.segments || []).map((s: Segment) => s.text).join("\n")
  );
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
    let currentSegments: Segment[] = project.segments || [];

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // --- PHẦN 1: BÓC BĂNG ÂM THANH (STT) kèm mốc thời gian ---
      if (!currentOriginalText) {
        setLoadingStatus("🎧 Đang bóc băng âm thanh từ video...");
        const formData = new FormData();
        if (project.file) formData.append("file", project.file);
        else formData.append("video_path", project.videoServerPath);

        const resSTT = await apiFetch("/get-original-script", {
          method: "POST",
          body: formData,
          signal,
        });

        if (!resSTT.ok) throw new Error(await readError(resSTT, "Lỗi khi bóc băng video. Vui lòng thử lại."));

        const dataSTT = await resSTT.json();
        currentOriginalText = dataSTT.original_script;
        currentSegments = dataSTT.segments || [];

        setOriginalScript(currentOriginalText);
        setProject((prev: any) => ({ ...prev, videoServerPath: dataSTT.video_path, segments: currentSegments }));
      }

      if (signal.aborted) throw new Error("AbortError");

      // --- PHẦN 2: DỊCH KỊCH BẢN (1 dòng = 1 đoạn, AI được báo thời lượng từng đoạn) ---
      if (project.geminiKey && currentOriginalText) {
        setLoadingStatus("✨ AI đang dịch sang Tiếng Việt...");
        const formDataTrans = new FormData();
        formDataTrans.append("text", currentOriginalText);
        formDataTrans.append("api_key", project.geminiKey);
        if (currentSegments.length) {
          formDataTrans.append("segments", JSON.stringify(currentSegments.map(({ start, end }) => ({ start, end }))));
        }

        const resTrans = await apiFetch("/translate-text", {
          method: "POST",
          body: formDataTrans,
          signal,
        });

        if (!resTrans.ok) throw new Error(await readError(resTrans, "Lỗi AI Gemini khi dịch."));

        const dataTrans = await resTrans.json();
        setProject((prev: any) => ({ ...prev, script: dataTrans.script }));
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
        const res = await apiFetch("/upload-only", { method: "POST", body: formData });
        if (!res.ok) throw new Error(await readError(res, "Lỗi tải video"));
        const data = await res.json();
        setProject((prev: any) => ({ ...prev, videoServerPath: data.video_path }));
        next();
      } catch (err: any) { setError(err.message); }
      finally { setLoadingUpload(false); }
    }
  };

  const isWorking = loadingStatus !== "" || loadingUpload;
  const segments: Segment[] = project.segments || [];
  const lineCount = project.script ? scriptLines(project.script, segments.length).length : 0;
  const linesMatch = segments.length > 0 && lineCount === segments.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🎤 Kịch Bản
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

      <div className="space-y-2">
        <textarea
          rows={10}
          disabled={isWorking}
          className={`w-full p-4 border-2 rounded-xl focus:outline-none resize-y transition ${project.script ? 'border-green-400 bg-green-50/20' : 'border-gray-200 focus:border-black'} disabled:opacity-50 disabled:bg-gray-50`}
          placeholder={isWorking ? "Vui lòng đợi..." : "Nhập kịch bản vào đây..."}
          value={project.script}
          onChange={(e) => setProject({ ...project, script: e.target.value })}
        />

        {/* CHỈ BÁO KHỚP THỜI GIAN: mỗi dòng kịch bản = 1 đoạn trong video */}
        {segments.length > 0 && project.script && (
          <p className={`text-xs font-medium ${linesMatch ? "text-green-700" : "text-amber-700"}`}>
            {linesMatch
              ? `✅ ${lineCount} dòng khớp ${segments.length} đoạn trong video — giọng đọc sẽ bám đúng thời điểm từng đoạn.`
              : `⚠️ Kịch bản có ${lineCount} dòng nhưng video có ${segments.length} đoạn. Giữ đúng 1 dòng cho mỗi đoạn để giọng khớp hình; nếu không, hệ thống sẽ đọc liền mạch và tự co giãn cho vừa video.`}
          </p>
        )}
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
            {segments.length > 0 ? (
              <ol className="max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg p-3 pr-20 text-sm text-gray-600 space-y-1">
                {segments.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-xs text-gray-400 shrink-0 pt-0.5">
                      {i + 1}. {fmtTime(s.start)}–{fmtTime(s.end)}
                    </span>
                    <span>{s.text}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <textarea
                readOnly
                rows={6}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none resize-y"
                value={originalScript}
              />
            )}
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
