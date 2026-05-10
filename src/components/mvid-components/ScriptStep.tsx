import { useState } from "react";

export default function ScriptStep({ project, setProject, next, back }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExtractScript = async () => {
    if (!project.file || !project.geminiKey) return;
    
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", project.file);
      formData.append("api_key", project.geminiKey);

      // Gọi Backend
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
        videoServerPath: data.video_path // Lưu lại để bước cuối mang đi ghép âm thanh
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">🎤 Script</h2>
          <p className="text-sm text-gray-500">Trích xuất lời thoại từ video và chỉnh sửa</p>
        </div>
        <button
          onClick={handleExtractScript}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Đang xử lý (Vui lòng đợi)..." : "Generate Script"}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}

      <textarea
        rows={10}
        className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-y"
        placeholder="Script sẽ hiển thị ở đây. Bạn có thể tự do chỉnh sửa..."
        value={project.script}
        onChange={(e) => setProject({ ...project, script: e.target.value })}
      />

      <div className="flex justify-between">
        <button onClick={back} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Back</button>
        <button onClick={next} disabled={!project.script} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  )
}