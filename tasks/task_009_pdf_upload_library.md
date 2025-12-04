# Task 009: PDF Document Upload for Library Resources

## Status: COMPLETED

## Overview

Add the ability to upload PDF documents directly to the Library resource management system. Previously, the Library only supported external links or embedded HTML content. This enhancement allows administrators to upload PDF files that are stored in Google Cloud Storage and served to users.

## Implementation Summary

### What Was Implemented

1. **Backend Storage Service** (`src/services/storage_service.py`)
   - GCS client integration for file uploads
   - File validation (MIME type, file size, PDF magic bytes)
   - Signed URL generation with configurable disposition (inline/attachment)
   - File deletion support

2. **API Endpoints** (`src/api/routes/library.py`)
   - `POST /library/upload` - Upload PDF documents (super_admin only)
   - `GET /library/{resource_id}/download` - Get signed URL for viewing/downloading

3. **Frontend Upload Component** (`frontend/src/components/admin/FileUpload.tsx`)
   - Drag-and-drop file upload
   - Upload progress indicator
   - File type and size validation
   - Success/error states with clear feedback

4. **Library Resource Form** (`frontend/src/components/admin/LibraryResourceForm.tsx`)
   - Added "Upload File" source option (only visible when resource type is PDF)
   - Integrated FileUpload component
   - Automatic upload on file selection

5. **PDF Viewer** (`frontend/src/components/library/ResourceViewer.tsx`)
   - Fetches signed URL from backend for uploaded PDFs
   - Displays PDF inline using iframe
   - "Open in New Tab" and "Download" buttons

### Files Changed

#### New Files
| File | Description |
|------|-------------|
| `src/services/storage_service.py` | GCS upload/download service with signed URLs |
| `frontend/src/components/admin/FileUpload.tsx` | Reusable drag-and-drop file upload component |

#### Modified Files
| File | Changes |
|------|---------|
| `pyproject.toml` | Added `google-cloud-storage = "^2.14.0"` |
| `src/core/config.py` | Added GCS configuration (bucket name, path prefix, max size, URL expiration) |
| `src/core/constants.py` | Added `UPLOADED` to `LibraryResourceSource` enum |
| `src/api/routes/library.py` | Added upload and download endpoints |
| `src/api/schemas/library.py` | Added `FileUploadResponse` and `FileDownloadResponse` schemas |
| `src/api/dependencies.py` | Added `get_storage_service_dependency` |
| `frontend/src/services/library.ts` | Added `uploadLibraryDocument` and `getResourceDownloadUrl` functions |
| `frontend/src/components/admin/LibraryResourceForm.tsx` | Integrated file upload UI with "Upload File" source option |
| `frontend/src/components/admin/index.ts` | Exported `FileUpload` component |
| `frontend/src/components/library/ResourceViewer.tsx` | Added `UploadedPdfViewer` for displaying uploaded PDFs |
| `frontend/src/types/models.ts` | Added `'uploaded'` to `LibraryResourceSource` type |
| `.env` | Added `GCS_BUCKET_NAME` configuration |

### Configuration

#### Environment Variables
```bash
# Required for PDF uploads
GCS_BUCKET_NAME=adk-platform-dev-uploads-12ef4ccf  # or your bucket name

# Optional (defaults shown)
GCS_LIBRARY_PATH_PREFIX=library/documents/
MAX_UPLOAD_SIZE_MB=50
UPLOAD_SIGNED_URL_EXPIRATION_MINUTES=60
```

#### GCS Bucket Permissions
The service account needs `roles/storage.objectAdmin` on the bucket:
```bash
gcloud storage buckets add-iam-policy-binding gs://YOUR_BUCKET_NAME \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

### How to Use

1. Go to **Admin Console** → **Library** tab
2. Click **"Add Resource"**
3. Set **Resource Type** to **"PDF"**
4. Set **Source** to **"Upload File"** (this option only appears for PDF type)
5. Drag and drop a PDF file or click to browse (max 50MB)
6. Fill in title, description, and other fields
7. Click **"Create Resource"**

Users can then view the PDF directly in the Library page with options to open in a new tab or download.

## Acceptance Criteria

- [x] Super admins can upload PDF files up to 50MB
- [x] Uploaded PDFs are stored securely in GCS
- [x] Resource form shows file upload option when type is "pdf" and source is "uploaded"
- [x] Upload progress is displayed during file upload
- [x] Uploaded files can be viewed inline via signed URLs
- [x] "Open in New Tab" and "Download" buttons available for uploaded PDFs
- [x] File type and size validation prevents invalid uploads
- [x] Existing external link and embedded content options still work
- [x] PDF magic bytes validation (server-side security)

## Deployment Notes

For production deployment:

1. **Set environment variable** in Cloud Run:
   ```
   GCS_BUCKET_NAME=adk-platform-production-uploads-XXXXX
   ```

2. **Grant IAM permissions** to the Cloud Run service account on the production bucket

3. **Verify CORS** if needed (current implementation uses signed URLs which bypass CORS)

## Future Enhancements (Out of Scope)

- Support for additional document types (DOCX, XLSX)
- Image uploads for thumbnails
- Video upload and streaming
- Automatic PDF text extraction for search
- Batch upload functionality
- CDN integration for faster global access
