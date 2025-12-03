"""Google Cloud Storage service for file uploads."""

import asyncio
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from functools import partial
from typing import BinaryIO

from google.cloud import storage
from google.cloud.exceptions import NotFound

from src.core.config import get_settings

# Thread pool for blocking GCS operations
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="gcs_upload")

logger = logging.getLogger(__name__)

# PDF magic bytes
PDF_MAGIC_BYTES = b"%PDF"

# Allowed MIME types for document uploads
ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": ".pdf",
}


class StorageError(Exception):
    """Base exception for storage operations."""

    pass


class FileValidationError(StorageError):
    """Exception raised when file validation fails."""

    pass


class StorageService:
    """Google Cloud Storage service for managing file uploads."""

    def __init__(self) -> None:
        """Initialize the storage service."""
        self.settings = get_settings()
        self._client: storage.Client | None = None
        self._bucket: storage.Bucket | None = None

    @property
    def client(self) -> storage.Client:
        """Get or create the GCS client."""
        if self._client is None:
            self._client = storage.Client()
        return self._client

    @property
    def bucket(self) -> storage.Bucket:
        """Get the configured GCS bucket."""
        if self._bucket is None:
            bucket_name = self.settings.gcs_bucket_name
            if not bucket_name:
                raise StorageError("GCS_BUCKET_NAME is not configured")
            self._bucket = self.client.bucket(bucket_name)
        return self._bucket

    def validate_file_metadata(
        self,
        content_type: str,
        filename: str,
    ) -> tuple[bool, str]:
        """
        Validate file metadata before reading content.

        Args:
            content_type: The declared content type
            filename: The original filename

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check content type
        if content_type not in ALLOWED_DOCUMENT_TYPES:
            return False, f"File type '{content_type}' is not allowed. Only PDF files are accepted."

        # Check file extension
        if not filename.lower().endswith(".pdf"):
            return False, "File must have a .pdf extension"

        return True, ""

    def validate_file_content(
        self,
        file_content: bytes,
    ) -> tuple[bool, str]:
        """
        Validate file content after reading.

        Args:
            file_content: The file bytes to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file size
        max_size_bytes = self.settings.max_upload_size_mb * 1024 * 1024
        if len(file_content) > max_size_bytes:
            return (
                False,
                f"File size exceeds maximum allowed size of {self.settings.max_upload_size_mb}MB",
            )

        # Validate PDF magic bytes
        if not file_content.startswith(PDF_MAGIC_BYTES):
            return False, "File content does not appear to be a valid PDF"

        return True, ""

    def validate_file(
        self,
        file_content: bytes,
        content_type: str,
        filename: str,
    ) -> tuple[bool, str]:
        """
        Validate file type and content (legacy method for backwards compatibility).

        Args:
            file_content: The file bytes to validate
            content_type: The declared content type
            filename: The original filename

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate metadata first
        is_valid, error = self.validate_file_metadata(content_type, filename)
        if not is_valid:
            return False, error

        # Then validate content
        return self.validate_file_content(file_content)

    def generate_file_path(self, filename: str) -> str:
        """
        Generate a unique file path for upload.

        Args:
            filename: The original filename

        Returns:
            A unique path within the bucket
        """
        # Generate unique ID to prevent overwrites
        unique_id = uuid.uuid4().hex[:12]
        # Sanitize filename - keep only alphanumeric, dash, underscore, and dot
        safe_name = "".join(
            c if c.isalnum() or c in "-_." else "_" for c in filename
        )
        # Combine with prefix
        return f"{self.settings.gcs_library_path_prefix}{unique_id}_{safe_name}"

    def upload_file(
        self,
        file_content: bytes,
        destination_path: str,
        content_type: str,
        filename: str,
    ) -> dict:
        """
        Upload a file to GCS (blocking).

        Args:
            file_content: The file bytes to upload
            destination_path: The path within the bucket
            content_type: The MIME type of the file
            filename: The original filename (for Content-Disposition)

        Returns:
            Dict with file_path, file_url, file_name, file_size, content_type
        """
        blob = self.bucket.blob(destination_path)

        # Set metadata
        blob.content_type = content_type
        blob.content_disposition = f'attachment; filename="{filename}"'

        # Upload
        blob.upload_from_string(file_content, content_type=content_type)

        logger.info(f"Uploaded file to GCS: {destination_path}")

        return {
            "file_path": destination_path,
            "file_url": f"gs://{self.bucket.name}/{destination_path}",
            "file_name": filename,
            "file_size": len(file_content),
            "content_type": content_type,
        }

    async def upload_file_async(
        self,
        file_content: bytes,
        destination_path: str,
        content_type: str,
        filename: str,
    ) -> dict:
        """
        Upload a file to GCS asynchronously using a thread pool.

        This method runs the blocking GCS upload in a thread pool executor
        to avoid blocking the async event loop.

        Args:
            file_content: The file bytes to upload
            destination_path: The path within the bucket
            content_type: The MIME type of the file
            filename: The original filename (for Content-Disposition)

        Returns:
            Dict with file_path, file_url, file_name, file_size, content_type
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            _executor,
            partial(
                self.upload_file,
                file_content,
                destination_path,
                content_type,
                filename,
            ),
        )

    def upload_file_stream(
        self,
        file_stream: BinaryIO,
        destination_path: str,
        content_type: str,
        filename: str,
    ) -> dict:
        """
        Upload a file stream to GCS.

        Args:
            file_stream: The file stream to upload
            destination_path: The path within the bucket
            content_type: The MIME type of the file
            filename: The original filename

        Returns:
            Dict with file_path, file_url, file_name, file_size, content_type
        """
        blob = self.bucket.blob(destination_path)

        # Set metadata
        blob.content_type = content_type
        blob.content_disposition = f'attachment; filename="{filename}"'

        # Upload from file stream
        blob.upload_from_file(file_stream, content_type=content_type)

        # Get the size
        blob.reload()
        file_size = blob.size or 0

        logger.info(f"Uploaded file stream to GCS: {destination_path}")

        return {
            "file_path": destination_path,
            "file_url": f"gs://{self.bucket.name}/{destination_path}",
            "file_name": filename,
            "file_size": file_size,
            "content_type": content_type,
        }

    def generate_signed_url(
        self,
        file_path: str,
        expiration_minutes: int | None = None,
        disposition: str = "inline",
    ) -> str:
        """
        Generate a signed URL for accessing a file.

        Args:
            file_path: The path to the file in the bucket
            expiration_minutes: URL expiration time in minutes (default from settings)
            disposition: Content-Disposition type ('inline' for viewing, 'attachment' for download)

        Returns:
            A signed URL for accessing the file
        """
        if expiration_minutes is None:
            expiration_minutes = self.settings.upload_signed_url_expiration_minutes

        blob = self.bucket.blob(file_path)

        # Extract filename from path for Content-Disposition header
        filename = file_path.split("/")[-1]
        # Remove unique prefix if present (first 13 chars: 12 hex + underscore)
        if len(filename) > 13 and filename[12] == "_":
            filename = filename[13:]

        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expiration_minutes),
            method="GET",
            response_disposition=f'{disposition}; filename="{filename}"',
            response_type="application/pdf",
        )

        logger.debug(f"Generated signed URL for: {file_path} (disposition={disposition})")
        return url

    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from GCS.

        Args:
            file_path: The path to the file in the bucket

        Returns:
            True if deleted, False if not found
        """
        blob = self.bucket.blob(file_path)

        try:
            blob.delete()
            logger.info(f"Deleted file from GCS: {file_path}")
            return True
        except NotFound:
            logger.warning(f"File not found for deletion: {file_path}")
            return False

    def file_exists(self, file_path: str) -> bool:
        """
        Check if a file exists in GCS.

        Args:
            file_path: The path to the file in the bucket

        Returns:
            True if the file exists
        """
        blob = self.bucket.blob(file_path)
        return blob.exists()

    def get_file_metadata(self, file_path: str) -> dict | None:
        """
        Get metadata for a file in GCS.

        Args:
            file_path: The path to the file in the bucket

        Returns:
            Dict with metadata or None if not found
        """
        blob = self.bucket.blob(file_path)

        try:
            blob.reload()
            return {
                "file_path": file_path,
                "file_size": blob.size,
                "content_type": blob.content_type,
                "created": blob.time_created,
                "updated": blob.updated,
            }
        except NotFound:
            return None


# Singleton instance for dependency injection
_storage_service: StorageService | None = None


def get_storage_service() -> StorageService:
    """Get the storage service singleton."""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service
