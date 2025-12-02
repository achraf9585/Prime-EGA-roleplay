
import { supabase } from '@/lib/supabase';

export default async function TestDBPage() {
  let result;
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    result = { status: 'Connected', data, error };
  } catch (e: any) {
    result = { status: 'Error', error: e.message };
  }
  
  return (
    <div className="p-10 text-white bg-slate-900 min-h-screen font-mono">
      <h1 className="text-2xl mb-4 font-bold text-green-400">Supabase Connection Test</h1>
      <div className="bg-slate-800 p-4 rounded border border-slate-700">
        <h2 className="text-xl mb-2">Connection Result:</h2>
        <pre className="whitespace-pre-wrap break-all text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
      <p className="mt-4 text-gray-400">
        If you see a response (even an error from Supabase), the connection is working.
      </p>
    </div>
  );
}
