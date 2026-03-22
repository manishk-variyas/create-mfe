#!/usr/bin/env bash
set -e

# ─────────────────────────────────────────────────────────────────────────────
#  create-mfe — install script
#  Usage: bash install.sh
# ─────────────────────────────────────────────────────────────────────────────

BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

info()    { echo -e "  ${CYAN}ℹ${RESET}  $*"; }
success() { echo -e "  ${GREEN}✔${RESET}  $*"; }
warn()    { echo -e "  ${YELLOW}⚠${RESET}  $*"; }
error()   { echo -e "  ${RED}✖${RESET}  $*"; exit 1; }
step()    { echo -e "\n  ${BOLD}→${RESET}  $*"; }

echo ""
echo -e "  ${BOLD}${CYAN}┌─────────────────────────────┐${RESET}"
echo -e "  ${BOLD}${CYAN}│${RESET}${BOLD}       create-mfe  v1.0       ${CYAN}│${RESET}"
echo -e "  ${BOLD}${CYAN}│${RESET}  Vite · React · Federation   ${BOLD}${CYAN}│${RESET}"
echo -e "  ${BOLD}${CYAN}└─────────────────────────────┘${RESET}"
echo ""

# ── 1. Node.js ────────────────────────────────────────────────────────────────
step "Checking Node.js..."

if ! command -v node &>/dev/null; then
  error "Node.js not found. Install Node.js 18+ from https://nodejs.org and re-run this script."
fi

NODE_VERSION=$(node -e "process.stdout.write(process.versions.node)")
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
  error "Node.js $NODE_VERSION detected — version 18 or higher is required."
fi

success "Node.js $NODE_VERSION"

# ── 2. Package manager ────────────────────────────────────────────────────────
step "Detecting package manager..."

PM=""
if command -v pnpm &>/dev/null; then
  PM="pnpm"
  PM_VERSION=$(pnpm --version)
  success "pnpm $PM_VERSION (preferred)"
elif command -v yarn &>/dev/null; then
  PM="yarn"
  PM_VERSION=$(yarn --version)
  success "yarn $PM_VERSION"
elif command -v npm &>/dev/null; then
  PM="npm"
  PM_VERSION=$(npm --version)
  success "npm $PM_VERSION"
  warn "pnpm is recommended for workspaces: npm install -g pnpm"
else
  error "No package manager found. Install pnpm: npm install -g pnpm"
fi

# ── 3. TypeScript ─────────────────────────────────────────────────────────────
step "Checking TypeScript..."

if ! command -v tsc &>/dev/null; then
  warn "TypeScript not found globally — installing..."
  if [ "$PM" = "pnpm" ]; then
    pnpm add -g typescript
  elif [ "$PM" = "yarn" ]; then
    yarn global add typescript
  else
    npm install -g typescript
  fi
fi

TS_VERSION=$(tsc --version | awk '{print $2}')
success "TypeScript $TS_VERSION"

# ── 4. Install dependencies ───────────────────────────────────────────────────
step "Installing dependencies..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "package.json" ]; then
  error "package.json not found. Run this script from the create-mfe project root."
fi

if [ "$PM" = "pnpm" ]; then
  pnpm install
elif [ "$PM" = "yarn" ]; then
  yarn install
else
  npm install
fi

success "Dependencies installed"

# ── 5. Build ──────────────────────────────────────────────────────────────────
step "Building CLI..."

if [ "$PM" = "pnpm" ]; then
  pnpm build
elif [ "$PM" = "yarn" ]; then
  yarn build
else
  npm run build
fi

if [ ! -f "dist/index.js" ]; then
  error "Build failed — dist/index.js not found."
fi

# Make the entry executable
chmod +x dist/index.js

success "Build complete"

# ── 6. Link globally ──────────────────────────────────────────────────────────
step "Linking create-mfe globally..."

if [ "$PM" = "pnpm" ]; then
  pnpm link --global
elif [ "$PM" = "yarn" ]; then
  yarn link
else
  npm link
fi

success "create-mfe linked globally"

# ── 7. Verify ─────────────────────────────────────────────────────────────────
step "Verifying installation..."

if ! command -v create-mfe &>/dev/null; then
  warn "create-mfe not found in PATH after linking."
  warn "You may need to add your package manager's global bin to PATH:"
  echo ""
  if [ "$PM" = "pnpm" ]; then
    echo -e "    ${CYAN}export PATH=\"\$(pnpm root -g)/../.bin:\$PATH\"${RESET}"
  elif [ "$PM" = "yarn" ]; then
    echo -e "    ${CYAN}export PATH=\"\$(yarn global bin):\$PATH\"${RESET}"
  else
    echo -e "    ${CYAN}export PATH=\"\$(npm bin -g):\$PATH\"${RESET}"
  fi
  echo ""
  warn "Add the above line to your ~/.bashrc, ~/.zshrc, or ~/.profile and restart your shell."
else
  INSTALLED_VERSION=$(create-mfe --version 2>/dev/null || echo "unknown")
  success "create-mfe $INSTALLED_VERSION is ready"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}${GREEN}All done!${RESET}"
echo ""
echo -e "  ${BOLD}Usage:${RESET}"
echo -e "    ${CYAN}create-mfe init my-app${RESET}         scaffold a new monorepo"
echo -e "    ${CYAN}create-mfe add dashboard${RESET}       add a module to existing workspace"
echo -e "    ${CYAN}create-mfe list${RESET}                list all modules & ports"
echo ""
