import { GoogleGenAI } from "@google/genai";
import * as vscode from "vscode";

let gemini: any;

export async function getLLMProvider(): Promise<{
  generateCommitMessage(diff: string): Promise<string | null>;
}> {
  return await googleLLMProvider();
}

export async function updateGoogleApiKey() {
  const config = vscode.workspace.getConfiguration("ai-commit-helper");

  const apiKey = await vscode.window.showInputBox({
    prompt: "Enter your Google API Key (Gemini)",
    ignoreFocusOut: true,
    password: true,
    placeHolder: "AIza...",
  });
  if (!apiKey) {
    throw new Error("Google API key not provided.");
  }
  await config.update(
    "googleApiKey",
    apiKey,
    vscode.ConfigurationTarget.Global
  );
  gemini = new GoogleGenAI({
    apiKey: apiKey,
  });
  vscode.window.showInformationMessage("Google API key saved.");
  return apiKey;
}

export async function googleLLMProvider() {
  const config = vscode.workspace.getConfiguration("ai-commit-helper");
  let apiKey = config.get<string>("googleApiKey");

  if (!apiKey) {
    apiKey = await updateGoogleApiKey();
  }

  if (!gemini) {
    gemini = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  return {
    async generateCommitMessage(diff: string): Promise<string | null> {
      try {
        const curr = await gemini.models.generateContent({
          model: "gemini-2.0-flash-001",
          contents: `Generate a conventional commit message with gitmoji for:\n${diff}
          
          always give output in text only 
          eg: 🔥 feat: added new feature

          // changes listed using - below format
          - change 1
          - change 2
          - change 3
          - change 4
          `,
          temperature: 0.2,
        });
        return curr.text;
      } catch (err: any) {
        console.log(err?.message);
        return null;
      }
    },
  };
}
