# Notion Hub

A desktop app that syncs external services into your Notion workspace. Built with [Tauri](https://tauri.app/) (Rust backend), React, and TypeScript.

## Features

- **Visual Action Builder** – create automation rules using a drag-and-drop block editor. Each action consists of a trigger, an action step, and optional field mappings.
- **Canvas LMS Integration** – fetch your enrolled courses and assignments and push them into a Notion database.
- **Notion API** – authenticate with a personal Notion integration token; the app validates the connection and displays your account email.
- **Theming** – choose Light, Dark, Midnight, or follow the system preference.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/)

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run tauri dev
```

### Build for production

```bash
npm run tauri build
```

## Configuration

Open **App Settings** from the sidebar:

1. **Notion Integration Token** – create one at [notion.so/my-integrations](https://www.notion.so/my-integrations) and paste it here. The app will verify the connection immediately.
2. **Canvas Token & School Domain** – needed for the Canvas LMS integration so the app can pull your courses and assignments.
3. **Theme** – select Light, Dark, Midnight, or System.

Settings are persisted locally via `localStorage`.

## Project Structure

```
src/                  # React frontend
  components/         # UI components (Sidebar, HomePage, AppSettings, block editor, …)
  models/             # TypeScript models for Canvas and Notion API responses
  utils/              # API helpers (canvas.ts, notion.ts) and storage utilities
  types/              # Shared TypeScript interfaces
src-tauri/            # Rust backend (Tauri commands)
  src/web/            # Canvas and Notion HTTP clients
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2 |
| Frontend | React 19, TypeScript, Vite |
| Backend | Rust |
| Rich text editor | Slate.js |
| Icons | Lucide React |

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Tauri extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
