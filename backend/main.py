from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import uuid
import os
import shutil
from pathlib import Path
from inference import run_inference
from models import AnalysisResult, AnalysisStatus
import asyncio
from typing import Dict

app = FastAPI(title="VideoInsight API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# In-memory job store
jobs: Dict[str, dict] = {}


@app.get("/health")
async def health():
    return {"status": "ok", "message": "VideoInsight API running"}


@app.post("/analyze")
async def analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    # Validate file type
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
        raise HTTPException(400, "Unsupported file format. Use MP4, AVI, MOV, or MKV.")

    # Check file size (max 500MB)
    job_id = str(uuid.uuid4())
    video_path = UPLOAD_DIR / f"{job_id}_{file.filename}"

    # Save uploaded file
    with open(video_path, "wb") as f:
        content = await file.read()
        if len(content) > 500 * 1024 * 1024:
            raise HTTPException(400, "File too large. Maximum size is 500MB.")
        f.write(content)

    # Initialize job
    jobs[job_id] = {
        "status": "queued",
        "progress": 0,
        "message": "Video uploaded, queuing analysis...",
        "result": None,
        "error": None,
        "filename": file.filename,
        "video_path": str(video_path)
    }

    # Run inference in background
    background_tasks.add_task(process_video, job_id, str(video_path))

    return {"job_id": job_id, "status": "queued"}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "progress": job["progress"],
        "message": job["message"],
        "result": job["result"],
        "error": job["error"],
        "filename": job["filename"]
    }


@app.delete("/job/{job_id}")
async def delete_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[job_id]
    # Clean up video file
    if os.path.exists(job["video_path"]):
        os.remove(job["video_path"])
    del jobs[job_id]
    return {"message": "Job deleted"}


async def process_video(job_id: str, video_path: str):
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["progress"] = 5
        jobs[job_id]["message"] = "Loading model..."

        def progress_callback(progress: int, message: str):
            jobs[job_id]["progress"] = progress
            jobs[job_id]["message"] = message

        result = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: run_inference(video_path, progress_callback)
        )

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = 100
        jobs[job_id]["message"] = "Analysis complete!"
        jobs[job_id]["result"] = result

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["message"] = f"Analysis failed: {str(e)}"
    finally:
        # Clean up video file after processing
        if os.path.exists(video_path):
            os.remove(video_path)

@app.get("/health")
async def health():
    return {"status": "ok", "message": "VideoInsight API running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
