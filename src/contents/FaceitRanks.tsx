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

export const getInlineAnchorList: PlasmoGetInlineAnchorList = () =>
  document.querySelectorAll<HTMLAnchorElement>("a[href*='steamcommunity.com']")

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

type FaceitData = {
  level: number
  elo: number
  nickname: string
  country: string
}

type FetchState = "loading" | "success" | "error"

const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) {
    return ""
  }

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))

  return String.fromCodePoint(...codePoints)
}

const FaceitRanks: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [faceitData, setFaceitData] = useState<FaceitData>()
  const [fetchState, setFetchState] = useState<FetchState>("loading")

  const isImage = anchor.element.parentElement.parentElement.classList.contains(
    "cm-avatar-img--small"
  )

  const steamId = new URL(
    (anchor.element as HTMLAnchorElement).href
  ).pathname.split("/")[2]

  useEffect(() => {
    const fetchFaceitData = async () => {
      try {
        const response = await fetch(
          `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.PLASMO_PUBLIC_FACEIT_CLIENT_SIDE}`
            }
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch FACEIT data")
        }

        const data = await response.json()

        setFaceitData({
          level: data.games?.cs2?.skill_level,
          nickname: data.nickname,
          elo: data.games?.cs2?.faceit_elo,
          country: data.country
        })
        setFetchState("success")
      } catch (_e) {
        setFetchState("error")
      }
    }

    if (isImage) return

    const timer = setTimeout(fetchFaceitData, Math.random() * 1000 + 500)
    return () => clearTimeout(timer)
  }, [])

  if (isImage) {
    return null
  }

  if (fetchState === "loading") {
    return <span>Loading...</span>
  }

  if (fetchState === "error" || !faceitData) {
    return <span>Error</span>
  }

  // Used to calculate the average elo of a team
  anchor.element.setAttribute("data-faceit-elo", faceitData.elo.toString())

  return (
    <a
      href={`https://www.faceit.com/en/players/${faceitData.nickname}`}
      target="_blank"
      rel="noopener noreferrer"
      className="cm-text-secondary hover:text-white">
      FACEIT level {faceitData.level} ({faceitData.elo}){" "}
      {getCountryFlag(faceitData.country)}
    </a>
  )
}

export default FaceitRanks
