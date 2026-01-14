# Excel Online Integration - Implementation Summary

## Overview
Implementasi lengkap untuk integrasi Excel Online (SharePoint/OneDrive) di Next.js App Router menggunakan Microsoft Graph API.

## Structure

```
app/api/excel/
├── send/route.ts        → POST append row(s) ke tblRent2026
├── status/route.ts      → GET check status koneksi Excel
└── test/route.ts        → POST test append dummy rows

lib/
├── excelContract.ts      → Type & function untuk ExcelRow
├── errors.ts             → Error handling utilities
└── http.ts               → HTTP parsing utilities
```

## Key Components

### 1. lib/excelContract.ts
- **ExcelRow Interface**: 12 field sesuai tabel Excel (no, tanggalSewa, costume, dll)
- **buildExcelRow()**: Convert parsing input ke ExcelRow dengan sanitasi & default value
- **excelRowToValues()**: Convert ExcelRow ke array values untuk Excel append
- **sanitizeString()**: Trim & handle null/undefined
- **createEmptyExcelRow()**: Create template row dengan status default "booked"

### 2. lib/errors.ts
- **getErrorMessage()**: Extract error message dari unknown error (support Error, string, object)
- **toErrorObject()**: Convert ke simple { message: string } object

### 3. lib/http.ts
- **safeJson<T>()**: Parse request body dengan error handling, return null jika invalid

### 4. app/api/excel/send/route.ts
**POST** - Append single row ke Excel table

Proses:
1. Validasi env vars (MS_GRAPH_ACCESS_TOKEN, MS_EXCEL_SHARE_URL)
2. Parse & validasi ExcelRow payload
3. Resolve share URL → driveId + itemId
4. Find table by name (default: tblRent2026)
5. Append row via Graph API

Error Handling:
- 401: Token invalid/expired
- 403: Access denied
- 400: Invalid payload
- 500: Server error dengan detail

Export: `appendRowsBatch()` untuk digunakan test route

### 5. app/api/excel/status/route.ts
**GET** - Check Excel connection status

Response:
```json
{
  "ok": true,
  "message": "Microsoft Excel Connected|Not Connected",
  "data": {
    "connected": boolean,
    "timestamp": ISO string
  }
}
```

Connected = Boolean(MS_GRAPH_ACCESS_TOKEN && MS_EXCEL_SHARE_URL)

### 6. app/api/excel/test/route.ts
**POST** - Test append dummy rows (optional rowCount param)

Features:
- Generate dummy ExcelRow dengan tanggalSewa, costume, nama, noWa
- Batch append: values: [[...], [...], ...]
- rowCount: 1-100 (default: 1)
- Reuse helper functions dari send route

## Environment Variables

```env
# .env.local
MS_GRAPH_ACCESS_TOKEN=PASTE_TOKEN_DI_SINI
MS_EXCEL_SHARE_URL=PASTE_LINK_SHAREPOINT_EXCEL_DI_SINI
MS_EXCEL_TABLE_NAME=tblRent2026  # optional, default value provided
```

## API Response Format

Semua endpoint return JSON structure:
```typescript
{
  ok: boolean;
  message: string;
  data?: unknown;      // response data
  error?: string;      // error message
}
```

HTTP Status Code:
- 200: Success (GET)
- 201: Created (POST)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 405: Method Not Allowed
- 500: Server Error

## Type Safety

- ✅ No `any` type
- ✅ No unused variables (using `_` prefix convention)
- ✅ Proper TypeScript interfaces untuk semua responses
- ✅ Safe JSON parsing dengan null checks
- ✅ Unknown error handling

## Testing Endpoints

### Test Status
```bash
curl -X GET http://localhost:3000/api/excel/status
```

### Test Send (Single Row)
```bash
curl -X POST http://localhost:3000/api/excel/send \
  -H "Content-Type: application/json" \
  -d '{
    "no": 1,
    "tanggalSewa": "2024-01-15",
    "costume": "Superman",
    "status": "booked",
    "nama": "John Doe",
    "tanggalLahir": "",
    "alamatPaket": "Jl. Test No. 1",
    "alamatKtp": "",
    "noWa": "081234567890",
    "kontakDarurat": "081111111111 / 081222222222",
    "sosmed": "@johndoe",
    "sosmedTemen": ""
  }'
```

### Test Append (Batch)
```bash
curl -X POST http://localhost:3000/api/excel/test \
  -H "Content-Type: application/json" \
  -d '{"rowCount": 5}'
```

## Next Steps (TODO)

1. **OAuth Implementation**
   - Replace manual token dengan Azure AD OAuth flow
   - Store refresh token secara aman
   - Auto-refresh token sebelum expired

2. **Batch Operations**
   - Optimize batch append untuk bulk data
   - Add retry logic dengan exponential backoff

3. **Error Monitoring**
   - Log failures ke database
   - Add retry queue untuk failed requests
   - Webhook notification untuk errors

4. **Integration dengan /api/save**
   - Parse data dari /api/save response
   - Call buildExcelRow() untuk convert
   - Auto-send ke Excel setelah save success

## References

- [Microsoft Graph Excel API Docs](https://learn.microsoft.com/en-us/graph/excel-manage-tables)
- [Share URL Format](https://learn.microsoft.com/en-us/graph/api/shares-get?view=graph-rest-1.0)
- [Workbook Rows Add](https://learn.microsoft.com/en-us/graph/api/worksheet-post-tables-add?view=graph-rest-1.0)
