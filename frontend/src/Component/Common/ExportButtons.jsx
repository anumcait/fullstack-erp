import React from 'react';
import { Button, Stack } from '@mui/material';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCompany } from '../../context/CompanyContext';
import { formatDate } from '../../utils/format';

// columns: [{ field, header, type }]  rows: array of objects
const ExportButtons = ({ title, columns, rows, fileName }) => {
  const { companyName } = useCompany();

  const baseName = fileName || `${title || 'Report'}_${new Date().toISOString().slice(0, 10)}`;

  const exportExcel = () => {
    const data = rows.map((row) => {
      const o = {};
      columns.forEach((c) => {
        let v = row[c.field];
        if (c.type === 'date' && v) v = formatDate(v);
        o[c.header] = v ?? '';
      });
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${baseName}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const head = [columns.map((c) => c.header)];
    const body = rows.map((row) =>
      columns.map((c) => {
        let v = row[c.field];
        if (c.type === 'date' && v) v = formatDate(v);
        if (typeof v === 'number') v = v.toLocaleString('en-IN');
        return v ?? '';
      })
    );
    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 24 },
      didDrawPage: () => {
        doc.setFontSize(13);
        doc.setTextColor(33, 33, 33);
        doc.text(companyName || 'Company', 14, 14);
        doc.setFontSize(10);
        doc.setTextColor(110, 110, 110);
        doc.text(title || 'Report', 14, 20);
      },
    });
    doc.save(`${baseName}.pdf`);
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button size="small" variant="outlined" startIcon={<FaFileExcel color="#1f7a1f" />} onClick={exportExcel}>
        Excel
      </Button>
      <Button size="small" variant="outlined" startIcon={<FaFilePdf color="#c62828" />} onClick={exportPdf}>
        PDF
      </Button>
    </Stack>
  );
};

export default ExportButtons;
