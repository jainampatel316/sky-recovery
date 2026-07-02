import { useContext } from "react"
import { ThemeProviderContext } from "./theme-context"

export function useTheme() {
  return useContext(ThemeProviderContext)
}