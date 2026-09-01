import os
import sys
import uvicorn

if __name__ == "__main__":
    raw_port = os.getenv("PORT", "8000").strip()
    try:
        port = int(raw_port)
    except ValueError:
        port = 8000

    print(f"[*] Starting Khan Store FastAPI Backend on 0.0.0.0:{port}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, log_level="info")
