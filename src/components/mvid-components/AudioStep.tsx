"use client"
import { useEffect, useState } from "react"

export default function AudioStep({ project, setProject, next, back }: any) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (project.bgm) {
            const url = URL.createObjectURL(project.bgm)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        }
    }, [project.bgm])

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold">🎵 Thêm nhạc nền</h2>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:border-black transition cursor-pointer relative">
                <input
                    type="file"
                    accept="audio/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setProject({ ...project, bgm: e.target.files?.[0] })}
                />
                <p className="text-sm text-gray-500">
                    {project.bgm ? `🎧 ${project.bgm.name}` : "Click để tải nhạc nền (mp3, wav...)"}
                </p>
            </div>

            {project.bgm && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Audio Player Preview */}
                    {previewUrl && (
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <p className="text-xs mb-2 text-gray-400 uppercase font-bold">Nghe thử file gốc:</p>
                            <audio controls src={previewUrl} className="w-full" />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Cut Music Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Bắt đầu (giây)</label>
                            <input
                                type="number"
                                value={project.bgmStart}
                                onChange={(e) => setProject({ ...project, bgmStart: parseFloat(e.target.value) })}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Kết thúc (giây)</label>
                            <input
                                type="number"
                                value={project.bgmEnd}
                                onChange={(e) => setProject({ ...project, bgmEnd: parseFloat(e.target.value) })}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>

                    {/* Volume Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-700">Âm lượng nhạc nền</label>
                            <span className="text-sm font-bold">{Math.round(project.volume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={project.volume}
                            onChange={(e) => setProject({ ...project, volume: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <button onClick={back} className="px-6 py-2 cursor-pointer bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    ← Quay về
                </button>
                <button onClick={next} className="px-8 py-2 cursor-pointer bg-black text-white rounded-lg hover:opacity-90 transition shadow-md">
                    Tiếp tục →
                </button>
            </div>
        </div>
    )
}