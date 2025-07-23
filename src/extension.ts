import * as vscode from "vscode";
import { generateCommitMessage } from "./gitCommitMenu";
import { updateGoogleApiKey } from "./llmProvider";

export const outputChannel =
  vscode.window.createOutputChannel("AI Commit Helper");
outputChannel.appendLine("Extension is starting!");

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "ai-commit-helper.generate",
      generateCommitMessage
    ),
    vscode.commands.registerCommand(
      "ai-commit-helper.update-google-api-key",
      updateGoogleApiKey
    )
  );
}

export function deactivate() {}
