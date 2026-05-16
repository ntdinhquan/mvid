"use client";
import { useState } from "react";

export default function PreviewStep({ project, setProject, back }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateVideo = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("video_path", project.videoServerPath);
      formData.append("script", project.script);
      formData.append("voice", project.voice);
      formData.append("rate", project.rate.toString());
      
      formData.append("bgm_volume", (project.volume || 0).toString());
      formData.append("bgm_start", (project.bgmStart || 0).toString());
      formData.append("bgm_end", (project.bgmEnd || 0).toString());
      if (project.bgm) {
        formData.append("bgm", project.bgm);
      }

      const res = await fetch("https://quan2002-mvid-api.hf.space/generate-video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Lỗi khi render video");
      }

      const data = await res.json();
      
      setProject({ ...project, finalVideoUrl: data.output_url });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!project.finalVideoUrl) return;
    try {
      const response = await fetch(project.finalVideoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MVID_Render_${new Date().getTime()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Lỗi khi tải video xuống!");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🎬 Xem trước & Xuất
        </h2>
        <p className="text-sm text-gray-500">Xem lại cấu hình và xuất bản video voice-over</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT TRÁI: VIDEO PLAYER */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">✨ Final Video</p>
          <div className="bg-black/5 p-4 rounded-2xl flex items-center justify-center min-h-[400px] border border-gray-200">
            {loading ? (
              <div className="flex flex-col items-center text-gray-500 animate-pulse">
                <span className="text-4xl mb-2">⏳</span>
                <p>Đang render video...</p>
                <p className="text-xs mt-1">Quá trình này có thể mất 1-2 phút</p>
              </div>
            ) : project.finalVideoUrl ? (
              <video
                src={project.finalVideoUrl}
                controls
                className="w-full h-auto max-h-[500px] rounded-xl shadow-lg"
              />
            ) : (
              <div className="text-center text-gray-400">
                <span className="text-4xl block mb-2">🎞️</span>
                <p>Chưa có video.</p>
                <p className="text-sm">Vui lòng bấm "Tạo Video" để bắt đầu ghép âm thanh.</p>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: SETTINGS INFO */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Settings</p>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4 shadow-sm">
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-500 text-sm">Voice</span>
              <span className="font-mono text-sm font-semibold">{project.voice || "Chưa chọn"}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-500 text-sm">Speed</span>
              <span className="font-mono text-sm font-semibold text-blue-600">
                {project.rate > 0 ? `+${project.rate}%` : `${project.rate}%`}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-500 text-sm">Background Music</span>
              <span className="font-mono text-sm font-semibold">
                {project.bgm ? project.bgm.name : "Không"}
              </span>
            </div>

            {project.bgm && (
              <>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500 text-sm">BGM Timing</span>
                  <span className="font-mono text-sm font-semibold">{project.bgmStart}s - {project.bgmEnd}s</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 text-sm">BGM Volume</span>
                  <span className="font-mono text-sm font-semibold text-green-600">{Math.round(project.volume * 100)}%</span>
                </div>
              </>
            )}

          </div>

          {/* NÚT ACTION CHO RENDER */}
          <div className="pt-4">
            {!project.finalVideoUrl ? (
              <button
                onClick={handleGenerateVideo}
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 shadow-md"
              >
                🧑‍🍳 Nấu video
              </button>
            ) : (
              <button
                onClick={handleGenerateVideo}
                disabled={loading}
                className="w-full py-3 bg-white border-2 border-black text-black rounded-xl font-bold hover:bg-gray-50 transition disabled:opacity-50"
              >
                🔄 Cập nhật thay đổi & Tạo lại
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-4">
        <button
          onClick={back}
          disabled={loading}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
        >
          ← Quay về sửa
        </button>

        <button
          onClick={handleDownload}
          disabled={!project.finalVideoUrl || loading}
          className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-40 font-bold shadow-md flex items-center gap-2"
        >
          ⬇ Tải Video Về Máy
        </button>
      </div>
    </div>
  );
}