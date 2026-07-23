import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(req: NextRequest, { params }: { params: { path: string[] } }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';
  const path = params.path.join('/');
  const searchParams = req.nextUrl.search;
  const targetUrl = `${backendUrl}/api/${path}${searchParams}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      headers.delete('content-type');
      fetchOptions.body = await req.formData();
    } else {
      fetchOptions.body = await req.text();
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.blob();
    
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`Error proxying to backend: ${error}`);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(req, context);
}

export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(req, context);
}

export async function PUT(req: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(req, context);
}

export async function DELETE(req: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(req, context);
}

export async function PATCH(req: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(req, context);
}
