#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || '';
  if (ua.includes('yarn')) return 'yarn';
  if (ua.includes('pnpm')) return 'pnpm';
  if (ua.includes('bun')) return 'bun';
  return 'npm'; // default
}

const projectName = process.argv[2];
if (!projectName) {
  console.error('(X) Usage: create-prev-app <project-name>');
  process.exit(1);
}

const pkgManager = detectPackageManager();

// run create-next-app
try {
  switch (pkgManager) {
    case 'yarn':
      execSync(`yarn create next-app ${projectName}`, { stdio: 'inherit' });
      break;
    case 'pnpm':
      execSync(`pnpm create next-app ${projectName}`, { stdio: 'inherit' });
      break;
    case 'bun':
      execSync(`bun create next-app ${projectName}`, { stdio: 'inherit' });
      break;
    default:
      execSync(`npx create-next-app@latest ${projectName}`, {
        stdio: 'inherit',
      });
  }
} catch (err) {
  console.error('(X) Failed to create Prev.js app:', err.message);
  process.exit(1);
}

// inject mirrored css
const cssPaths = [
  path.join(projectName, 'app', 'globals.css'),
  path.join(projectName, 'styles', 'globals.css'),
  path.join(projectName, 'src', 'app', 'globals.css'),
  path.join(projectName, 'src', 'styles', 'globals.css'),
];

const cssFile = cssPaths.find((p) => fs.existsSync(p));

if (cssFile) {
  fs.appendFileSync(
    cssFile,
    `\n/* Prev.js styles */\nbody { transform: scaleX(-1); }\n`
  );
} else {
  console.warn(
    '!!! Could not find globals.css — add this manually:\nbody { transform: scaleX(-1); }'
  );
}

// commit change
try {
  execSync(`git init`, { cwd: projectName, stdio: 'ignore' });
  execSync(`git add -A`, { cwd: projectName, stdio: 'ignore' });
  execSync(`git commit -m "add prev.js styles"`, {
    cwd: projectName,
    stdio: 'ignore',
  });
} catch (err) {
  console.warn('!!! Skipped Git init — make sure Git is installed.');
}
