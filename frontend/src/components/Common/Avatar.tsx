/**
 * Avatar component - displays user profile picture or fallback
 * File: frontend/src/components/Common/Avatar.tsx
 */

interface AvatarProps {
  profilePictureUrl?: string
  fullName: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  isAgent?: boolean
}

export default function Avatar({ profilePictureUrl, fullName, size = 'medium', isAgent = false }: AvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-16 h-16 text-2xl',
    xlarge: 'w-24 h-24 text-3xl',
  }

  const getProfilePictureUrl = () => {
    if (profilePictureUrl) {
      // If it's already a full URL (starts with http), use it as is (Supabase URL)
      if (profilePictureUrl.startsWith('http')) {
        return profilePictureUrl
      }
      // Otherwise, it's a local path, prepend localhost
      return `http://localhost:8000${profilePictureUrl}`
    }
    return null
  }

  return (
    <div className="relative inline-block">
      {getProfilePictureUrl() ? (
        <img
          src={getProfilePictureUrl()!}
          alt={fullName}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold`}>
          {fullName.charAt(0).toUpperCase()}
        </div>
      )}
      {isAgent && (
        <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1 border-2 border-white">
          <span className="text-xs">🤖</span>
        </div>
      )}
    </div>
  )
}
