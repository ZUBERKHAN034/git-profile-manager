#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import os from "os";
import path from "path";
import readline from "readline";

const program = new Command();
const GLOBAL_GITCONFIG = path.join(os.homedir(), ".gitconfig");

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, answer => {
        rl.close();
        resolve(answer.trim());
    }));
}

async function initGitProfile() {
    const dir = process.cwd();
    const gitconfigPath = path.join(dir, ".gitconfig");

    // Convert Windows paths to use forward slashes for Git
    const gitdirPath = dir.replace(/\\/g, "/");
    const gitconfigFixedPath = gitconfigPath.replace(/\\/g, "/");

    if (fs.existsSync(gitconfigPath)) {
        console.log("✔ Git profile already exists for this folder.");
        return;
    }

    console.log("Setting up a Git profile for this folder...");
    const name = await askQuestion("Enter your Git user name: ");
    const email = await askQuestion("Enter your Git email: ");

    const gitConfigContent = `[user]\n    name = ${name}\n    email = ${email}\n`;
    fs.writeFileSync(gitconfigPath, gitConfigContent);
    console.log(`✔ Created ${gitconfigPath}`);

    const includeConfig = `[includeIf "gitdir:${gitdirPath}/"]\n    path = ${gitconfigFixedPath}\n`;

    if (!fs.existsSync(GLOBAL_GITCONFIG)) {
        fs.writeFileSync(GLOBAL_GITCONFIG, includeConfig);
    } else {
        const globalConfig = fs.readFileSync(GLOBAL_GITCONFIG, "utf8");
        if (!globalConfig.includes(includeConfig)) {
            fs.appendFileSync(GLOBAL_GITCONFIG, `\n${includeConfig}`);
        }
    }
    console.log(`✔ Updated ${GLOBAL_GITCONFIG} to include this profile.`);
}

function listProfiles() {
    if (!fs.existsSync(GLOBAL_GITCONFIG)) {
        console.log("No Git profiles configured.");
        return;
    }
    const content = fs.readFileSync(GLOBAL_GITCONFIG, "utf8");
    const matches = content.match(/gitdir:(.*?)\//g);
    if (!matches) {
        console.log("No folder-specific Git profiles found.");
        return;
    }
    console.log("Configured Git Profiles:");
    matches.forEach(match => console.log("- ", match.replace("gitdir:", "").replace("/", "")));
}

function removeProfile(dir) {
    const gitconfigPath = path.join(dir, ".gitconfig");
    const gitdirPath = dir.replace(/\\/g, "/");
    const gitconfigFixedPath = gitconfigPath.replace(/\\/g, "/");

    if (fs.existsSync(gitconfigPath)) {
        fs.unlinkSync(gitconfigPath);
        console.log(`✔ Removed ${gitconfigPath}`);
    }
    if (fs.existsSync(GLOBAL_GITCONFIG)) {
        let content = fs.readFileSync(GLOBAL_GITCONFIG, "utf8");
        const includeConfig = `[includeIf "gitdir:${gitdirPath}/"]\n    path = ${gitconfigFixedPath}\n`;
        if (content.includes(includeConfig)) {
            content = content.replace(includeConfig, "");
            fs.writeFileSync(GLOBAL_GITCONFIG, content);
            console.log(`✔ Removed profile from ${GLOBAL_GITCONFIG}`);
        }
    }
}

program.command("init").description("Initialize Git profile for current folder").action(initGitProfile);
program.command("list").description("List all configured Git profiles").action(listProfiles);
program.command("remove <dir>").description("Remove Git profile for a folder").action(removeProfile);

program.parse(process.argv);
