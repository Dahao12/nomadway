"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadProps {
  clientId: string;
  documentId?: string;
  documentName: string;
  currentFileUrl?: string;
  currentFileName?: string;
  status: string;
  onUploadComplete?: () => void;
}

export default function DocumentUpload({
  clientId,
  documentId,
  documentName,
  currentFileUrl,
  currentFileName,
  status,
  onUploadComplete,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
  } | null>(
    currentFileUrl && currentFileName
      ? { name: currentFileName, url: currentFileUrl }
      : null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo: 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Tipo não permitido. Use PDF, JPG, PNG ou DOC");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", clientId);
      formData.append("name", documentName);
      if (documentId) {
        formData.append("document_id", documentId);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 85));
      }, 150);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(95);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar arquivo");
      }

      setUploadProgress(100);
      setUploadedFile({
        name: file.name,
        url: data.file_url || "#",
      });

      setTimeout(() => {
        setIsUploading(false);
        onUploadComplete?.();
      }, 500);
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || "Erro ao enviar arquivo");
      console.error("Upload error:", err);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf": return "📄";
      case "jpg":
      case "jpeg":
      case "png":
      case "webp": return "🖼️";
      case "doc":
      case "docx": return "📝";
      default: return "📎";
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button or progress */}
      {isUploading ? (
        <div className="w-32 space-y-1">
          <Progress value={uploadProgress} className="h-2" />
          <div className="text-xs text-center text-gray-500">{uploadProgress}%</div>
        </div>
      ) : uploadedFile ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">{getFileIcon(uploadedFile.name)}</span>
          <a
            href={uploadedFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:underline"
          >
            Ver arquivo
          </a>
          {(status === "pending" || status === "rejected") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClick}
              className="text-xs h-7 px-2"
            >
              Substituir
            </Button>
          )}
        </div>
      ) : (
        <Button
          size="sm"
          onClick={handleClick}
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm"
        >
          📤 Enviar
        </Button>
      )}

      {/* Error message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
}