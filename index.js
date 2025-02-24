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
    const matches = content.match(/includeIf\s*"gitdir:(.*?)"\s*\]\n\s*path\s*=\s*(.*?)\n/gm);
    if (!matches) {
        console.log("No folder-specific Git profiles found.");
        return;
    }
    console.log("Configured Git Profiles:");
    matches.forEach(match => {
        const dirMatch = match.match(/"gitdir:(.*?)"/);
        const pathMatch = match.match(/path = (.*?)\n/);
        if (dirMatch && pathMatch) {
            const dir = dirMatch[1];
            const gitconfigPath = pathMatch[1];
            if (fs.existsSync(gitconfigPath)) {
                const gitConfigContent = fs.readFileSync(gitconfigPath, "utf8");
                const nameMatch = gitConfigContent.match(/name = (.*)/);
                const emailMatch = gitConfigContent.match(/email = (.*)/);
                const name = nameMatch ? nameMatch[1] : "N/A";
                const email = emailMatch ? emailMatch[1] : "N/A";
                console.log(`- ${dir}: ${name} <${email}>`);
            } else {
                console.log(`- ${dir}: No .gitconfig found`);
            }
        }
    });
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

program.name("gpm");

program.command("init").description("Initialize Git profile for current folder").action(initGitProfile);
program.command("list").description("List all configured Git profiles").action(listProfiles);
program.command("remove <dir>").description("Remove Git profile for a folder").action(removeProfile);

program.parse(process.argv);
