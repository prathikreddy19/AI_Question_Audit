from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str
    DATABASE_NAME: str = "AI_Question_Audit"
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=(
            ".env",
            str(Path(__file__).resolve().parent.parent.parent / ".env"),
            "../.env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
