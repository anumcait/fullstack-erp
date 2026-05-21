import React from "react";

/** Shared 6-column layout: label | : | value | label | : | value */
const PreviewFieldTableColgroup = () => (
  <colgroup>
    <col className="preview-col-label" />
    <col className="preview-col-colon" />
    <col className="preview-col-value" />
    <col className="preview-col-label" />
    <col className="preview-col-colon" />
    <col className="preview-col-value" />
  </colgroup>
);

export default PreviewFieldTableColgroup;
