from pydantic_settings import BaseSettings
from typing import List, ClassVar
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_TITLE: str = "Crop Disease Classification API"
    API_DESCRIPTION: str = "API for classifying crop diseases using EfficientNetV2 model"
    API_VERSION: str = "1.0.0"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    # Hardcoded API key for development/testing
    ALLEAI_API_KEY: str = "alle-m5iGU5J6cKxwMp6J0qAHmVXHmbCPNc6hhYY6"
    
   
    # Model Settings
    MODEL_PATH: str = "pharmiq/phamiq.onnx"
    IMAGE_SIZE: int = 112
    MAX_FILE_SIZE: int = 1024 * 1024 * 1024  # 1GB
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["*"]
    ALLOWED_METHODS: List[str] = ["*"]
    ALLOWED_HEADERS: List[str] = ["*"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Authentication Settings
    SECRET_KEY: str = "0X223232HJHDDUHUHF"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # MongoDB Settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "phamiq")
    

    SITE_URL: str = os.getenv("SITE_URL", "http://localhost:8080/")
    SITE_NAME: str = os.getenv("SITE_NAME", "Phamiq")
    
    # Google Settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables

# Global settings instance
settings = Settings()

# Class mappings
CLASS_DICT = {
    'c1': "cashew_anthracnose",
    'c2': "cashew_gummosis",
    'c3': "cashew_healthy",
    'c4': "cashew_leafminer",
    'c5': "cashew_redrust",
    'ca1': "cassava_bacterial_blight",
    'ca2': "cassava_brown_spot",
    'ca3': "cassava_green_mite",
    'ca4': "cassava_healthy",
    'ca5': "cassava_mosaic",
    'm1': "maize_fall_armyworm",
    'm2': "maize_grasshopper",
    'm3': "maize_healthy",
    'm4': "maize_leaf_beetle",
    'm5': "maize_leaf_blight",
    'm6': "maize_leaf_spot",
    'm7': "maize_streak_virus",
    't1': "tomato_healthy",
    't2': "tomato_leaf_blight",
    't3': "tomato_leaf_curl",
    't4': "tomato_leaf_spot",
    't5': "tomato_verticillium_wilt"
}

IDX_TO_CLASS = {i: j for i, j in enumerate(CLASS_DICT.values())}