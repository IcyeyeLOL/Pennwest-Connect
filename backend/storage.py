"""File storage abstraction for local and cloud storage."""
import os
import logging
from typing import Optional
try:
    from config import UPLOAD_DIR
except ImportError:
    UPLOAD_DIR = "uploads"

logger = logging.getLogger(__name__)

class StorageBackend:
    """Abstract base class for storage backends."""
    
    def save_file(self, file_content: bytes, filename: str) -> str:
        """Save file and return the path/URL."""
        raise NotImplementedError
    
    def get_file(self, file_path: str) -> bytes:
        """Retrieve file content."""
        raise NotImplementedError
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file."""
        raise NotImplementedError
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists."""
        raise NotImplementedError

class LocalStorage(StorageBackend):
    """Local filesystem storage backend."""
    
    def __init__(self, base_dir: str = UPLOAD_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)
    
    def save_file(self, file_content: bytes, filename: str) -> str:
        """Save file to local filesystem."""
        file_path = os.path.join(self.base_dir, filename)
        with open(file_path, 'wb') as f:
            f.write(file_content)
        return file_path
    
    def get_file(self, file_path: str) -> bytes:
        """Read file from local filesystem."""
        with open(file_path, 'rb') as f:
            return f.read()
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from local filesystem."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists."""
        return os.path.exists(file_path)

class CloudinaryStorage(StorageBackend):
    """Cloudinary storage backend (easier alternative to S3)."""
    
    def __init__(self, cloud_name: str, api_key: str, api_secret: str):
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret
        )
        self.cloudinary = cloudinary
        self.uploader = cloudinary.uploader
    
    def save_file(self, file_content: bytes, filename: str) -> str:
        """Upload file to Cloudinary and return the public_id."""
        import io
        from cloudinary.uploader import upload
        
        # Upload file
        result = upload(
            io.BytesIO(file_content),
            folder="pennwest_uploads",
            public_id=filename.split('.')[0],  # Remove extension for public_id
            resource_type="auto"  # Auto-detect file type
        )
        
        # Return the public_id with folder path
        return result['public_id']
    
    def get_file(self, file_path: str) -> bytes:
        """Download file from Cloudinary."""
        import requests
        from cloudinary.utils import cloudinary_url
        
        # Generate URL for the file
        url, _ = cloudinary_url(file_path, resource_type="auto")
        
        # Download file
        response = requests.get(url)
        response.raise_for_status()
        return response.content
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from Cloudinary."""
        try:
            from cloudinary.uploader import destroy
            result = destroy(file_path, resource_type="auto")
            return result.get('result') == 'ok'
        except Exception as e:
            logger.error(f"Error deleting file {file_path} from Cloudinary: {e}")
            return False
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists in Cloudinary."""
        try:
            from cloudinary.api import resource
            resource(file_path, resource_type="auto")
            return True
        except:
            return False

class S3Storage(StorageBackend):
    """AWS S3 storage backend."""
    
    def __init__(self, bucket_name: str, region: str = "us-east-1"):
        import boto3
        self.bucket_name = bucket_name
        self.s3_client = boto3.client('s3', region_name=region)
    
    def save_file(self, file_content: bytes, filename: str) -> str:
        """Upload file to S3 and return the S3 key."""
        key = f"uploads/{filename}"
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=file_content
        )
        return key
    
    def get_file(self, file_path: str) -> bytes:
        """Download file from S3."""
        response = self.s3_client.get_object(
            Bucket=self.bucket_name,
            Key=file_path
        )
        return response['Body'].read()
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from S3."""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_path
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting file {file_path} from S3: {e}")
            return False
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists in S3."""
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_path
            )
            return True
        except:
            return False
    
    def get_presigned_url(self, file_path: str, expiration: int = 3600) -> str:
        """Generate a presigned URL for file access."""
        return self.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket_name, 'Key': file_path},
            ExpiresIn=expiration
        )

# Initialize storage backend based on environment
def get_storage() -> StorageBackend:
    """Get the appropriate storage backend based on environment variables."""
    storage_type = os.getenv("STORAGE_TYPE", "local").lower()
    
    if storage_type == "cloudinary":
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        api_key = os.getenv("CLOUDINARY_API_KEY")
        api_secret = os.getenv("CLOUDINARY_API_SECRET")
        
        if not all([cloud_name, api_key, api_secret]):
            logger.warning("Cloudinary credentials not set, falling back to local storage")
            return LocalStorage()
        try:
            return CloudinaryStorage(cloud_name, api_key, api_secret)
        except Exception as e:
            logger.warning(f"Failed to initialize Cloudinary storage: {e}. Falling back to local storage.")
            return LocalStorage()
    
    elif storage_type == "s3":
        bucket_name = os.getenv("S3_BUCKET_NAME")
        region = os.getenv("AWS_REGION", "us-east-1")
        if not bucket_name:
            logger.warning("S3_BUCKET_NAME not set, falling back to local storage")
            return LocalStorage()
        try:
            return S3Storage(bucket_name, region)
        except Exception as e:
            logger.warning(f"Failed to initialize S3 storage: {e}. Falling back to local storage.")
            return LocalStorage()
    else:
        # Default to local storage
        return LocalStorage()

# Global storage instance (lazy initialization)
_storage_instance: Optional[StorageBackend] = None

def get_storage_instance() -> StorageBackend:
    """Get or create storage instance."""
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = get_storage()
    return _storage_instance

# For backward compatibility
storage = get_storage_instance()

