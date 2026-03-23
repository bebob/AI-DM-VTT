import { readFile, writeFile, mkdir, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';

const CAMPAIGNS_DIR = join(process.cwd(), 'campaigns');

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const data = await readFile(filePath, 'utf-8');
  return JSON.parse(data) as T;
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readTextFile(filePath: string): Promise<string> {
  return readFile(filePath, 'utf-8');
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

export function campaignPath(campaignId: string, ...segments: string[]): string {
  return join(CAMPAIGNS_DIR, campaignId, ...segments);
}

export async function listCampaigns(): Promise<string[]> {
  try {
    const entries = await readdir(CAMPAIGNS_DIR);
    const dirs: string[] = [];
    for (const entry of entries) {
      if (entry === '.gitkeep') continue;
      const s = await stat(join(CAMPAIGNS_DIR, entry));
      if (s.isDirectory()) dirs.push(entry);
    }
    return dirs;
  } catch {
    return [];
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}
