import cssText from "data-text:~style.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useEffect, useState, type FC } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.challengermode.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = () => {
  const spans = [...document.querySelectorAll<HTMLSpanElement>("span")]

  return spans
    .filter((span) => span.textContent?.includes("'s lineup"))
    .map((span) => ({ element: span, insertPosition: "beforeend" }))
}

const MAX_RETRIES = 3

const TeamFaceitAverage: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const teamContainer =
    anchor.element.parentElement?.parentElement?.parentElement

  const [averageElo, setAverageElo] = useState<string>()
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    if (!teamContainer) return

    const pollForPlayers = () => {
      const players = teamContainer.querySelectorAll("[data-faceit-elo]")

      if (retries >= MAX_RETRIES || players.length >= 5) {
        const eloValues = Array.from(players).map((player) => {
          const elo = player.getAttribute("data-faceit-elo")
          return elo ? parseInt(elo, 10) : 0
        })

        const average =
          (
            eloValues.reduce((sum, elo) => sum + elo, 0) / eloValues.length
          ).toFixed(2) || "Unknown"

        setAverageElo(average)

        return true
      }

      setRetries(retries + 1)

      return false
    }

    if (pollForPlayers()) return

    const interval = setInterval(() => {
      if (pollForPlayers()) {
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (!averageElo) return null

  return <span className="text-sm font-bold">Average elo: {averageElo}</span>
}

export default TeamFaceitAverage
