import numpy as np
import cv2
import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import mixed_precision
import torch
import clip as clip_lib
from scipy.ndimage import gaussian_filter1d
from typing import Callable, Optional
import math

# ── Constants ────────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model_weights", "resnet_best.keras")
FPS_TARGET = 2
MAX_SEQ_LEN = 668       # p75 from training — update if your training value differs
FEAT_DIM = 4096
IMG_SIZE = 224

# ── Load model once at startup ────────────────────────────────────────────────
_model = None
_base_resnet = None

def get_model():
    global _model
    if _model is None:
        mixed_precision.set_global_policy('float32')
        print("[VideoInsight] Loading ResNet50 BiLSTM+Transformer model...")
        _model = keras.models.load_model(MODEL_PATH, compile=False)
        print("[VideoInsight] Model loaded.")
    return _model


def get_resnet():
    global _base_resnet
    if _base_resnet is None:
        print("[VideoInsight] Loading ResNet50 feature extractor...")
        _base_resnet = keras.applications.ResNet50(
            weights='imagenet', include_top=False, pooling='avg',
            input_shape=(IMG_SIZE, IMG_SIZE, 3)
        )
        _base_resnet.trainable = False
        print("[VideoInsight] ResNet50 loaded.")
    return _base_resnet


# ── Utility functions ─────────────────────────────────────────────────────────
def seconds_to_str(seconds: float) -> str:
    seconds = max(0, seconds)
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m}:{s:02d}"


def preprocess_frame(frame_bgr: np.ndarray) -> np.ndarray:
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (IMG_SIZE, IMG_SIZE)).astype(np.float32)
    return keras.applications.resnet50.preprocess_input(resized)


def extract_frames(video_path: str, fps_target: int = 2):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_video_frames / video_fps if video_fps > 0 else 0
    frame_interval = max(1, int(video_fps / fps_target))

    frames = []
    timestamps = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            frames.append(frame)
            timestamps.append(frame_idx / video_fps)
        frame_idx += 1

    cap.release()
    return frames, timestamps, video_fps, duration, total_video_frames


def extract_features(frames: list, progress_cb: Optional[Callable] = None) -> np.ndarray:
    base = get_resnet()
    batch_size = 16
    raw_feats = []

    for i in range(0, len(frames), batch_size):
        batch = frames[i:i + batch_size]
        preprocessed = np.stack([preprocess_frame(f) for f in batch])
        feats = base.predict(preprocessed, verbose=0)
        raw_feats.append(feats)
        if progress_cb:
            progress = 20 + int((i / len(frames)) * 40)
            progress_cb(progress, f"Extracting features... {min(i+batch_size, len(frames))}/{len(frames)} frames")

    raw_feats = np.vstack(raw_feats).astype(np.float32)
    diff_feats = np.zeros_like(raw_feats)
    diff_feats[1:] = raw_feats[1:] - raw_feats[:-1]
    return np.concatenate([raw_feats, diff_feats], axis=1)


def predict_engagement(features: np.ndarray, progress_cb: Optional[Callable] = None) -> np.ndarray:
    model = get_model()
    T = len(features)

    if progress_cb:
        progress_cb(65, "Running engagement prediction model...")

    if T >= MAX_SEQ_LEN:
        features_in = features[:MAX_SEQ_LEN]
        valid_len = MAX_SEQ_LEN
    else:
        pad = MAX_SEQ_LEN - T
        features_in = np.vstack([features, np.zeros((pad, FEAT_DIM), np.float32)])
        valid_len = T

    pred = model(
        tf.expand_dims(features_in, 0), training=False
    ).numpy().squeeze(0)

    return pred[:valid_len]


def detect_drop_off_points(engagement: np.ndarray, timestamps: np.ndarray,
                            sensitivity: float = 1.5) -> list:
    diffs = np.diff(engagement)
    negative_diffs = diffs[diffs < 0]
    if len(negative_diffs) == 0:
        return []

    threshold = np.mean(negative_diffs) - sensitivity * np.std(negative_diffs)
    drop_indices = [i + 1 for i, d in enumerate(diffs) if d < threshold]
    drop_indices = [d for d in drop_indices if d < len(timestamps)]

    result = []
    for idx in drop_indices:
        result.append({
            "timestamp": float(timestamps[idx]),
            "timestamp_str": seconds_to_str(timestamps[idx]),
            "frame_idx": idx,
            "engagement_before": float(engagement[idx - 1]) * 100,
            "engagement_after": float(engagement[idx]) * 100,
            "drop_magnitude": float(abs(diffs[idx - 1])) * 100,
        })

    return sorted(result, key=lambda x: x["drop_magnitude"], reverse=True)


def compute_risk_zones(engagement: np.ndarray, timestamps: np.ndarray) -> list:
    zones = []
    if len(engagement) == 0:
        return zones

    def risk_level(score):
        if score >= 0.6:
            return "low"
        elif score >= 0.35:
            return "medium"
        else:
            return "high"

    current_level = risk_level(engagement[0])
    zone_start_idx = 0

    for i in range(1, len(engagement)):
        level = risk_level(engagement[i])
        if level != current_level or i == len(engagement) - 1:
            end_idx = i
            seg = engagement[zone_start_idx:end_idx]
            zones.append({
                "start": float(timestamps[zone_start_idx]),
                "end": float(timestamps[min(end_idx, len(timestamps) - 1)]),
                "start_str": seconds_to_str(timestamps[zone_start_idx]),
                "end_str": seconds_to_str(timestamps[min(end_idx, len(timestamps) - 1)]),
                "risk_level": current_level,
                "avg_engagement": float(np.mean(seg)) * 100,
            })
            current_level = level
            zone_start_idx = i

    return zones


