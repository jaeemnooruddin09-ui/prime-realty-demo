import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const fd = await req.formData();
    const files = fd.getAll('files');
    if (files.length === 0) return NextResponse.json({ error: 'No files' }, { status: 400 });
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(dir, { recursive: true });
    const urls = [];
    for (const f of files) {
      if (!f || typeof f === 'string') continue;
      const buf = Buffer.from(await f.arrayBuffer());
      if (buf.length > 8 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${f.name} exceeds 8MB.` }, { status: 400 });
      }
      const ext = path.extname(f.name || '').toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      await fs.writeFile(path.join(dir, filename), buf);
      urls.push(`/uploads/${filename}`);
    }
    return NextResponse.json({ ok: true, urls });
  } catch (err) {
    console.error('[upload:post]', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
