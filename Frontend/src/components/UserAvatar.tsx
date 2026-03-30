import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: {
    avatar?: string
    displayName?: string
    userName?: string
    email?: string
    phone?: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'circle' | 'square'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
}

const fallbackSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-4xl',
  '2xl': 'text-4xl',
}

const shapeClasses = {
  circle: '',
  square: 'rounded-xl',
}

/**
 * 统一的头像组件
 *
 * 优先级：头像 → displayName首字符 → userName首字符 → 邮箱首字符 → 手机号首字符 → '?'
 *
 * 所有使用头像的地方都应该使用此组件，以确保一致性
 */
export function UserAvatar({ user, size = 'md', shape = 'circle', className }: UserAvatarProps) {
  const { avatar, displayName, userName, email, phone } = user

  // 计算 fallback 首字符
  const getFallbackText = () => {
    if (displayName) return displayName[0].toUpperCase()
    if (userName) return userName[0].toUpperCase()
    if (email) return email[0].toUpperCase()
    if (phone) return phone[0]
    return '?'
  }

  return (
    <Avatar className={cn(sizeClasses[size], shapeClasses[shape], className)}>
      {avatar ? (
        <AvatarImage src={avatar} alt="" />
      ) : null}
      <AvatarFallback className={cn('bg-[#E1E7FD] text-[#4F6AF3]', fallbackSizeClasses[size], shapeClasses[shape])}>
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  )
}
