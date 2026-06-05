export type LogType = 'info' | 'warn' | 'error' | 'success';

export type LogMessage = {
  /** HH:MM:SS */
  time: string;
  msg: string;
  type: LogType;
};
