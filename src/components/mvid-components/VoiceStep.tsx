"use client";
import { useState, useRef, useEffect } from "react";

export default function VoiceStep({ project, setProject, next, back }: any) {
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // PHỤC HỒI STATE: Nếu project đã có customAudio -> Mở luôn tab record
  const [mode, setMode] = useState<"ai" | "record">(project.useAIVoice === false ? "record" : "ai");
  const [isRecording, setIsRecording] = useState(false);
  
  // PHỤC HỒI BẢN THU CŨ (nếu có)
  const [recordedUrl, setRecordedUrl] = useState<string>(
    project.customAudio ? URL.createObjectURL(project.customAudio) : ""
  );
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const handlePreview = async () => {
    if (!project.script) return alert("Vui lòng quay lại bước Script để tạo nội dung trước!");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", project.script);
      formData.append("voice", project.voice);
      formData.append("rate", (project.rate || 0).toString());

      const res = await fetch("https://quan2002-mvid-api.hf.space/preview-voice", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Không thể tải âm thanh nghe thử");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      stopAudio(); 
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();

    } catch (error) {
      alert("Lỗi khi nghe thử: " + error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrl(url);
        // Lưu tạm vào project, nhưng TỚI LÚC BẤM NEXT MỚI CHỐT
        setProject({ ...project, customAudio: audioBlob });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedUrl(""); 
      stopAudio(); 
    } catch (err) {
      alert("❌ Không thể truy cập Micro. Vui lòng cấp quyền trong cài đặt trình duyệt!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- CƠ CHẾ CHỐT (LOCK) ---
  const handleNext = () => {
    if (mode === "ai") {
      // Chốt dùng AI -> XÓA SẠCH file thu âm (nếu có) để không bị lỗi gửi nhầm
      setProject({ ...project, useAIVoice: true, customAudio: null });
    } else {
      // Chốt dùng Thu âm -> Kiểm tra xem đã thu chưa
      if (!project.customAudio) {
        alert("⚠️ Bạn chưa có bản thu âm nào! Vui lòng bấm micro để thu âm hoặc chuyển sang tab Giọng AI.");
        return;
      }
      // Chốt thu âm -> Ép useAIVoice thành false
      setProject({ ...project, useAIVoice: false });
    }
    
    stopAudio();
    next();
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold mb-4">🗣️ Lồng tiếng (Voice-over)</h2>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setMode("ai")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${mode === "ai" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
          >
            🤖 Dùng giọng AI
          </button>
          <button
            onClick={() => setMode("record")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${mode === "record" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
          >
            🎙️ Tự thu âm
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-inner relative">
        <span className="absolute top-0 right-0 bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl">
          Kịch bản của bạn
        </span>
        <div className="max-h-40 overflow-y-auto text-sm text-gray-700 leading-relaxed pr-2 whitespace-pre-wrap mt-2">
          {project.script ? project.script : <span className="text-gray-400 italic">Chưa có kịch bản. Vui lòng quay lại bước trước.</span>}
        </div>
      </div>

      {mode === "ai" ? (
        <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-gray-700">Chọn giọng đọc</label>
              <button
                onClick={handlePreview}
                disabled={loading}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1"
              >
                {loading ? "⌛ Đang tải..." : "▶️ Nghe thử AI"}
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
          </div>
        </div>
      ) : (
        <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          {isRecording ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-red-500"></div>
              </div>
              <p className="text-red-500 font-bold animate-pulse">Đang thu âm...</p>
              <button 
                onClick={stopRecording}
                className="px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition shadow-lg"
              >
                ⏹ Kết thúc
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-red-500/40 transition hover:scale-105"
                title="Bắt đầu thu âm"
              >
                🎙️
              </button>
              <p className="text-gray-600 text-sm font-medium">Nhấn vào micro để bắt đầu đọc kịch bản</p>
            </div>
          )}

          {recordedUrl && !isRecording && (
            <div className="w-full mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
              <p className="text-xs font-bold text-green-600">✅ Bản thu của bạn:</p>
              <audio src={recordedUrl} controls className="w-full h-10" />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button onClick={() => { stopAudio(); back(); }} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
          ← Quay về
        </button>
        {/* ĐỔI NÚT CHUYỂN TRANG THÀNH NÚT CHỐT */}
        <button onClick={handleNext} className="px-8 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 shadow-md transition font-bold">
          Chốt & Tiếp tục →
        </button>
      </div>
    </div>
  );
}