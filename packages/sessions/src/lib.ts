/**
 * Library entry point for programmatic use
 * This excludes the CLI functionality
 */

// Export types
export * from './types';

// Export core functionality
export { SessionScanner, SessionStatistics } from './core/SessionScanner';
export { SessionExporter, ExportFormat } from './core/SessionExporter';
export { CLIDiscovery, type DiscoveredCLI, type CLIDiscoveryConfig } from './core/CLIDiscovery';
export { CrossCLISlashCommands, type SlashCommandResult, type HistoryCommandOptions } from './core/CrossCLISlashCommands';

// Export adapters
export { ClaudeAdapter } from './adapters/ClaudeAdapter';
export { GeminiAdapter } from './adapters/GeminiAdapter';
export { QwenAdapter } from './adapters/QwenAdapter';
export { IFlowAdapter } from './adapters/IFlowAdapter';
export { CodeBuddyAdapter } from './adapters/CodeBuddyAdapter';
export { QoderCLIAdapter } from './adapters/QoderCLIAdapter';
export { CodexAdapter } from './adapters/CodexAdapter';

// Export utilities
export { Logger, LogLevel } from './utils/Logger';

// Export integrations
export { ClaudeSlashIntegration } from './integrations/ClaudeSlashIntegration';
export { SlashCommandInstaller, type CLIIntegration } from './integrations/SlashCommandInstaller';

// Export types for external use
export type { CLIAdapter, SessionParseResult, CLIConfig } from './types/CLIAdapter';
export type { Session, SessionMessage, SessionMetadata, CLIType, ProjectInfo, SessionSearchCriteria } from './types/Session';