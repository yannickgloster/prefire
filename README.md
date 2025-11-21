# Prefire

[![Chromium](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/prefire/ocamphmmohobniabgakalobckpjdmkbc)
[![Firefox](https://img.shields.io/amo/stars/prefire?style=for-the-badge&label=Firefox&color=FF7139&logo=Firefox-Browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/prefire/)
[![GitHub License](https://img.shields.io/github/license/yannickgloster/prefire?style=for-the-badge&color=6677FF)](https://github.com/yannickgloster/prefire/blob/main/LICENSE)

This is a [Plasmo extension](https://docs.plasmo.com/) that adds FACEIT levels to Challengermode.

<img width="1920" height="945" alt="www challengermode com_s_ZTGAMERS_games_a4c8ec4d-0d21-46ca-62fc-08de1bdee2e1" src="https://github.com/user-attachments/assets/4ef3fafc-8f9d-4040-b89a-3565c0571ac0" />

## Features

- FACEIT ranks for each user with a connected Steam account
- FACEIT average kills and ADR in the last 30 matches
- Average team ranks on a match page

# Development

## Installation

1. Clone the repository
2. Set up `.env.local` file
3. Run `pnpm install`

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

For further guidance, [visit the Plasmo documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

### Building for Firefox

```bash
plasmo dev --target=firefox-mv2
```
