# Prefire

This is a [Plasmo extension](https://docs.plasmo.com/) that adds FACEIT levels to Challengermode.

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
