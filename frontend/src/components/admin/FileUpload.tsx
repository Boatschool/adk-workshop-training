/**
 * FileUpload Component
 * A reusable file upload component with drag-and-drop support
 */

import { useCallback, useState, useRef } from 'react'

// Inline SVG Icons
const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export interface FileUploadProps {
  /** Callback when file is selected (before upload) */
  onFileSelect: (file: File) => void
  /** Callback when upload fails */
  onUploadError?: (error: string) => void
  /** Callback to clear the uploaded file */
  onClear?: () => void
  /** Current upload progress (0-100) */
  uploadProgress?: number
  /** Whether upload is in progress */
  isUploading?: boolean
  /** Currently uploaded file info */
  uploadedFile?: { filePath: string; fileName: string } | null
  /** Accepted file types (MIME types) */
  accept?: string
  /** Maximum file size in MB */
  maxSizeMB?: number
  /** Whether the component is disabled */
  disabled?: boolean
  /** Error message to display */
  error?: string | null
}

const MAX_FILE_SIZE_MB = 50

export function FileUpload({
  onFileSelect,
  onUploadError,
  onClear,
  uploadProgress = 0,
  isUploading = false,
  uploadedFile = null,
  accept = 'application/pdf',
  maxSizeMB = MAX_FILE_SIZE_MB,
  disabled = false,
  error = null,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (accept && !accept.split(',').some((type) => file.type === type.trim())) {
        return `Invalid file type. Please upload a ${accept === 'application/pdf' ? 'PDF' : accept} file.`
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return `File size exceeds ${maxSizeMB}MB limit.`
      }

      // Check file extension for PDFs
      if (accept === 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return 'File must have a .pdf extension.'
      }

      return null
    },
    [accept, maxSizeMB]
  )

  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null)

      const validationResult = validateFile(file)
      if (validationResult) {
        setValidationError(validationResult)
        onUploadError?.(validationResult)
        return
      }

      onFileSelect(file)
    },
    [validateFile, onFileSelect, onUploadError]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && !isUploading) {
        setIsDragOver(true)
      }
    },
    [disabled, isUploading]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled || isUploading) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [disabled, isUploading, handleFile]
  )

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled, isUploading])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
      // Reset input value so the same file can be selected again
      e.target.value = ''
    },
    [handleFile]
  )

  const handleClear = useCallback(() => {
    setValidationError(null)
    onClear?.()
  }, [onClear])

  const displayError = error || validationError

  // Show uploaded file state
  if (uploadedFile && !isUploading) {
    return (
      <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {uploadedFile.fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded successfully</p>
            </div>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Remove file"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Show upload progress
  if (isUploading) {
    return (
      <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            <UploadIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Uploading...</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{uploadProgress}% complete</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>
    )
  }

  // Show drop zone
  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : displayError
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          {displayError ? (
            <AlertCircleIcon className="w-8 h-8 text-red-500" />
          ) : (
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              <FileTextIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isDragOver ? 'Drop your file here' : 'Drag & drop your PDF here'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              or <span className="text-blue-600 dark:text-blue-400">click to browse</span>
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">PDF files up to {maxSizeMB}MB</p>
        </div>
      </div>

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  )
}

export default FileUpload
