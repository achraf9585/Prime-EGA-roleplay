import { NextResponse } from 'next/server';
import { addCodes } from '@/lib/codeStore';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { password, useLocalFile } = await request.json();
    console.log("hello");

    // Security Check
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid Admin Password' }, { status: 403 });
    }

    let codesToImport: { code: string; tier?: string }[] = [];

   
    if (useLocalFile) {
      // Read from server filesystem
      const filePath = path.join(process.cwd(), 'src', 'data', 'Prime_EGA_Membership_Codes.csv');
      console.log(`Reading file from: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.error('File not found');
        return NextResponse.json({ error: `File not found at ${filePath}` }, { status: 404 });
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`File content length: ${fileContent.length}`);
      
      const lines = fileContent.split(/\r?\n/);
      console.log(`Total lines: ${lines.length}`);
      
      codesToImport = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          if (line.includes(',')) {
            const parts = line.split(',');
            // Handle potential extra commas or quotes if simple split isn't enough, 
            // but for now assume simple format "Tier,Code"
            const tier = parts[0].trim();
            const code = parts[1]?.trim();
            
            if (!code) return null;

            // Skip header
            if (tier.toLowerCase().includes('membership') && code.toLowerCase().includes('code')) {
              return null;
            }
            return { code, tier };
          } else {
            return { code: line };
          }
        })
        .filter((item): item is { code: string; tier?: string } => {
          const isValid = item !== null && !!item.code;
          if (!isValid) console.log('Skipping invalid item');
          return isValid;
        });
        
      console.log(`Parsed valid codes: ${codesToImport.length}`);

    } else {
      console.error('useLocalFile flag missing or false');
      return NextResponse.json({ error: 'Missing useLocalFile: true in request body' }, { status: 400 });
    }
    
    if (codesToImport.length === 0) {
       console.error('No valid codes found after parsing');
       return NextResponse.json({ error: 'No valid codes found in file. Check CSV format (Tier,Code)' }, { status: 400 });
    }

    // Insert codes directly
    const recordsToInsert = codesToImport.map(item => ({
      codeHash: item.code, // Storing plain code in codeHash column as requested
      tier: item.tier || 'Standard',
      created_at: new Date().toISOString()
    }));

    // Insert into Supabase
    // Using upsert to avoid duplicates if codeHash is unique constraint
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('RedeemCode')
      .upsert(recordsToInsert, { onConflict: 'codeHash', ignoreDuplicates: true })
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to import codes to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: recordsToInsert.length, inserted: data?.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
