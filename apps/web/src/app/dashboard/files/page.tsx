"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dcc-chatbot/ui/components/card";
import { AlertCircle, FileText, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useActiveProject } from "../projects/_hooks/use-active-project";
import { useDeleteFile } from "./_hooks/use-delete-file";
import { useGetFiles } from "./_hooks/use-get-files";
import { useUploadFile } from "./_hooks/use-upload-file";

export default function FilesPage() {
  const { activeProject, activeProjectId } = useActiveProject();
  const { data: files = [], isLoading } = useGetFiles(activeProjectId);
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && activeProjectId) {
      uploadFile({ projectId: activeProjectId, file: selectedFile });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && activeProjectId) {
      uploadFile({ projectId: activeProjectId, file: droppedFile });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Files & Knowledge Base
          </h1>
          <p className="text-muted-foreground text-sm">
            Context files and documents for project:{" "}
            <span className="font-semibold text-foreground">
              {activeProject?.name || "No Project Selected"}
            </span>
          </p>
        </div>
      </div>

      {!activeProjectId ? (
        <Card className="border-dashed p-8 text-center">
          <AlertCircle className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-60" />
          <p className="font-medium text-sm">
            Please select or create a project first
          </p>
        </Card>
      ) : (
        <>
          {/* Upload Drop Zone */}
          <button
            type="button"
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`w-full cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-border/60 bg-card/40 hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="mx-auto mb-3 h-10 w-10 text-primary opacity-80" />
            <h3 className="font-semibold text-base">Upload Context File</h3>
            <p className="mt-1 mb-4 text-muted-foreground text-xs">
              Drag & drop your files here or click to browse (PDF, TXT, MD,
              JSON, CSV)
            </p>
            <Button size="sm" disabled={isUploading} type="button">
              {isUploading ? "Uploading..." : "Select File"}
            </Button>
          </button>

          {/* Files List */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">
                Uploaded Documents ({files.length})
              </CardTitle>
              <CardDescription>
                Files attached to this project for retrieval and context
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-lg bg-muted/40"
                    />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  No files uploaded for this project yet.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-2 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {file.fileName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatSize(file.fileSize)} • {file.mimeType}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          deleteFile({
                            id: file.id,
                            projectId: activeProjectId,
                          })
                        }
                        disabled={isDeleting}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
