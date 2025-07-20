import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.challengermode.com/*"]
}

async function addTextToSteamLinks() {
  const allLinks = document.querySelectorAll('a[href*="steamcommunity.com"]')

  // Convert NodeList to Array for easier processing
  const linksArray = Array.from(allLinks)

  for (let i = 0; i < linksArray.length; i++) {
    const link = linksArray[i]

    if (!(link instanceof HTMLAnchorElement)) {
      continue
    }

    if (link.closest(".cm-avatar-img--small")) {
      console.log("Skipping avatar link")
      continue
    }

    if (link.getAttribute("data-steam-processed")) {
      continue
    }

    link.setAttribute("data-steam-processed", "true")

    const url = new URL(link.href)
    const steamId = url.pathname.split("/")[2]

    let level = undefined
    let elo = undefined
    let nickname = undefined

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

      const data = await response.json()

      level = data.games.cs2.skill_level
      nickname = data.nickname
      elo = data.games.cs2.faceit_elo
    } catch (e) {
      console.log("Failed to fetch FACEIT data:", e)
    }

    // Create and insert the custom text (your existing code)
    let customText = undefined

    if (level) {
      customText = document.createElement("a")
      customText.textContent = `FACEIT level ${level} (${elo})`
      customText.href = `https://www.faceit.com/en/players/${nickname}`
      customText.target = "_blank"
      customText.style.cssText = `
        color: #66c0f4;
        font-weight: bold;
        margin-left: 5px;
        font-size: 0.9em;
        `
    } else {
      customText = document.createElement("span")
      customText.textContent = "No FACEIT level found"
      customText.style.cssText = `
        color: #66c0f4;
        font-weight: bold;
        margin-left: 5px;
        font-size: 0.9em;
        `
    }

    if (link.parentNode && customText) {
      link.parentNode.insertBefore(customText, link.nextSibling)
    }

    // Add delay between requests (except for the last one)
    if (i < linksArray.length - 1) {
      await delay(500) // 500ms delay between requests
    }
  }
}

// Helper function to create delays
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

window.addEventListener("load", () => {
  addTextToSteamLinks()

  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false

    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        shouldCheck = true
      }
    })

    if (shouldCheck) {
      addTextToSteamLinks()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})
