import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";
import { getLLMProvider } from "./llmProvider";

const execAsync = promisify(exec);

export async function generateCommitMessage() {
  try {
    const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
    const api = gitExtension?.getAPI(1);

    if (!api) {
      vscode.window.showErrorMessage("Git extension API not available.");
      return;
    }

    // Find a repository with any changes
    const repo = api.repositories.find((r: any) => {
      const indexChanges = r.state.indexChanges ?? [];
      const workspaceChanges = r.state.workingTreeChanges ?? [];
      return indexChanges.length > 0 || workspaceChanges.length > 0;
    });

    if (!repo) {
      vscode.window.showWarningMessage("No Git repository with changes found.");
      return;
    }

    // Collect all changed files (both staged and unstaged)
    const changes = [
      ...(repo.state.indexChanges ?? []),
      ...(repo.state.workingTreeChanges ?? []),
    ];

    const validChanges = changes.filter((c: any) => !!(c.resourceUri ?? c.uri));

    if (validChanges.length === 0) {
      vscode.window.showInformationMessage("No file changes to commit.");
      return;
    }

    // Stage all changed files
    const filePaths = validChanges.map(
      (c: any) => (c.resourceUri ?? c.uri).fsPath
    );

    await repo.add(filePaths);

    // Get the diff of the staged changes
    const { stdout: diff } = await execAsync("git diff --cached --no-color", {
      cwd: repo.rootUri.fsPath,
    });

    // Generate commit message using LLM
    const llm = await getLLMProvider();
    const commitMessage = await llm.generateCommitMessage(diff);

    if (commitMessage) {
      repo.inputBox.value = commitMessage;
    } else {
      vscode.window.showErrorMessage("Failed to generate commit message.");
    }
  } catch (err: any) {
    console.error(err);
    vscode.window.showErrorMessage(
      "An error occurred while generating commit message.",
      {
        detail: err?.message ?? "Unknown error",
      }
    );
  }
}
