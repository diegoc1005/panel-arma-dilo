import { TEAM_MEMBERS } from '../data/initialData'

export function Avatar({ memberId, size = 'md', showName = false }) {
  const member = TEAM_MEMBERS.find((m) => m.id === memberId)
  if (!member) return null

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
        style={{ backgroundColor: member.color }}
        title={member.name}
      >
        {member.initials}
      </div>
      {showName && (
        <div>
          <p className="text-sm font-medium text-gray-900 leading-tight">{member.name}</p>
          <p className="text-xs text-gray-500">{member.role}</p>
        </div>
      )}
    </div>
  )
}
