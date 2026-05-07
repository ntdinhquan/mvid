export default function Stepper({ step }: { step: number }) {
  const steps = ["Upload", "Script", "Voice", "Audio", "Preview"]

  return (
    <div className="flex gap-2">
      {steps.map((label, i) => (
        <div
          key={i}
          className={`px-4 py-2 rounded-full text-sm font-medium transition
            ${
              i === step
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-600"
            }`}
        >
          {label}
        </div>
      ))}
    </div>
  )
}