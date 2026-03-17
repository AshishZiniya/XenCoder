import { HTMLAttributes } from 'react';

/**
 * Material Icon component using @fontsource/material-icons.
 * Renders icons via ligatures – pass the icon name as the name prop (e.g. "send", "edit", "content_copy").
 * @see https://fonts.google.com/icons
 */

interface MaterialIconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'text-[16px]',
  sm: 'text-[18px]',
  md: 'text-[20px]',
  lg: 'text-[24px]',
  xl: 'text-[32px]',
}

export default function MaterialIcon({ 
  name, 
  className = '', 
  size = 'md',
  ...props 
}: MaterialIconProps) {
  return (
    <span
      className={`material-icon select-none ${sizeMap[size]} ${className}`.trim()}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )
}

