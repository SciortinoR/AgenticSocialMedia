"""
Supabase Storage Service
File: backend/app/services/storage_service.py

Handles file uploads to Supabase Storage.
"""

import os
import uuid
from pathlib import Path
from typing import Optional
from supabase import create_client, Client

from app.core.config import settings


class StorageService:
    """Service for managing file uploads to Supabase Storage"""

    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
        self.bucket_name = "profile-pictures"

    async def upload_profile_picture(
        self, user_id: int, file_content: bytes, content_type: str
    ) -> str:
        """
        Upload a profile picture to Supabase Storage.

        Args:
            user_id: User ID for file naming
            file_content: Binary file content
            content_type: MIME type (e.g., 'image/jpeg')

        Returns:
            Public URL of the uploaded file
        """
        # Generate unique filename
        file_extension = self._get_extension_from_mime(content_type)
        unique_filename = f"{user_id}_{uuid.uuid4()}{file_extension}"
        file_path = f"avatars/{unique_filename}"

        # Upload to Supabase Storage
        response = self.supabase.storage.from_(self.bucket_name).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": content_type, "upsert": "true"}
        )

        # Get public URL
        public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(
            file_path
        )

        return public_url

    async def delete_profile_picture(self, file_path: str) -> bool:
        """
        Delete a profile picture from Supabase Storage.

        Args:
            file_path: Path to the file in storage (e.g., 'avatars/123_abc.jpg')

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            # Extract path from full URL if needed
            if file_path.startswith("http"):
                # Parse path from URL
                path_parts = file_path.split(f"{self.bucket_name}/")
                if len(path_parts) > 1:
                    file_path = path_parts[1]

            self.supabase.storage.from_(self.bucket_name).remove([file_path])
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False

    def _get_extension_from_mime(self, content_type: str) -> str:
        """Get file extension from MIME type"""
        mime_to_ext = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
        }
        return mime_to_ext.get(content_type, ".jpg")


# Singleton instance
storage_service = StorageService()
