import { Sparkles } from 'lucide-react'

export default function Logo({ size = 'md' }) {
  const box = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  return (
    <span className="flex items-center gap-2.5">
      <span className={`${box} grid place-items-center rounded-xl bg-gradient-to-br from-plum to-berry text-white shadow-md shadow-pink-200`}>
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="bg-gradient-to-r from-plum to-berry bg-clip-text font-display text-2xl font-bold text-transparent">LevelUp</span>
    </span>
  )
}
