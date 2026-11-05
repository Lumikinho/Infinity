import type { CSSProperties } from 'react'

interface AsciiWordmarkProps {
  className?: string
  style?: CSSProperties
}

const WORDMARK = `██╗███╗   ██╗███████╗██╗███╗   ██╗██╗████████╗██╗   ██╗
██║████╗  ██║██╔════╝██║████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝
██║██╔██╗ ██║█████╗  ██║██╔██╗ ██║██║   ██║    ╚████╔╝ 
██║██║╚██╗██║██╔══╝  ██║██║╚██╗██║██║   ██║     ╚██╔╝  
██║██║ ╚████║██║     ██║██║ ╚████║██║   ██║      ██║   
╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝`

export function AsciiWordmark({ className = '', style }: AsciiWordmarkProps) {
  return (
    <pre
      aria-hidden="true"
      className={`ascii-wordmark m-0 font-mono font-bold leading-[1.2] ${className}`}
      style={style}
    >
      {WORDMARK}
    </pre>
  )
}
