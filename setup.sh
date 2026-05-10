#!/bin/bash
# VideoInsight — Full Setup Script
# Run this once to install everything, then use start.sh to launch

set -e

echo "================================================"
echo "  VideoInsight Setup"
echo "================================================"
echo ""

# ── Check Python ──────────────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo "ERROR: Python 3 not found. Install Python 3.10+ first."
  exit 1
fi

# ── Check Node ────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found. Install Node.js 18+ first."
  exit 1
fi

echo "✓ Python: $(python3 --version)"
echo "✓ Node: $(node --version)"
echo ""

# ── Backend setup ─────────────────────────────────────────────────────────────
echo "Setting up backend..."
cd backend

python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip -q
pip install -r requirements.txt

# Create model weights directory
mkdir -p model_weights
mkdir -p uploads

echo ""
echo "================================================"
echo "  IMPORTANT: Place your model file here:"
echo "  backend/model_weights/resnet_best.keras"
echo "================================================"
echo ""

deactivate
cd ..

# ── Frontend setup ────────────────────────────────────────────────────────────
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "================================================"
echo "  Setup complete!"
echo "  Run ./start.sh to launch the application"
echo "================================================"
