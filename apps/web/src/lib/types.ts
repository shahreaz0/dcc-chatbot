export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemPrompt {
  id: string;
  title: string;
  content: string;
  isSystem?: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  fileSize?: number | null;
  mimeType?: string | null;
  fileUrl?: string | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: {
    name: string;
    url: string;
    contentType?: string;
  }[];
  createdAt: string;
}
