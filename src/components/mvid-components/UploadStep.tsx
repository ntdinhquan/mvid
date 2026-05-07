"use client"

import { useRef, useState } from "react"

export default function UploadStep({ project, setProject, next }: any) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  
  // State phụ để cho phép người dùng mở lại ô nhập key nếu muốn sửa
  const [isEditingKey, setIsEditingKey] = useState(!project.geminiKey);

  const handleFile = (file: File) => {
    setProject({
      ...project,
      file,
      videoUrl: URL.createObjectURL(file)
    })
    // Tự động thu nhỏ ô nhập key nếu đã có key và vừa upload video xong
    if (project.geminiKey) setIsEditingKey(false);
  }

  // Điều kiện để thu nhỏ ô API Key: Đã có video VÀ đã có key VÀ không ở chế độ edit
  const isKeyCollapsed = project.videoUrl && project.geminiKey && !isEditingKey;

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">📤 Upload Video</h2>
        <p className="text-sm text-gray-500">
          Tải video lên để bắt đầu dịch và tạo voice-over
        </p>
      </div>

      {/* INPUT API KEY (THU GỌN HOẶC MỞ RỘNG) */}
      <div className={`transition-all duration-300 ${isKeyCollapsed ? 'bg-transparent border-none p-0' : 'bg-blue-50/50 p-4 rounded-xl border border-blue-100'}`}>
        
        {isKeyCollapsed ? (
          // TRẠNG THÁI THU GỌN
          <div className="flex justify-between items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-medium text-gray-700">API Key đã được cấu hình</span>
            </div>
            <button 
              onClick={() => setIsEditingKey(true)}
              className="text-xs text-blue-600 font-medium hover:underline px-2 py-1"
            >
              Chỉnh sửa
            </button>
          </div>
        ) : (
          // TRẠNG THÁI MỞ RỘNG
          <div className="space-y-2 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Google Gemini API Key <span className="text-red-500">*</span>
              </label>
              
              {/* TOOLTIP HƯỚNG DẪN (Dấu chấm hỏi) */}
              <div className="relative group cursor-help">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">
                  ?
                </span>
                
                {/* Nội dung Tooltip (Mặc định ẩn, hiện khi hover) */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                  <p className="mb-1 font-semibold">Cách lấy API Key miễn phí:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-200">
                    <li>Vào trang <span className="text-blue-300 font-mono">aistudio.google.com</span></li>
                    <li>Đăng nhập bằng tài khoản Google</li>
                    <li>Bấm vào "Get API Key" ở menu trái</li>
                    <li>Tạo Key mới và Copy dán vào đây</li>
                  </ol>
                  {/* Mũi tên trỏ xuống của Tooltip */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>

            </div>

            <input
              type="password"
              value={project.geminiKey}
              onChange={(e) => setProject({ ...project, geminiKey: e.target.value })}
              placeholder="Nhập AIzaSy..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">Key này bắt buộc để hệ thống gọi AI dịch kịch bản sang tiếng Việt.</p>
              
              {/* Nút thu gọn (chỉ hiện nếu đã có key và đang bật chế độ edit) */}
              {project.geminiKey && isEditingKey && project.videoUrl && (
                <button 
                  onClick={() => setIsEditingKey(false)}
                  className="text-xs font-medium text-gray-500 hover:text-black"
                >
                  Thu gọn
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DROPZONE */}
      {!project.videoUrl && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-black hover:bg-gray-50 transition"
        >
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-700 font-medium">
            Click hoặc kéo thả video vào đây
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Hỗ trợ MP4, MOV, AVI (Tối đa 50MB)
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) =>
              e.target.files && handleFile(e.target.files[0])
            }
          />
        </div>
      )}

      {/* VIDEO PREVIEW */}
      {project.videoUrl && (
        <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in duration-300">
          
          <div className="bg-black/5 p-2 rounded-xl flex justify-center w-full">
             <video
               src={project.videoUrl}
               controls
               className="w-auto max-h-[400px] rounded-lg shadow-md"
             />
          </div>

          <div className="flex justify-between items-center w-full max-w-sm bg-white px-4 py-3 rounded-lg border shadow-sm mt-2">
            <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={project.file?.name}>
              🎬 {project.file?.name}
            </p>

            <button
              onClick={() =>
                setProject({ ...project, file: null, videoUrl: "" })
              }
              className="text-sm font-semibold text-red-500 hover:text-red-700 transition px-2 py-1 bg-red-50 hover:bg-red-100 rounded"
            >
              Gỡ bỏ
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={next}
          disabled={!project.file || !project.geminiKey.trim()}
          className="px-8 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-40 transition shadow-md"
        >
          Next →
        </button>
      </div>

    </div>
  )
}