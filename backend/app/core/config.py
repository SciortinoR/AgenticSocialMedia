"""
Application configuration settings
File: backend/app/core/config.py

Loads configuration from environment variables using Pydantic settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "AgenticSocialMedia"
    app_env: str = "development"
    debug: bool = True
    secret_key: str

    # Database
    database_url: str
    database_echo: bool = False

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"

    # Anthropic (optional)
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-haiku-20240307"

    # Groq LLM
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-70b-versatile"
    use_mock_ai: bool = False

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""

    # Instagram OAuth
    instagram_client_id: str = ""
    instagram_client_secret: str = ""
    instagram_redirect_uri: str = ""

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # JWT
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60

    # Agent Configuration
    agent_max_actions_per_day: int = 10
    agent_cache_ttl_seconds: int = 3600

    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS origins string to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()
