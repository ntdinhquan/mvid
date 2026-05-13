"use client";
import { useState } from "react";

export default function ScriptStep({ project, setProject, next, back }: any) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [error, setError] = useState("");

  // Nút 1: Dùng AI trích xuất và dịch (Luồng cũ)
  const handleExtractScript = async () => {
    if (!project.file || !project.geminiKey) return;
    setLoadingAI(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", project.file);
      formData.append("api_key", project.geminiKey);

      const res = await fetch("https://quan2002-mvid-api.hf.space/extract-script", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Lỗi khi trích xuất kịch bản");
      }

      const data = await res.json();
      setProject({
        ...project,
        script: data.script,
        videoServerPath: data.video_path, // Đã có file trên server
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleNext = async () => {
    if (project.videoServerPath) {
      next();
      return;
    }

    if (project.script && !project.videoServerPath) {
      setLoadingUpload(true);
      setError("");

      try {
        const formData = new FormData();
        formData.append("file", project.file);

        const res = await fetch("https://quan2002-mvid-api.hf.space/upload-only", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Lỗi khi tải video gốc lên máy chủ");
        }

        const data = await res.json();
        setProject({
          ...project,
          videoServerPath: data.video_path, // Lưu path
        });
        
        next();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingUpload(false);
      }
    }
  };

  const isWorking = loadingAI || loadingUpload;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">🎤 Kịch Bản (Script)</h2>
          <p className="text-sm text-gray-500">Dùng AI dịch tự động HOẶC tự nhập lời thoại của bạn</p>
        </div>
        
        <button
          onClick={handleExtractScript}
          disabled={isWorking || !project.geminiKey}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium shadow-md flex items-center gap-2"
          title={!project.geminiKey ? "Cần có API Key ở bước trước" : ""}
        >
          {loadingAI ? "⏳ Đang dịch..." : "✨ Dịch tự động bằng AI"}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm p-3 border border-red-200 bg-red-50 rounded-lg">❌ {error}</div>}

      <div className="relative">
        <textarea
          rows={10}
          className={`w-full p-4 border-2 rounded-xl focus:outline-none resize-y transition ${project.script ? 'border-green-400 bg-green-50/20' : 'border-gray-200 focus:border-black'}`}
          placeholder="Nhập kịch bản thủ công vào đây (nếu bạn không muốn dùng AI dịch)..."
          value={project.script}
          onChange={(e) => {
            setProject({ ...project, script: e.target.value });
          }}
        />
        {project.script && !loadingAI && (
          <div className="absolute top-3 right-3 text-green-500 text-xs font-bold bg-green-100 px-2 py-1 rounded">
            Đã có kịch bản ({project.script.length} ký tự)
          </div>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <button onClick={back} disabled={isWorking} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">← Quay lại</button>
        
        <button 
          onClick={handleNext} 
          disabled={!project.script || isWorking} 
          className="px-8 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 disabled:opacity-40 transition font-bold shadow-md flex items-center gap-2"
        >
          {loadingUpload ? "⏳ Đang tải video..." : "Tiếp tục →"}
        </button>
      </div>
    </div>
  );
}