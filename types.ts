
export type Language = 'es' | 'en' | 'eu';
export type Team = 'A' | 'B';

export interface TimerConfig {
  id: string;
  defaultMinutes: number;
  defaultWarning: number;
  team: Team;
}

export interface TimerState {
  seconds: number;
  initialSeconds: number;
  warningSeconds: number;
  isRunning: boolean;
}

export type Timers = Record<string, TimerState>;

export interface TimerLog {
  phase: string;
  team: Team;
  initialTime: number;
  timeUsed: number;
  overtime: number;
  completed: boolean;
}

export type TimerLogs = Record<string, TimerLog>;
