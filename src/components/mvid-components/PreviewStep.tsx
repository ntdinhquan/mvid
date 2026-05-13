"use client"

import { useState } from "react"

export default function PreviewStep({ project, setProject, back }: any) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleProcess = async () => {
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("video_path", project.videoServerPath);
            formData.append("script", project.script);
            formData.append("voice", project.voice);
            formData.append("rate", project.rate.toString());
            formData.append("bgm_volume", project.volume.toString());
            formData.append("bgm_start", project.bgmStart.toString());
            formData.append("bgm_end", project.bgmEnd.toString());

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
            // Lưu URL video trả về vào state output
            setProject({ ...project, output: data.output_url });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">

            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-semibold">🎬 Preview & Export</h2>
                <p className="text-sm text-gray-500">
                    Xem lại cấu hình và xuất bản video voice-over
                </p>
            </div>

            {/* HIỂN THỊ LỖI NẾU CÓ */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    ❌ {error}
                </div>
            )}

            {/* MAIN - Đổi thành grid-cols-5 để chia tỉ lệ 40/60 */}
            <div className="grid md:grid-cols-5 gap-8">

                {/* VIDEO PREVIEW KẾT QUẢ - Chiếm 2 phần (Cột trái) */}
                <div className="md:col-span-2 space-y-3 flex flex-col">
                    <p className="text-sm font-medium">
                        {project.output ? "✨ Final Video" : "Original Video"}
                    </p>

                    <div className="bg-black/5 rounded-xl flex items-center justify-center overflow-hidden p-2">
                        {project.output ? (
                            /* VIDEO THÀNH PHẨM */
                            <video
                                src={project.output}
                                controls
                                autoPlay
                                className="w-auto max-h-[400px] rounded-lg shadow-lg border-2 border-green-500 mx-auto"
                            />
                        ) : project.videoUrl ? (
                            /* VIDEO GỐC */
                            <div className="relative w-full flex justify-center">
                                <video
                                    src={project.videoUrl}
                                    controls
                                    className="w-auto max-h-[400px] rounded-lg shadow opacity-80"
                                />
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    Chưa xử lý
                                </div>
                            </div>
                        ) : (
                            <div className="h-[300px] w-full flex items-center justify-center text-gray-400">
                                Không tìm thấy video
                            </div>
                        )}
                    </div>
                </div>

                {/* SETTINGS SUMMARY - Chiếm 3 phần (Cột phải) */}
                <div className="md:col-span-3 space-y-4">
                    <p className="text-sm font-medium">Settings</p>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-sm border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-500">Voice</span>
                            <span className="font-medium text-right bg-white px-2 py-1 rounded shadow-sm">{project.voice}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-500">Speed</span>
                            <span className="font-medium bg-white px-2 py-1 rounded shadow-sm">{project.rate > 0 ? `+${project.rate}%` : `${project.rate}%`}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-500">Background Music</span>
                            <span className="font-medium bg-white px-2 py-1 rounded shadow-sm">{project.bgm ? project.bgm.name : "Không"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-500">BGM Timing</span>
                            <span className="font-medium bg-white px-2 py-1 rounded shadow-sm">{project.bgmStart}s - {project.bgmEnd}s</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">BGM Volume</span>
                            <span className="font-medium bg-white px-2 py-1 rounded shadow-sm">{Math.round(project.volume * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-2">
                <button
                    onClick={back}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition font-medium"
                >
                    ← Back
                </button>

                {/* SWAP NÚT BẤM DỰA TRÊN TRẠNG THÁI OUTPUT */}
                {project.output ? (
                    <a
                        href={project.output}
                        download
                        target="_blank"
                        className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold shadow-lg flex items-center gap-2"
                    >
                        ⬇️ Tải Video Về Máy
                    </a>
                ) : (
                    <button
                        onClick={handleProcess}
                        disabled={loading || !project.videoServerPath}
                        className="px-8 py-2 bg-black text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-bold shadow-lg"
                    >
                        {loading ? "⏳ Đang xử lý..." : "🚀 Generate Video"}
                    </button>
                )}
            </div>

        </div>
    )
}