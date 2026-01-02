from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, admin, lecturer, student, timetable
import os

app = FastAPI(title="Timetable Management System")

# Read allowed frontend origins from env for secure configuration.
# Provide a comma-separated list in SERVER/.env, e.g.
# FRONTEND_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
raw = os.getenv("FRONTEND_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080")
allow_origins = [o.strip() for o in raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Note: do NOT add wildcard Access-Control-Allow-Origin when allow_credentials
# is True. The `CORSMiddleware` above will handle proper CORS responses.

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(lecturer.router)
app.include_router(student.router)
app.include_router(timetable.router)


@app.get("/")
def root():
    return {"message": "Timetable backend is running!"}
