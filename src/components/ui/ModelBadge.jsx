import { getModelName, getModelColor } from '../../utils/helpers'

export default function ModelBadge({ model, provider }) {
  const color = getModelColor(model)
  const name  = getModelName(model)

  const colors = {
    orange: 'bg-orange-900/40 text-orange-400 border-orange-800',
    blue:   'bg-blue-900/40   text-blue-400   border-blue-800',
    purple: 'bg-purple-900/40 text-purple-400 border-purple-800',
    green:  'bg-green-900/40  text-green-400  border-green-800',
    gray:   'bg-gray-900/40   text-gray-400   border-gray-700',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.gray}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {name}
    </span>
  )
}
