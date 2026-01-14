import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.MS_GRAPH_ACCESS_TOKEN;
  const shareUrl = process.env.MS_EXCEL_SHARE_URL;

  const connected = Boolean(token && shareUrl);

  return NextResponse.json({
    ok: true,
    message: connected ? "Microsoft Excel Connected" : "Microsoft Excel Not Connected",
    data: { connected, timestamp: new Date().toISOString() },
  });
}
