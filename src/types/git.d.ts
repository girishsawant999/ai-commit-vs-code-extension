export interface GitExtension {
  getAPI(version: 1): GitAPI;
}

export interface GitAPI {
  repositories: Repository[];
}

export interface Repository {
  rootUri: import("vscode").Uri;
  state: {
    workingTreeChanges: import("vscode").SourceControlResourceState[];
    indexChanges: import("vscode").SourceControlResourceState[];
    mergeChanges: import("vscode").SourceControlResourceState[];
  };
}
