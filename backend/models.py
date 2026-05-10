from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class AnalysisStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class DropOffPoint(BaseModel):
    timestamp: float        # seconds
    timestamp_str: str      # "2:14"
    frame_idx: int
    engagement_before: float
    engagement_after: float
    drop_magnitude: float   # how sharp the drop was


class RiskZone(BaseModel):
    start: float            # seconds
    end: float              # seconds
    start_str: str
    end_str: str
    risk_level: str         # "high", "medium", "low"
    avg_engagement: float


class CutSuggestion(BaseModel):
    start: float
    end: float
    start_str: str
    end_str: str
    duration: float
    reason: str
    avg_engagement: float


class PeakMoment(BaseModel):
    start: float
    end: float
    start_str: str
    end_str: str
    avg_engagement: float
    rank: int


class VideoStats(BaseModel):
    filename: str
    duration: float
    duration_str: str
    fps: float
    total_frames: int
    frames_analyzed: int
    model_used: str


class EngagementPoint(BaseModel):
    timestamp: float
    engagement: float       # 0-100
    risk_level: str         # "high", "medium", "low"


class AnalysisResult(BaseModel):
    overall_score: float            # 0-100
    overall_rating: str             # "Poor", "Fair", "Good", "Excellent"
    engagement_curve: List[EngagementPoint]
    drop_off_points: List[DropOffPoint]
    risk_zones: List[RiskZone]
    cut_suggestions: List[CutSuggestion]
    peak_moments: List[PeakMoment]
    video_stats: VideoStats
