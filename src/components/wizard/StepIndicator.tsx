/**
 * StepIndicator Component
 * Shows progress dots for wizard steps (● ○)
 */

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            i < currentStep
              ? 'bg-primary-500'
              : i === currentStep
              ? 'bg-primary-500 scale-125'
              : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}
