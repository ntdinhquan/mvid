"use client"
import { useState, useRef, useEffect } from "react"

export default function VoiceStep({ project, setProject, next, back }: any) {
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const voices = [
    { id: "vi-VN-HoaiMyNeural", label: "🇻🇳 Nữ - Hoài My (Mặc định)" },
    { id: "vi-VN-NamMinhNeural", label: "🇻🇳 Nam - Nam Minh" },
    { id: "en-US-AriaNeural", label: "🇺🇸 Nữ - Aria (English US)" },
    { id: "en-US-GuyNeural", label: "🇺🇸 Nam - Guy (English US)" },
    { id: "zh-CN-XiaoxiaoNeural", label: "🇨🇳 Nữ - Xiaoxiao (Chinese)" },
  ];


  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);


  const handlePreview = async () => {
    if (!project.script) return alert("Vui lòng quay lại bước Script để tạo nội dung trước!");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", project.script);
      formData.append("voice", project.voice);
      formData.append("rate", project.rate.toString());

      const res = await fetch("https://quan2002-mvid-api.hf.space/preview-voice", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Không thể tải âm thanh nghe thử");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      stopAudio(); // handle dừng âm thanh khi đang phát
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();

    } catch (error) {
      alert("Lỗi khi nghe thử: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">🗣️ Text to Speech</h2>
        <p className="text-sm text-gray-500">Cấu hình giọng đọc AI và tốc độ phát âm</p>
      </div>

      {/* CÀI ĐẶT GIỌNG ĐỌC */}
      <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-gray-700">Chọn giọng đọc phổ biến</label>

            {/* NÚT NGHE THỬ */}
            <button
              onClick={handlePreview}
              disabled={loading}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1"
            >
              {loading ? "⌛ Đang tải..." : "▶️ Nghe thử giọng này"}
            </button>
          </div>

          <select
            value={project.voice}
            onChange={(e) => setProject({ ...project, voice: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white cursor-pointer transition"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Chọn Tốc độ */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex justify-between">
            <span>Tốc độ đọc (Rate)</span>
            <span className="text-black font-bold">
              {project.rate > 0 ? `+${project.rate}%` : `${project.rate}%`}
            </span>
          </label>
          <input
            type="range" min="-50" max="50" step="5"
            value={project.rate}
            onChange={(e) => setProject({ ...project, rate: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>Chậm</span>
            <span>Bình thường</span>
            <span>Nhanh</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between mt-4">
        <button onClick={()=>{
          stopAudio();
          back();
        }} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white transition cursor-pointer">
          ← Quay về
        </button>
        <button onClick={()=>{
          stopAudio();
          next();
        }} className="px-8 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 shadow-md transition cursor-pointer">
          Tiếp tục →
        </button>
      </div>
    </div>
  )
}