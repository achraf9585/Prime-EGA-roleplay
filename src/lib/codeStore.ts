import fs from 'fs';
import path from 'path';



const CSV_FILE = path.join(process.cwd(), 'src', 'data', 'Prime_EGA_Membership_Codes.csv');

export interface RedeemCode {
  code: string;
  tier?: string;
  value?: string;
  createdAt?: string;
}

function ensureFile() {
  if (!fs.existsSync(CSV_FILE)) {
    // Create with header if missing
    fs.writeFileSync(CSV_FILE, 'Membership Tier,Code\n', 'utf-8');
  }
}

export function getCodes(): RedeemCode[] {
  ensureFile();
  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = content.split(/\r?\n/);
  
  const codes: RedeemCode[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Skip header
    if (trimmed.toLowerCase().startsWith('membership tier')) continue;
    
    const parts = trimmed.split(',');
    if (parts.length >= 2) {
      codes.push({
        tier: parts[0].trim(),
        code: parts[1].trim()
      });
    }
  }
  
  return codes;
}

// Not used anymore but kept for compatibility or future admin add
export function addCodes(items: { code: string; tier?: string }[]): number {
  ensureFile();
  let content = fs.readFileSync(CSV_FILE, 'utf-8');
  
  // Ensure ends with newline
  if (!content.endsWith('\n') && content.length > 0) {
    content += '\n';
  }
  
  let addedCount = 0;
  const currentCodes = getCodes().map(c => c.code);
  
  for (const item of items) {
    if (!currentCodes.includes(item.code)) {
      content += `${item.tier || 'Unknown'},${item.code}\n`;
      addedCount++;
    }
  }
  
  fs.writeFileSync(CSV_FILE, content, 'utf-8');
  return addedCount;
}

export function redeemCode(codeToRedeem: string): RedeemCode | null {
  ensureFile();
  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = content.split(/\r?\n/);
  
  let foundItem: RedeemCode | null = null;
  const newLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Keep empty lines? Maybe not, but let's just skip them to clean up
      continue;
    }
    
    // Always keep header
    if (trimmed.toLowerCase().startsWith('membership tier')) {
      newLines.push(line);
      continue;
    }
    
    const parts = trimmed.split(',');
    if (parts.length >= 2) {
      const tier = parts[0].trim();
      const code = parts[1].trim();
      
      // Check if this is the code (case-sensitive or insensitive? usually exact match is safer for codes)
      if (code === codeToRedeem) {
        foundItem = { tier, code };
        // Do NOT add this line to newLines -> effectively deleting it
      } else {
        newLines.push(line);
      }
    } else {
      // Keep malformed lines just in case, or remove them. 
      // Safest is to keep them to avoid data loss of non-code lines
      newLines.push(line);
    }
  }
  
  if (foundItem) {
    // Write back the file without the redeemed code
    fs.writeFileSync(CSV_FILE, newLines.join('\n'), 'utf-8');
  }
  
  return foundItem;
}
