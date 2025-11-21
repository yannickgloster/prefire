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
        const playerAccountDataResponse = await fetch(
          `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.PLASMO_PUBLIC_FACEIT_CLIENT_SIDE}`
            }
          }
        )

        if (!playerAccountDataResponse.ok) {
          throw new Error("Failed to fetch FACEIT data")
        }

        const playerAccountData = await playerAccountDataResponse.json()

        const playerData: FaceitData = {
          level: playerAccountData.games?.cs2?.skill_level,
          nickname: playerAccountData.nickname,
          elo: playerAccountData.games?.cs2?.faceit_elo,
          country: playerAccountData.country,
          game_player_id: playerAccountData.player_id
        }

        // Fetch player statistics
        const playerMatchDataResponse = await fetch(
          `https://open.faceit.com/data/v4/players/${playerAccountData.player_id}/games/cs2/stats?limit=30`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.PLASMO_PUBLIC_FACEIT_CLIENT_SIDE}`
            }
          }
        )

        if (playerMatchDataResponse.ok) {
          const playerMatchesData = await playerMatchDataResponse.json()

          if (playerMatchesData.items && playerMatchesData.items.length > 0) {
            const { total_kills, total_adr } = playerMatchesData.items.reduce(
              (accumulator, match) => {
                accumulator.total_kills += Number(match.stats.Kills) || 0
                accumulator.total_adr += Number(match.stats.ADR) || 0
                return accumulator
              },
              { total_kills: 0, total_adr: 0 }
            )

            const matchCount = playerMatchesData.items.length
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
