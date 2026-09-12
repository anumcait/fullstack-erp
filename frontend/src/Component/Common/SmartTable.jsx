import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaSlidersH, FaEdit } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faSort } from '@fortawesome/free-solid-svg-icons';
import "./SmartTable.css";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { useCompany } from "../../context/CompanyContext";

const SmartTable = ({ title, columns, data, onPreview, onEdit, onToggleExpand, renderExpanded, headerAction, disableActions = false, disableExpand = false, initialWidths = {}, loading = false, onRowClick = null }) => {
  const { companyName } = useCompany();
  const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.field));
  const [tempVisibleColumns, setTempVisibleColumns] = useState([...visibleColumns]);

  useEffect(() => {
    setVisibleColumns(columns.map(col => col.field));
  }, [columns]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnWidths, setColumnWidths] = useState(() => {
    const w = {};
    columns.forEach((c) => {
      const len = (c.header || '').length || 6;
      w[c.field] = initialWidths?.[c.field] ?? Math.max(140, Math.min(320, len * 9 + 48));
    });
    return w;
  });
  useEffect(() => {
    if (!initialWidths) return;
    setColumnWidths((prev) => {
      let changed = false;
      const w = { ...prev };
      Object.keys(initialWidths).forEach((k) => {
        if (w[k] !== initialWidths[k]) { w[k] = initialWidths[k]; changed = true; }
      });
      return changed ? w : prev;
    });
  }, [initialWidths]);

  // Drag-to-resize column widths
  const startResize = (field, e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[field] || 150;
    const onMove = (ev) => {
      const newWidth = Math.max(70, startWidth + (ev.clientX - startX));
      setColumnWidths((w) => ({ ...w, [field]: newWidth }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Dual scrollbar refs
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);
  const tableRef = useRef(null);

  // Sync inner top-scroll width to actual table scroll width
  useEffect(() => {
    if (tableRef.current && topScrollRef.current) {
      const inner = topScrollRef.current.querySelector('.smart-table-top-scroll-inner');
      if (inner) inner.style.width = `${tableRef.current.scrollWidth}px`;
    }
  });

  const syncTopScroll = () => {
    if (bottomScrollRef.current)
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
  };
  const syncBottomScroll = () => {
    if (topScrollRef.current)
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
  };


  const toggleTempColumn = (field) => {
    setTempVisibleColumns(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleOpenSelector = () => {
    setTempVisibleColumns([...visibleColumns]);
    setShowColumnSelector(true);
  };

  const handleApplyColumns = () => {
    setVisibleColumns([...tempVisibleColumns]);
    setShowColumnSelector(false);
  };

  const handleSort = (field) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const sortedData = [...data].sort((a, b) => {
    const { field, direction } = sortConfig;
    if (!field) return 0;
    const aVal = a[field]?.toString().toLowerCase() ?? '';
    const bVal = b[field]?.toString().toLowerCase() ?? '';
    return aVal.localeCompare(bVal) * (direction === 'asc' ? 1 : -1);
  });

  const filteredData = sortedData.filter((row) => {
    return Object.entries(filters).every(([field, value]) => {
      if (!value) return true;
      if (field === 'emp_display') {
        const combined = `${row.empid || ''} - ${row.ename || ''}`.toLowerCase();
        const v = value.toLowerCase();
        return combined.includes(v) || String(row.empid||'').toLowerCase().includes(v) || String(row.ename||'').toLowerCase().includes(v) || String(row[field]||'').toLowerCase().includes(v);
      }
      return row[field]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  const pagedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const exportToExcel = () => {
    const exportData = filteredData.map((row) => {
      const output = {};
      visibleColumns.forEach((col) => {
        const header = columns.find((c) => c.field === col)?.header || col;
        output[header] = row[col];
      });
      return output;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${companyName}_${title || "Report"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = visibleColumns.map((col) => {
      const colHeader = columns.find(c => c.field === col)?.header || col;
      return colHeader;
    });

    const tableRows = filteredData.map((row) =>
      visibleColumns.map((col) => row[col] ?? "")
    );

    autoTable(doc, {
      head: [[{ content: companyName, colSpan: tableColumn.length, styles: { halign: 'center', fontSize: 14, fontStyle: 'bold' } }]],
      body: [],
      theme: 'plain',
      margin: { top: 10 }
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      margin: { top: 5 },
      startY: 25 // Start after the company header
    });

    doc.save(`${companyName}_${title || "Report"}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  const actionColCount = (disableActions ? 0 : 1) + (disableExpand ? 0 : 1);

  return (
    <div className="smart-table-wrapper">
      {loading && (
        <div className="smart-table-loading">
          <div className="smart-table-spinner" /> Loading…
        </div>
      )}
      {/* Header */}
      <div className="smart-table-header">
        <div className="smart-table-title">
          {title}
        </div>



        <div className="smart-column-toggle">
          <div className="smart-header-actions">
            {headerAction && <>{headerAction}<div className="vertical-divider" /></>}
            <button onClick={exportToExcel} title="Export to Excel" className="icon-button excel-btn">
              <FaFileExcel size={16} />
            </button>
            <div className="vertical-divider" />
            <button onClick={exportToPDF} title="Export to PDF" className="icon-button pdf-btn">
              <FaFilePdf size={16} />
            </button>

            <div className="vertical-divider" />

            <button onClick={handleOpenSelector} title="Displayed Columns" className="icon-button">
              <FaSlidersH size={16} />
            </button>
          </div>

          {showColumnSelector && (
            <div className="column-selector-dropdown">
              <div className="dropdown-header">Displayed columns</div>
              <div className="select-all-row checkbox-label">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={tempVisibleColumns.length === columns.length}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        tempVisibleColumns.length > 0 &&
                        tempVisibleColumns.length < columns.length;
                    }
                  }}
                  onChange={() => {
                    if (tempVisibleColumns.length === columns.length) {
                      setTempVisibleColumns([]);
                    } else {
                      setTempVisibleColumns(columns.map(col => col.field));
                    }
                  }}
                />
                <span className="dropdown-count">
                  {tempVisibleColumns.length === columns.length
                    ? "All selected"
                    : tempVisibleColumns.length === 0
                      ? "Select all"
                      : `${tempVisibleColumns.length} of ${columns.length} selected`}
                </span>
              </div>
              <hr className="dropdown-separator" />
              <div className="dropdown-columns">
                {columns.map((col, i) => (
                  <label key={i} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={tempVisibleColumns.includes(col.field)}
                      onChange={() => toggleTempColumn(col.field)}
                    />
                    <span>{col.header}</span>
                  </label>
                ))}
              </div>
              <div className="dropdown-actions">
                <button onClick={() => setShowColumnSelector(false)}>Cancel</button>
                <button onClick={handleApplyColumns}>OK</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table with dual scrollbars */}
      <div
        className="smart-table-top-scroll"
        ref={topScrollRef}
        onScroll={syncTopScroll}
      >
        <div className="smart-table-top-scroll-inner" />
      </div>
      <div
        className="smart-table-container"
        ref={bottomScrollRef}
        onScroll={syncBottomScroll}
      >
        <table className="smart-table" ref={tableRef} style={{ tableLayout: 'fixed', width: 'max-content' }}>
          <thead>
            <tr>
              {columns.filter(col => visibleColumns.includes(col.field)).map((col, colIdx) => (
                <th
                  key={colIdx}
                  className="sortable-header"
                  onClick={() => handleSort(col.field)}
                  style={{ width: columnWidths[col.field], minWidth: columnWidths[col.field], position: 'relative' }}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>
                    {col.header}
                    <span className="sort-icon">
                      {sortConfig.field === col.field ? (
                        <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowUp : faArrowDown} />
                      ) : (
                        <FontAwesomeIcon icon={faSort} />
                      )}
                    </span>
                  </span>
                  <br />
                  <input
                    type="text"
                    placeholder="Filter"
                    value={filters[col.field] || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleFilterChange(col.field, e.target.value)}
                    style={{ width: '100%', fontSize: '14px', marginTop: '4px' }}
                  />
                  <span
                    className="col-resize-handle"
                    onMouseDown={(e) => startResize(col.field, e)}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to resize"
                  />
                </th>
              ))}
              {!disableActions && <th>Actions</th>}
              {!disableExpand && <th></th>}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, i) => (
              <React.Fragment key={row.id ?? row.sno ?? i}>
                <tr className={row._expanded ? "row-expanded" : ""} onClick={() => onRowClick && onRowClick(row)}>
                  {columns.filter(col => visibleColumns.includes(col.field)).map((col, colIdx) => (
                    <td key={colIdx} style={{ textAlign: col.align || 'left', width: col.expandable ? columnWidths[col.field] : undefined, maxWidth: col.expandable ? columnWidths[col.field] : undefined, ...(col.expandable && row._expanded ? { whiteSpace: 'normal', wordBreak: 'break-word' } : {}) }}>
                      {col.render ? (
                        col.render(row)
                      ) : col.expandable ? (
                        <div
                          tabIndex={0}
                          role="button"
                          aria-expanded={row._expanded ? "true" : "false"}
                          className={`reason-container ${row._expanded ? "expanded" : ""}`}
                          title={!row._expanded ? row[col.field] : ""}
                          style={{ width: columnWidths[col.field] ? `${Math.max(80, columnWidths[col.field] - 16)}px` : '164px', display: 'block' }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              if (!row._expanded && onToggleExpand) onToggleExpand(row);
                            } else if (e.key === 'ArrowUp' || e.key === 'Escape') {
                              e.preventDefault();
                              if (row._expanded && onToggleExpand) onToggleExpand(row);
                            }
                          }}
                          onBlur={() => {
                            if (row._expanded && onToggleExpand) onToggleExpand(row);
                          }}
                        >
                          <span className="reason-text">{row[col.field]}</span>
                        </div>
                      ) : (
                        row[col.field]
                      )}
                    </td>
                  ))}
                  {!disableActions && (
                  <td className="preview-icon-cell">
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPreview && onPreview(row); }} title="Preview">
                        <FaSearch size={18} color="#007bff" />
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit && onEdit(row); }} title="Edit">
                        <FaEdit size={18} color="#28a745" />
                      </a>
                    </div>
                  </td>
                  )}
                  {!disableExpand && (
                  <td className="expand-icon-cell">
                    <div
                      className={`expand-wrapper ${row._expanded ? "is-expanded" : ""}`}
                      title={row._expanded ? "Collapse row" : "View all row content"}
                      onClick={(e) => { e.stopPropagation(); onToggleExpand && onToggleExpand(row); }}
                      style={{
                        background: row._expanded ? '#e3f2fd' : '#f5f5f5',
                        padding: '8px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg
                        viewBox="0 0 18 18"
                        width="24"
                        height="24"
                        className={`unfold-icon ${row._expanded ? "rotated" : ""}`}
                        style={{ fill: row._expanded ? '#1976d2' : '#757575' }}
                      >
                        <path d="M3.5 4.5L2 6l7 7 7-7-1.5-1.5L9 10 3.5 4.5z" />
                      </svg>
                    </div>
                  </td>
                  )}
                </tr>
                {row._expanded && (
                  <>
                    {renderExpanded && (
                      <tr className="expanded-detail-row">
                        <td colSpan={visibleColumns.length + actionColCount} className="expanded-detail-cell">
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    )}
                    {!renderExpanded && row.leaveDetails && row.leaveDetails.length > 1 && (
                  <tr className="expanded-detail-row">
                    <td colSpan={visibleColumns.length + actionColCount} className="expanded-detail-cell">
                      <div className="nested-grid-container">
                        <table className="nested-detail-table">
                          <thead>
                            <tr>
                              <th>From Date</th>
                              <th>To Date</th>
                              <th>Days</th>
                              <th>Type</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.leaveDetails.map((detail, dIdx) => (
                              <tr key={dIdx}>
                                <td>{detail.frmdt ? new Date(detail.frmdt).toLocaleDateString('en-GB').replace(/\//g, '-') : '-'}</td>
                                <td>{detail.todate ? new Date(detail.todate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-'}</td>
                                <td>{parseFloat(detail.nod || 0).toString()}</td>
                                <td>{detail.daydt || "FULL DAY"}</td>
                                <td>{detail.remarks || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-row">
          <div className="pagination-controls">
            <label className="rows-per-page">
              {/* Rows per page:&nbsp; */}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>

            <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
            <span>
              Page <strong>{page + 1}</strong> of <strong>{Math.max(1, Math.ceil(filteredData.length / rowsPerPage))}</strong>
            </span>
            <button
              disabled={(page + 1) * rowsPerPage >= filteredData.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default SmartTable;
