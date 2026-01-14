// lib/excelGraph.ts
// Graph API helpers for Excel sync (extracted from app/api/excel/send/route.ts)

import { ExcelRow, excelRowToValues } from "@/lib/excelContract";

interface GraphErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface DriveItemResponse {
  id?: string;
  parentReference?: {
    driveId?: string;
  };
}

interface TablesResponse {
  value?: Array<{
    name?: string;
    id?: string;
  }>;
}

async function graphFetch(
  url: string,
  init?: RequestInit
): Promise<{ status: number; headers: Headers; json: unknown }> {
  const response = await fetch(url, init);
  const headers = response.headers;
  const status = response.status;

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    // ignore
  }

  return { status, headers, json };
}

function encodeShareUrl(shareUrl: string): string {
  const base64 = Buffer.from(shareUrl).toString("base64");
  return `u!${base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")}`;
}

export async function resolveDriveItem(
  shareUrl: string,
  accessToken: string
): Promise<{ driveId: string; itemId: string }> {
  const encoded = encodeShareUrl(shareUrl);
  const url = `https://graph.microsoft.com/v1.0/shares/${encoded}/driveItem`;

  const result = await graphFetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (result.status !== 200) {
    const errorData = result.json as GraphErrorResponse;
    const errorMsg = errorData?.error?.message || `Failed to resolve share URL (${result.status})`;
    throw new Error(errorMsg);
  }

  const data = result.json as DriveItemResponse;
  const driveId = data.parentReference?.driveId;
  const itemId = data.id;

  if (!driveId || !itemId) {
    throw new Error("Invalid response from Graph API: missing driveId or itemId");
  }

  return { driveId, itemId };
}

export async function findTable(
  driveId: string,
  itemId: string,
  tableName: string,
  accessToken: string
): Promise<string> {
  const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/tables`;

  const result = await graphFetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (result.status !== 200) {
    const errorData = result.json as GraphErrorResponse;
    const errorMsg = errorData?.error?.message || `Failed to list tables (${result.status})`;
    throw new Error(errorMsg);
  }

  const data = result.json as TablesResponse;
  const tables = data.value ?? [];
  const table = tables.find((t) => t.name === tableName);

  if (!table?.id) {
    throw new Error(`Table "${tableName}" not found in workbook`);
  }

  return table.id;
}

export async function appendRowToTable(
  driveId: string,
  itemId: string,
  tableId: string,
  row: ExcelRow,
  accessToken: string
): Promise<void> {
  const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/tables/${tableId}/rows/add`;

  const values = excelRowToValues(row);

  const result = await graphFetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [values] }),
  });

  if (result.status !== 201) {
    const errorData = result.json as GraphErrorResponse;
    const errorMsg = errorData?.error?.message || `Failed to append row (${result.status})`;
    throw new Error(errorMsg);
  }
}

/**
 * Sync a single DB row to Excel table
 * @returns { excelSynced: true, excelError: null } on success
 * @returns { excelSynced: false, excelError: string } on failure
 */
export async function syncRowToExcel(
  row: ExcelRow,
  accessToken: string,
  shareUrl: string,
  tableName: string = "tblRent2026"
): Promise<{ excelSynced: boolean; excelError: string | null }> {
  try {
    const { driveId, itemId } = await resolveDriveItem(shareUrl, accessToken);
    const tableId = await findTable(driveId, itemId, tableName, accessToken);
    await appendRowToTable(driveId, itemId, tableId, row, accessToken);
    return { excelSynced: true, excelError: null };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { excelSynced: false, excelError: errorMsg };
  }
}
