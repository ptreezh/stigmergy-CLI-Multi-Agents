/**
 * CLI Adapter interface for different AI CLI tools
 */

import { Session } from './Session';

export interface SessionParseResult {
  success: boolean;
  session?: Session;
  error?: string | Error;
  warnings?: string[];
  filePath?: string;
}

export interface CLIConfig {
  homeDir: string;
  sessionPaths: string[];
  version?: string;
}

export interface CLIAdapter {
  readonly cliType: string;
  readonly name: string;
  readonly version: string;

  /**
   * Check if the CLI tool is available on the system
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get CLI configuration and session paths
   */
  getCLIConfig(): Promise<CLIConfig>;

  /**
   * Parse a session file and return session data
   */
  parseSession(filePath: string): Promise<SessionParseResult>;

  /**
   * Extract project path from raw session data
   */
  extractProjectPath(sessionData: any): Promise<string | null>;

  /**
   * Get all possible session file paths for this CLI
   */
  getSessionPaths(): string[];
}