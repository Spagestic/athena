"""
EyeTrax WebSocket Server
Receives base64-encoded JPEG frames from the browser,
runs gaze estimation via eyetrax, and returns gaze coordinates.

Setup:
  pip install eyetrax websockets opencv-python numpy

Run:
  python app/analysis/eyetrax_server.py

Then click EYETRAX in the dashboard. Gaze tracking starts immediately —
no calibration step needed (pre-trained model).

Troubleshooting:
- "Connection refused": this server isn't running.
- No gaze dot appearing: make sure your face is clearly visible in the camera
  and the analysis session has started (camera must be on first).
"""

import asyncio
import base64
import json
import logging
import os
import sys

import cv2
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("eyetrax_server")

try:
    import websockets
except ImportError:
    logger.error("websockets not installed. Run: pip install websockets")
    sys.exit(1)

try:
    from eyetrax import GazeEstimator
    logger.info("eyetrax loaded OK")
except ImportError:
    logger.error("eyetrax not installed. Run: pip install eyetrax")
    sys.exit(1)

HOST = "localhost"
PORT = 8766

MODEL_PATH = os.path.join(os.path.dirname(__file__), "gaze_model.pkl")

# Initialise estimator once at startup
logger.info("Initialising GazeEstimator...")
try:
    estimator = GazeEstimator()
    logger.info("GazeEstimator ready")
except Exception as exc:
    logger.error("Failed to initialise GazeEstimator: %s", exc)
    sys.exit(1)

# Load saved calibration model if it exists
model_loaded = False
if os.path.isfile(MODEL_PATH):
    try:
        estimator.load_model(MODEL_PATH)
        model_loaded = True
        logger.info("Loaded calibrated gaze model from %s", MODEL_PATH)
    except Exception as exc:
        logger.error("Failed to load model from %s: %s", MODEL_PATH, exc)
else:
    logger.error(
        "\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "  NO CALIBRATED MODEL FOUND.\n"
        "  EyeTrax requires a personal calibration before it can\n"
        "  predict gaze. Run this ONCE to create the model file:\n"
        "\n"
        "    python -m eyetrax.app.build_model --outfile app/analysis/gaze_model.pkl\n"
        "\n"
        "  A fullscreen window will open — look at each dot.\n"
        "  Close the browser tab first (camera is shared).\n"
        "  After calibration the server will load the model automatically.\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    )

def _predict_gaze(frame: np.ndarray):
    """Returns (x, y) normalised 0-1 or None."""
    if not model_loaded:
        return None
    try:
        result = estimator.extract_features(frame)
        # extract_features returns (features_array, blink_bool), not just features
        if result is None:
            return None
        features, _blink = result
        if features is None:
            return None
        gaze = estimator.predict([features])
        if gaze is None or len(gaze) == 0:
            return None
        x, y = float(gaze[0][0]), float(gaze[0][1])
        # Model outputs raw screen pixel coordinates — normalise to 0-1
        from eyetrax.utils.screen import get_screen_size
        sw, sh = get_screen_size()
        x, y = x / sw, y / sh
        return max(0.0, min(1.0, x)), max(0.0, min(1.0, y))
    except Exception as e:
        logger.warning("Gaze prediction error: %s", type(e).__name__, exc_info=False)
        return None


async def handle_client(websocket) -> None:
    logger.info("Client connected from %s", websocket.remote_address)
    await websocket.send(json.dumps({"type": "status", "status": "connected"}))

    frame_count = 0
    gaze_count = 0

    try:
        async for raw in websocket:
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")

            if msg_type == "frame":
                if not model_loaded:
                    # Only warn once every 300 frames so the log isn't spammed
                    if frame_count == 0:
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "No calibrated model. Run: python -m eyetrax.app.build_model --outfile app/analysis/gaze_model.pkl"
                        }))
                    frame_count += 1
                    continue
                b64 = msg.get("data", "")
                if not b64:
                    continue
                try:
                    img_bytes = base64.b64decode(b64)
                    arr = np.frombuffer(img_bytes, dtype=np.uint8)
                    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                except Exception as e:
                    logger.warning("Frame decode error: %s", e)
                    continue

                if frame is None or frame.size == 0:
                    continue

                frame_count += 1

                result = _predict_gaze(frame)
                if result is not None:
                    x, y = result
                    gaze_count += 1
                    if gaze_count == 1:
                        logger.info("First gaze prediction received — tracking active")
                    await websocket.send(json.dumps({
                        "type": "gaze",
                        "x": round(x, 4),
                        "y": round(y, 4),
                    }))
                else:
                    # Log periodically so the console isn't spammed
                    if frame_count % 30 == 0:
                        logger.warning(
                            "No gaze prediction for last 30 frames "
                            "(total frames=%d, gaze=%d). "
                            "Is your face fully visible in the camera?",
                            frame_count, gaze_count,
                        )

            elif msg_type == "calibrate":
                if model_loaded:
                    await websocket.send(json.dumps({"type": "status", "status": "calibrated"}))
                else:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "No calibrated model. Run: python -m eyetrax.app.build_model --outfile app/analysis/gaze_model.pkl"
                    }))

    except websockets.ConnectionClosed:
        logger.info("Client disconnected (frames=%d, gaze=%d)", frame_count, gaze_count)


async def main() -> None:
    logger.info("EyeTrax server listening on ws://%s:%d", HOST, PORT)
    logger.info("Waiting for browser to connect — click EYETRAX in the dashboard")
    async with websockets.serve(handle_client, HOST, PORT):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
