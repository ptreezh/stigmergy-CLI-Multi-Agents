import { describe, it, expect, beforeEach } from '@jest/globals';
import { ResultAggregator, AggregationResult, ConflictDetectionResult } from '../ResultAggregator';
import { TerminalResult } from '../EnhancedTerminalManager';

describe('ResultAggregator', () => {
  let aggregator: ResultAggregator;

  beforeEach(() => {
    aggregator = new ResultAggregator();
  });

  describe('collectResults', () => {
    it('should collect terminal results', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Output from subtask 1',
          duration: 5000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: true,
          output: 'Output from subtask 2',
          duration: 3000
        }
      ];

      aggregator.collectResults(results);
      
      const collected = aggregator.getCollectedResults();
      expect(collected).toHaveLength(2);
      expect(collected[0].subtaskId).toBe('subtask-1');
      expect(collected[1].subtaskId).toBe('subtask-2');
    });

    it('should collect results from multiple batches', () => {
      const batch1: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Output 1',
          duration: 1000
        }
      ];

      const batch2: TerminalResult[] = [
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: false,
          output: 'Error output',
          error: 'Test error',
          duration: 2000
        }
      ];

      aggregator.collectResults(batch1);
      aggregator.collectResults(batch2);
      
      const collected = aggregator.getCollectedResults();
      expect(collected).toHaveLength(2);
    });
  });

  describe('detectConflicts', () => {
    it('should detect file conflicts', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Modified file: src/app.ts',
          duration: 1000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: true,
          output: 'Modified file: src/app.ts',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const conflicts = aggregator.detectConflicts();
      
      expect(conflicts.hasConflicts).toBe(true);
      expect(conflicts.conflicts).toHaveLength(1);
      expect(conflicts.conflicts[0].file).toBe('src/app.ts');
    });

    it('should detect multiple conflicts', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Modified: src/app.ts, src/utils.ts',
          duration: 1000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: true,
          output: 'Modified: src/app.ts, src/utils.ts',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const conflicts = aggregator.detectConflicts();
      
      expect(conflicts.hasConflicts).toBe(true);
      expect(conflicts.conflicts.length).toBe(2); // 两个文件都有冲突
      expect(conflicts.conflicts[0].file).toBe('src/app.ts');
      expect(conflicts.conflicts[1].file).toBe('src/utils.ts');
    });

    it('should return no conflicts when files are different', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Modified: src/app.ts',
          duration: 1000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: true,
          output: 'Modified: src/utils.ts',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const conflicts = aggregator.detectConflicts();
      
      expect(conflicts.hasConflicts).toBe(false);
      expect(conflicts.conflicts).toHaveLength(0);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary of results', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Success output',
          duration: 5000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: false,
          output: 'Error output',
          error: 'Test error',
          duration: 3000
        },
        {
          terminalId: 'term-3',
          subtaskId: 'subtask-3',
          success: true,
          output: 'Another success',
          duration: 2000
        }
      ];

      aggregator.collectResults(results);
      const summary = aggregator.generateSummary();
      
      expect(summary.totalTasks).toBe(3);
      expect(summary.successfulTasks).toBe(2);
      expect(summary.failedTasks).toBe(1);
      expect(summary.successRate).toBeCloseTo(0.667, 2);
      expect(summary.totalDuration).toBe(10000);
    });

    it('should include subtask details in summary', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Success',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const summary = aggregator.generateSummary();
      
      expect(summary.subtaskDetails).toHaveLength(1);
      expect(summary.subtaskDetails[0].subtaskId).toBe('subtask-1');
      expect(summary.subtaskDetails[0].success).toBe(true);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for conflicts', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Modified: src/app.ts',
          duration: 1000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: true,
          output: 'Modified: src/app.ts',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const recommendations = aggregator.generateRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].type).toBeDefined();
      expect(recommendations[0].description).toBeDefined();
    });

    it('should generate recommendations for failed tasks', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: false,
          output: 'Error output',
          error: 'Test error',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const recommendations = aggregator.generateRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'retry')).toBe(true);
    });
  });

  describe('calculateSuccessRate', () => {
    it('should calculate success rate', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Success',
          duration: 1000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: false,
          output: 'Error',
          error: 'Test error',
          duration: 1000
        },
        {
          terminalId: 'term-3',
          subtaskId: 'subtask-3',
          success: true,
          output: 'Success',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const successRate = aggregator.calculateSuccessRate();
      
      expect(successRate).toBeCloseTo(0.667, 2);
    });

    it('should return 0 for no results', () => {
      const successRate = aggregator.calculateSuccessRate();
      expect(successRate).toBe(0);
    });

    it('should return 1 for all successful results', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Success',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      const successRate = aggregator.calculateSuccessRate();
      
      expect(successRate).toBe(1);
    });
  });

  describe('clearResults', () => {
    it('should clear collected results', () => {
      const results: TerminalResult[] = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Success',
          duration: 1000
        }
      ];

      aggregator.collectResults(results);
      expect(aggregator.getCollectedResults()).toHaveLength(1);
      
      aggregator.clearResults();
      expect(aggregator.getCollectedResults()).toHaveLength(0);
    });
  });
});