import { useEffect, useState } from "react"

export function useIsMobile(widthThreshold = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < widthThreshold : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < widthThreshold)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [widthThreshold])

  return isMobile
}
