In my testing , find these and fix it.

        {/* Spacer to push footer to the bottom */}
        <div style={{ minHeight: '5px' }}></div>

        {/* Standardized Signatures */}
        <div className="leave-print-footer">
          <table className="leave-signature-grid">
            <tbody>
              <tr>
                <td style={{ width: '25%' }}>
                  <br /><br />
                  <strong>Recommended By</strong>
                </td>
                <td style={{ width: '25%' }}>
                  <br /><br />
                  <strong>Approved By</strong>
                </td>
                <td style={{ width: '25%' }}>
                  <br /><br />
                  <strong>GM</strong>
                </td>
                <td style={{ width: '25%' }}>
                  <br /><br />
                  <strong>DIRECTOR</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '5px' }} className="no-print">
            Report Dated: {reportDate}
          </div>

          {/* Standardized Actions */}
          <div className="leave-actions no-print">
            <button onClick={() => window.print()}>Print</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}; this section not showing in printpreview while click on print button
