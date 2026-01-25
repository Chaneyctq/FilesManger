export enum SandboxFileItemType {
  FILE = 0,
  DIRECTORY = 1
}

export interface SandboxFileItem {
  path: string;
  name: string;
  type: SandboxFileItemType;
  size: number;
  modifiedTime: number;
}
