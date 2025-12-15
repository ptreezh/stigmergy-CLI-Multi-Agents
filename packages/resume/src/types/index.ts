export interface CLIInfo {
  name: string;
  displayName: string;
  version: string;
  available: boolean;
  installedPath?: string;
  configPath?: string;
  sessionsPath?: string;
  integrationLevel: 'native' | 'hook' | 'external';
}

export interface ShareMemConfig {
  projectPath: string;
  selectedCLIs: string[];
  initializedAt: Date;
  version: string;
}

export interface InitOptions {
  force?: boolean;
}

export interface ScanOptions {
  verbose?: boolean;
}

export interface TemplateOptions {
  cliType: string;
  projectPath: string;
  config: ShareMemConfig;
}