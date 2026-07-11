import React, { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const EmployeePhoto = ({ empid, ename, size = 36, photosMap, onLoad }) => {
  const [photo, setPhoto] = useState(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!empid) return;

    if (photosMap && photosMap[empid]) {
      const entry = photosMap[empid];
      setPhoto(entry.photo ? `data:${entry.mimeType || "image/jpeg"};base64,${entry.photo}` : null);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    axios
      .get(`${API}/api/employees/${empid}/photo`, { withCredentials: true })
      .then((res) => {
        if (cancelled) return;
        if (res.data && res.data.photo) {
          setMimeType(res.data.mimeType || "image/jpeg");
          setPhoto(`data:${res.data.mimeType || "image/jpeg"};base64,${res.data.photo}`);
        } else {
          setPhoto(null);
        }
        setLoaded(true);
        if (onLoad) onLoad(empid, res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setPhoto(null);
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [empid, photosMap, onLoad]);

  if (!loaded) {
    return (
      <div
        className="emp-photo-skeleton"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="emp-photo-wrapper" title={ename || empid}>
      {photo ? (
        <img
          src={photo}
          alt={ename || empid}
          className="emp-photo-img"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="emp-photo-initials"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {getInitials(ename)}
        </div>
      )}
    </div>
  );
};

export default EmployeePhoto;
