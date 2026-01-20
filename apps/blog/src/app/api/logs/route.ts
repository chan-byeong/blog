import { NextRequest, NextResponse } from 'next/server';

const MAX_BODY_SIZE = 10 * 1024;

export async function POST(req: NextRequest) {
  try {
    const contentLength = parseInt(req.headers.get('content-length') || '0');

    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Request body too large' },
        { status: 413 }
      );
    }

    const body = await req.json();

    console.log(
      JSON.stringify({
        ...body,
        source: 'client',
        client_ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
    );
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
