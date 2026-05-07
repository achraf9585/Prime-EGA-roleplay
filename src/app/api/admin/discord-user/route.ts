import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // if (!await isAdmin(request)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing Discord ID' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Discord user' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      username: data.username,
      global_name: data.global_name,
      avatar: data.avatar 
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(data.id) >> BigInt(22)) % 6}.png`
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