def compute_cut_suggestions(engagement: np.ndarray, timestamps: np.ndarray,
                              min_duration: float = 5.0) -> list:
    suggestions = []
    in_low = False
    start_idx = 0

    for i in range(len(engagement)):
        if engagement[i] < 0.35 and not in_low:
            in_low = True
            start_idx = i
        elif engagement[i] >= 0.35 and in_low:
            in_low = False
            end_idx = i
            duration = timestamps[min(end_idx, len(timestamps)-1)] - timestamps[start_idx]
            if duration >= min_duration:
                seg = engagement[start_idx:end_idx]
                suggestions.append({
                    "start": float(timestamps[start_idx]),
                    "end": float(timestamps[min(end_idx, len(timestamps)-1)]),
                    "start_str": seconds_to_str(timestamps[start_idx]),
                    "end_str": seconds_to_str(timestamps[min(end_idx, len(timestamps)-1)]),
                    "duration": round(duration, 1),
                    "reason": "Sustained low engagement zone",
                    "avg_engagement": float(np.mean(seg)) * 100,
                })

    # Handle case where video ends in a low zone
    if in_low:
        end_idx = len(engagement) - 1
        duration = timestamps[end_idx] - timestamps[start_idx]
        if duration >= min_duration:
            seg = engagement[start_idx:]
            suggestions.append({
                "start": float(timestamps[start_idx]),
                "end": float(timestamps[end_idx]),
                "start_str": seconds_to_str(timestamps[start_idx]),
                "end_str": seconds_to_str(timestamps[end_idx]),
                "duration": round(duration, 1),
                "reason": "Low engagement toward end of video",
                "avg_engagement": float(np.mean(seg)) * 100,
            })

    return sorted(suggestions, key=lambda x: x["avg_engagement"])[:5]


def compute_peak_moments(engagement: np.ndarray, timestamps: np.ndarray,
                          window: int = 10, top_k: int = 3) -> list:
    if len(engagement) < window:
        return []

    scores = []
    for i in range(0, len(engagement) - window, window // 2):
        seg = engagement[i:i + window]
        scores.append((i, float(np.mean(seg))))

    scores.sort(key=lambda x: x[1], reverse=True)
    peaks = []
    used_ranges = []

    for idx, score in scores:
        end_idx = min(idx + window, len(engagement) - 1)
        # Avoid overlapping peaks
        overlaps = any(abs(idx - u) < window for u in used_ranges)
        if not overlaps and len(peaks) < top_k:
            used_ranges.append(idx)
            peaks.append({
                "start": float(timestamps[idx]),
                "end": float(timestamps[end_idx]),
                "start_str": seconds_to_str(timestamps[idx]),
                "end_str": seconds_to_str(timestamps[end_idx]),
                "avg_engagement": round(score * 100, 1),
                "rank": len(peaks) + 1,
            })

    return peaks


def overall_rating(score: float) -> str:
    if score >= 75:
        return "Excellent"
    elif score >= 55:
        return "Good"
    elif score >= 35:
        return "Fair"
    else:
        return "Poor"


# ── Main inference function ───────────────────────────────────────────────────
def run_inference(video_path: str, progress_cb: Optional[Callable] = None) -> dict:
    filename = os.path.basename(video_path)

    if progress_cb:
        progress_cb(5, "Reading video file...")

    frames, timestamps, fps, duration, total_frames = extract_frames(video_path, FPS_TARGET)

    if len(frames) == 0:
        raise ValueError("Could not extract any frames from the video.")

    if progress_cb:
        progress_cb(15, f"Extracted {len(frames)} frames. Preparing features...")

    features = extract_features(frames, progress_cb)

    if progress_cb:
        progress_cb(62, "Running BiLSTM + Transformer model...")

    engagement_raw = predict_engagement(features, progress_cb)

    # Smooth for display
    engagement_smooth = gaussian_filter1d(engagement_raw.astype(np.float64), sigma=2.0)
    engagement_smooth = np.clip(engagement_smooth, 0, 1)
    timestamps_arr = np.array(timestamps[:len(engagement_smooth)])

    if progress_cb:
        progress_cb(80, "Computing engagement metrics...")

    # Build engagement curve
    curve = []
    for i, (t, e) in enumerate(zip(timestamps_arr, engagement_smooth)):
        if e >= 0.6:
            rl = "low"
        elif e >= 0.35:
            rl = "medium"
        else:
            rl = "high"
        curve.append({
            "timestamp": round(float(t), 2),
            "engagement": round(float(e) * 100, 1),
            "risk_level": rl,
        })

    overall_score = round(float(np.mean(engagement_smooth)) * 100, 1)
    drop_offs = detect_drop_off_points(engagement_smooth, timestamps_arr)
    risk_zones = compute_risk_zones(engagement_smooth, timestamps_arr)
    cut_suggestions = compute_cut_suggestions(engagement_smooth, timestamps_arr)
    peak_moments = compute_peak_moments(engagement_smooth, timestamps_arr)

    if progress_cb:
        progress_cb(95, "Finalising results...")

    return {
        "overall_score": overall_score,
        "overall_rating": overall_rating(overall_score),
        "engagement_curve": curve,
        "drop_off_points": drop_offs[:8],
        "risk_zones": risk_zones,
        "cut_suggestions": cut_suggestions,
        "peak_moments": peak_moments,
        "video_stats": {
            "filename": filename,
            "duration": round(duration, 1),
            "duration_str": seconds_to_str(duration),
            "fps": round(fps, 1),
            "total_frames": total_frames,
            "frames_analyzed": len(frames),
            "model_used": "ResNet50 + BiLSTM + Transformer",
        }
    }
