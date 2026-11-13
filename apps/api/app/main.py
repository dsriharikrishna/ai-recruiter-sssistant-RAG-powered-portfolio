from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


app = FastAPI(title="AI Recruiter Assistant API")


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok")

