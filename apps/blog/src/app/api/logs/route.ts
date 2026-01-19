import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(
      JSON.stringify({
        ...body,
        source: 'client',
        client_ip: req.headers.get('x-forwarded-for') || 'unknown',
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
