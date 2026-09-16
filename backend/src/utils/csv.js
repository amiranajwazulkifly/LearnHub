/**
 * Minimal RFC 4180 CSV serialization.
 *
 * Deliberately not a library: the export surface is a handful of flat
 * result sets, and the only genuinely tricky part is quoting.
 */

/**
 * Quotes a single field.
 *
 * A field needs quoting if it contains a comma, a quote or a newline, and
 * embedded quotes are escaped by doubling them. The leading-punctuation
 * guard is a spreadsheet-injection defence: a cell starting with = + - or @
 * is interpreted as a formula by Excel and Sheets, so a student who names
 * themselves `=HYPERLINK(...)` would otherwise get that executed in
 * whatever spreadsheet an administrator opens the export in. Prefixing a
 * tab neutralises it while keeping the text readable.
 */
function escapeField(value) {
  if (value === null || value === undefined) return '';

  let text = value instanceof Date ? value.toISOString() : String(value);

  if (/^[=+\-@\t\r]/.test(text)) {
    text = `\t${text}`;
  }

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Serializes rows to CSV.
 *
 * `columns` is a list of [key, header] pairs, which fixes both the column
 * order and the human-readable header, independent of object key order.
 */
function toCsv(columns, rows) {
  const header = columns.map(([, label]) => escapeField(label)).join(',');

  const body = rows.map((row) =>
    columns.map(([key]) => escapeField(row[key])).join(',')
  );

  // CRLF and a trailing newline, per RFC 4180 — this is what Excel expects.
  return [header, ...body].join('\r\n') + '\r\n';
}

/** Sends a CSV response as a browser download. */
function sendCsv(res, filename, columns, rows) {
  const stamp = new Date().toISOString().slice(0, 10);
  const safeName = `learnhub-${filename}-${stamp}.csv`.replace(/[^a-zA-Z0-9.\-]/g, '_');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

  // UTF-8 BOM, so Excel detects the encoding and renders accented names
  // and the em dashes in our location strings correctly.
  res.status(200).send('﻿' + toCsv(columns, rows));
}

module.exports = { toCsv, escapeField, sendCsv };
