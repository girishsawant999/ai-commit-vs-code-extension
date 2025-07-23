import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";
import { outputChannel } from "./extension";
import { getLLMProvider } from "./llmProvider";

const execAsync = promisify(exec);

export async function generateCommitMessage() {
  try {
    outputChannel.appendLine("Generating commit message using LLM provider...");

    const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
    const api = gitExtension?.getAPI(1);

    if (!api) {
      vscode.window.showErrorMessage("Git extension API not available.");
      return;
    }

    const repo = api.repositories.find((r: any) => {
      const indexChanges = r.state.indexChanges ?? [];
      const workingTreeChanges = r.state.workingTreeChanges ?? [];
      return indexChanges.length > 0 || workingTreeChanges.length > 0;
    });

    if (!repo) {
      vscode.window.showWarningMessage("No Git repository with changes found.");
      return;
    }

    const indexChanges = repo.state.indexChanges ?? [];
    const workingTreeChanges = repo.state.workingTreeChanges ?? [];

    let filesToStage: string[] = [];

    if (indexChanges.length === 0 && workingTreeChanges.length > 0) {
      outputChannel.appendLine(
        "No files are staged. Staging working tree changes (excluding deleted files)..."
      );

      for (const change of workingTreeChanges) {
        const uri = change.resourceUri ?? change.uri;
        const filePath = uri.fsPath;

        try {
          await vscode.workspace.fs.stat(uri); // Check if file exists
          filesToStage.push(filePath);
        } catch {
          outputChannel.appendLine(
            `Skipping deleted or inaccessible file: ${filePath}`
          );
        }
      }

      if (filesToStage.length > 0) {
        await repo.add(filesToStage);
        outputChannel.appendLine(`Staged ${filesToStage.length} file(s).`);
      } else {
        vscode.window.showInformationMessage(
          "No valid unstaged files to stage."
        );
        return;
      }
    } else {
      outputChannel.appendLine(
        "Files are already staged. Skipping working tree changes."
      );
    }

    // Get the diff of staged changes
    const { stdout: diff } = await execAsync("git diff --cached --no-color", {
      cwd: repo.rootUri.fsPath,
    });

    const llm = await getLLMProvider();
    const commitMessage = await llm.generateCommitMessage(diff);

    if (commitMessage) {
      repo.inputBox.value = commitMessage;
    } else {
      vscode.window.showErrorMessage("Failed to generate commit message.");
    }
  } catch (err: any) {
    outputChannel.appendLine(err?.stack || String(err));
    vscode.window.showErrorMessage(
      "An error occurred while generating the commit message."
    );
  }
}
