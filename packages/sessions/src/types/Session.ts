/**
 * Core session types for Cross-CLI Session Recovery system
 */

export type CLIType = 'claude' | 'gemini' | 'qwen' | 'iflow' | 'codebuddy' | 'qoder' | 'codex' | 'qodercli';

export interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
    [key: string]: any;
  };
}

export interface SessionMetadata {
  cliType: CLIType;
  sessionId: string;
  filePath: string;
  projectPath: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  totalTokens?: number;
  title?: string;
  tags?: string[];
}

export interface Session {
  metadata: SessionMetadata;
  messages: SessionMessage[];
}

export interface ProjectInfo {
  path: string;
  name: string;
  gitRoot?: string;
  sessions: Session[];
}

export interface SessionSearchCriteria {
  keyword?: string;
  cliType?: CLIType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  projectPath?: string;
  minMessages?: number;
  maxMessages?: number;
}