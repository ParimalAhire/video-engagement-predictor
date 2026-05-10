# VideoInsight — Video Engagement Analysis System

Deep learning-powered video engagement analysis. Upload any video and get
frame-level engagement predictions, drop-off timestamps, risk zones, and
cut suggestions.

---

## Architecture

```
Frontend (React + Vite)          Backend (FastAPI + Python)
  localhost:3000          →           localhost:8000
  Upload page                         POST /analyze
  Processing page         ←           GET  /status/{job_id}
  Results dashboard                   ResNet50 feature extraction
                                      BiLSTM + Transformer inference
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Your trained model file:** `resnet_best.keras`
- GPU recommended for faster inference (CPU works too, slower)

---

## Setup (First Time Only)

### Step 1 — Place your model file

Copy `resnet_best.keras` from your Google Drive models folder into:

```
backend/model_weights/resnet_best.keras
```

### Step 2 — Run setup

```bash
chmod +x setup.sh start.sh
./setup.sh
```

This installs Python dependencies (TensorFlow, FastAPI, OpenCV) and
Node.js packages (React, Recharts, Framer Motion).

> **Note on setup time:** Installing TensorFlow takes 5–10 minutes.
> OpenCV and CLIP are also large packages.

---

## Running the App

```bash
./start.sh
```

Then open **http://localhost:3000** in your browser.

The backend API docs are available at **http://localhost:8000/docs**.

---

## What You Get

| Output | Description |
|--------|-------------|
| **Overall Score** | Single 0–100 engagement score with rating (Poor/Fair/Good/Excellent) |
| **Engagement Curve** | Interactive timeline showing frame-level engagement across the video |
| **Risk Zones** | Color-coded timeline bar (Green/Amber/Red) showing engagement zones |
| **Drop-off Events** | Exact timestamps where engagement drops sharply with magnitude |
| **Cut Suggestions** | Specific time ranges to trim with reason and priority |
| **Peak Moments** | Top 3 most engaging segments with timestamps |
| **Export** | Download full analysis as JSON |

---

## Project Structure

```
videoinsight/
├── backend/
│   ├── main.py           ← FastAPI app, job management
│   ├── inference.py      ← ResNet50 feature extraction + model inference
│   ├── models.py         ← Pydantic response models
│   ├── requirements.txt
│   ├── model_weights/    ← PUT resnet_best.keras HERE
│   └── uploads/          ← Temporary video storage (auto-cleaned)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   ← Root component, page routing
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx        ← Drag-and-drop upload
│   │   │   ├── ProcessingPage.jsx    ← Progress tracking
│   │   │   └── ResultsPage.jsx       ← Full results dashboard
│   │   ├── components/
│   │   │   ├── EngagementChart.jsx   ← Recharts area chart
│   │   │   ├── RiskTimeline.jsx      ← Color-coded timeline bar
│   │   │   ├── DropOffPanel.jsx      ← Drop-off events list
│   │   │   ├── CutSuggestions.jsx    ← Edit recommendations
│   │   │   └── ScoreCards.jsx        ← Overall score + peak moments
│   │   ├── hooks/
│   │   │   └── useAnalysis.js        ← Upload + polling logic
│   │   └── utils/
│   │       └── api.js                ← API calls + formatting helpers
│   └── package.json
│
├── setup.sh    ← First-time setup
├── start.sh    ← Launch both servers
└── README.md
```

---

## Configuration

### Change MAX_SEQ_LEN

In `backend/inference.py`, line 12:

```python
MAX_SEQ_LEN = 668  # Set this to your actual p75 training value
```

Check your training output — the dataset build step prints:
`ResNet50 seq len: XXX | feat dim: 4096`
Use that value here.

### Change inference FPS

```python
FPS_TARGET = 2  # Frames per second to sample
```

Lower = faster but less accurate. Higher = slower but more detail.

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'clip'`**
```bash
cd backend && source venv/bin/activate
pip install git+https://github.com/openai/CLIP.git
```

**`Model file not found`**
Make sure `resnet_best.keras` is in `backend/model_weights/` not in `backend/`.

**`CUDA out of memory`**
The model runs on CPU by default if no GPU. If you have a GPU and it crashes,
reduce batch size in `inference.py`:
```python
batch_size = 8  # line ~83, was 16
```

**Frontend shows `Network Error`**
Make sure the backend is running on port 8000 before starting the frontend.

---

## Team

- Parimal Ahire · 202301040067
- Atharva Suryawanshi · 202301040283
- Rajveersinh Kher · 202301040233
- Mohit Patil · 202301040272

Guide: Dr. Sunita Barve
MIT Academy of Engineering, Pune
