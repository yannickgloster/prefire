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
  game_player_id?: string
  avgKills?: number
  avgADR?: number
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

        const playerData: FaceitData = {
          level: data.games?.cs2?.skill_level,
          nickname: data.nickname,
          elo: data.games?.cs2?.faceit_elo,
          country: data.country,
          game_player_id: data.player_id
        }

        // Fetch player statistics
        const response_stats = await fetch(
          `https://open.faceit.com/data/v4/players/${data.player_id}/games/cs2/stats?limit=30`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.PLASMO_PUBLIC_FACEIT_CLIENT_SIDE}`
            }
          }
        )

        if (response_stats.ok) {
          const statsData = await response_stats.json()

          if (statsData.items && statsData.items.length > 0) {
            let total_kills = 0
            let total_adr = 0

            for (let match of statsData.items) {
              total_kills += Number(match.stats.Kills) || 0
              total_adr += Number(match.stats.ADR) || 0
            }

            const matchCount = statsData.items.length
            playerData.avgKills = total_kills / matchCount
            playerData.avgADR = total_adr / matchCount
          }
        }

        setFaceitData(playerData)
        setFetchState("success")
      } catch (e) {
        console.error("Error fetching FACEIT data:", e)
        setFetchState("error")
      }
    }

    if (isImage) return

    const timer = setTimeout(fetchFaceitData, Math.random() * 1000 + 500)
    return () => clearTimeout(timer)
  }, [steamId, isImage])

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
      {faceitData.avgKills !== undefined && faceitData.avgADR !== undefined && (
        <>
          <br />
          Avg Kills: {faceitData.avgKills.toFixed(1)}, Avg ADR:{" "}
          {faceitData.avgADR.toFixed(1)}
        </>
      )}
    </a>
  )
}

export default FaceitRanks
