"use client";
import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

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

  // Preset dựng sẵn: chọn 1 cái là tự điền Pitch/Tone/Reverb/Effect, sau đó
  // vẫn chỉnh tay từng thanh trượt bên dưới được nếu muốn tinh chỉnh thêm.
  const voicePresets = [
    { id: "teen", label: "🧒 Trẻ em / Hoạt hình", pitch: 5, tone: 6, reverb: 0, effect: "none" },
    { id: "elder", label: "👴 Cụ già", pitch: -4, tone: -6, reverb: 10, effect: "none" },
    { id: "deep_male", label: "🧔 Nam trầm ấm", pitch: -3, tone: -4, reverb: 0, effect: "none" },
    { id: "bright_female", label: "👩 Nữ trong trẻo, năng động", pitch: 2, tone: 5, reverb: 0, effect: "none" },
    { id: "news", label: "📰 Phát thanh viên / Tin tức", pitch: 0, tone: 2, reverb: 0, effect: "none" },
    { id: "ads", label: "📢 Hoạt náo viên / Quảng cáo", pitch: 1, tone: 6, reverb: 0, effect: "none" },
    { id: "story", label: "📖 Kể chuyện đêm khuya", pitch: -2, tone: -5, reverb: 20, effect: "none" },
    { id: "mystery", label: "👻 Bí ẩn, ma mị", pitch: -2, tone: -3, reverb: 30, effect: "ghost" },
  ];
  const [selectedPreset, setSelectedPreset] = useState("");

  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = voicePresets.find((p) => p.id === presetId);
    if (preset) {
      setProject({ ...project, pitch: preset.pitch, tone: preset.tone, reverb: preset.reverb, effect: preset.effect });
    }
  };

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
      formData.append("pitch", (project.pitch || 0).toString());
      formData.append("tone", (project.tone || 0).toString());
      formData.append("reverb", (project.reverb || 0).toString());
      formData.append("effect", project.effect || "none");

      const res = await fetch(`${API_BASE_URL}/preview-voice`, {
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Biến giọng nhanh (Preset)</label>
            <select
              value={selectedPreset}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white cursor-pointer transition"
            >
              <option value="" disabled>-- Chọn 1 kiểu giọng có sẵn --</option>
              {voicePresets.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 italic">
              Chọn 1 preset để tự điền các thanh trượt bên dưới, sau đó vẫn chỉnh tay thêm được nếu muốn.
            </p>
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex justify-between">
              <span>Cao độ giọng — Trầm ↔ Cao</span>
              <span className="text-black font-bold">{project.pitch > 0 ? `+${project.pitch}` : project.pitch}</span>
            </label>
            <input
              type="range" min="-6" max="6" step="1"
              value={project.pitch || 0}
              onChange={(e) => setProject({ ...project, pitch: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <p className="text-xs text-gray-400 italic">
              Kéo trái để giọng trầm/ồm hơn, kéo phải để giọng cao/thanh hơn. Đổi cao độ giọng thật (nghe như người khác), giữ nguyên tốc độ nói.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex justify-between">
              <span>Tông màu âm — Ấm ↔ Sáng</span>
              <span className="text-black font-bold">{project.tone > 0 ? `+${project.tone}` : project.tone}</span>
            </label>
            <input
              type="range" min="-10" max="10" step="1"
              value={project.tone || 0}
              onChange={(e) => setProject({ ...project, tone: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <p className="text-xs text-gray-400 italic">
              Kéo trái để giọng ấm/dày hơn (hợp đọc truyện, tâm sự), kéo phải để sáng/sắc hơn (hợp video năng động, quảng cáo). Không đổi cao độ giọng.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex justify-between">
              <span>Độ vang (Reverb)</span>
              <span className="text-black font-bold">{project.reverb || 0}%</span>
            </label>
            <input
              type="range" min="0" max="100" step="10"
              value={project.reverb || 0}
              onChange={(e) => setProject({ ...project, reverb: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <p className="text-xs text-gray-400 italic">
              0% = không vang. Kéo phải để giọng vang xa hơn, hợp video kịch, hồi tưởng, hội trường. Dùng chung được với Hiệu ứng đặc biệt bên dưới.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hiệu ứng đặc biệt</label>
            <select
              value={project.effect || "none"}
              onChange={(e) => setProject({ ...project, effect: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white cursor-pointer transition"
            >
              <option value="none">Không có</option>
              <option value="robot">🤖 Robot — giọng máy móc, rung đều</option>
              <option value="chorus">👥 Chorus — dày giọng, như nhiều người nói</option>
              <option value="lofi">📻 Lo-fi/Radio cũ — rè như đài cũ, băng cassette</option>
              <option value="ghost">👻 Ma quái/Dưới nước — rung, bí ẩn</option>
              <option value="telephone">📞 Điện thoại — lọc dải tần, hợp lồng tiếng cuộc gọi</option>
            </select>
            <p className="text-xs text-gray-400 italic">
              Ngoài ra mọi giọng AI đều tự động được chuẩn hóa âm lượng, làm đều tiếng to/nhỏ và giảm tiếng rít — không cần chỉnh thêm.
            </p>
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