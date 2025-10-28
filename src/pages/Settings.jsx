import React, { useState, useEffect } from "react";

export default function AutoDeleteSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  // Base URL untuk API
  const API_BASE_URL = "http://localhost:3001/api/auto-delete";

  const intervalOptions = [
    { value: "minutes", label: "Menit", max: 59 },
    { value: "hours", label: "Jam", max: 23 },
    { value: "days", label: "Hari", max: 30 },
    { value: "months", label: "Bulan", max: 12 },
  ];

  // Fetch config dan status
  useEffect(() => {
    fetchConfig();
    fetchStatus();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config`);
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Backend tidak merespon JSON. Cek routing server!");
        showMessage("error", "Backend belum terhubung. Cek console untuk detail.");
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        showMessage("error", "Gagal memuat konfigurasi");
      }
    } catch (err) {
      console.error("❌ Error loading config:", err);
      console.error("💡 Pastikan backend server2.js sudah di-mount di /auto-delete");
      showMessage("error", "Backend belum terhubung dengan benar");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/status`);
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error("Error loading status:", err);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(""), 5000);
  };

  const handleChange = (type, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const saveChanges = async (type) => {
    if (!config || !config[type]) return;

    const intervalValue = parseInt(config[type].intervalValue);
    const option = intervalOptions.find(
      (o) => o.value === config[type].intervalType
    );

    if (intervalValue < 1 || intervalValue > option.max) {
      showMessage(
        "error",
        `Nilai harus antara 1-${option.max} untuk ${option.label}`
      );
      return;
    }

    try {
      setSaving(true);
      const payload = {
        type,
        enabled: config[type].enabled,
        intervalType: config[type].intervalType,
        intervalValue: intervalValue,
      };

      const res = await fetch(`${API_BASE_URL}/edit-interval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const typeName =
          type === "chatHistory" ? "Chat History" : "Analysis History";
        showMessage("success", `Pengaturan ${typeName} berhasil disimpan`);
        fetchStatus();
      } else {
        showMessage("error", data.error || "Gagal menyimpan");
      }
    } catch (err) {
      console.error("Error saving:", err);
      showMessage("error", "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async (type) => {
    const endpoint =
      type === "chatHistory" ? "chat-history" : "analysis-history";
    const typeName =
      type === "chatHistory" ? "Chat History" : "Analysis History";

    if (
      !window.confirm(
        `Yakin ingin menjalankan penghapusan ${typeName} sekarang?`
      )
    ) {
      return;
    }

    try {
      setExecuting(type);
      const res = await fetch(`${API_BASE_URL}/execute/${endpoint}`, {
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        showMessage(
          "success",
          `${typeName} berhasil dihapus. Total: ${data.totalDeleted || 0} file`
        );
        fetchStatus();
      } else {
        showMessage("error", data.error || "Gagal menjalankan penghapusan");
      }
    } catch (err) {
      console.error("Error executing delete:", err);
      showMessage("error", "Terjadi kesalahan");
    } finally {
      setExecuting(null);
    }
  };

  const resetConfig = async () => {
    if (
      !window.confirm(
        "Yakin ingin mereset semua pengaturan ke default? Semua jadwal akan dinonaktifkan."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/config`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        showMessage("success", "Konfigurasi berhasil direset");
        fetchConfig();
        fetchStatus();
      } else {
        showMessage("error", "Gagal mereset konfigurasi");
      }
    } catch (err) {
      console.error("Error resetting:", err);
      showMessage("error", "Terjadi kesalahan");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Belum pernah dijalankan";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMaxValue = (intervalType) => {
    const option = intervalOptions.find((o) => o.value === intervalType);
    return option ? option.max : 30;
  };

  const renderSection = (type, title, icon, color) => {
    const typeStatus = status?.[type];
    const typeConfig = config?.[type];

    return (
      <div style={styles.card}>
        <div style={{ ...styles.cardHeader, borderColor: color }}>
          <h2 style={styles.cardTitle}>
            <i className={`fas ${icon}`} style={{ color }}></i>
            {title}
          </h2>
          {typeStatus && (
            <div style={styles.statusBadge}>
              <span
                style={{
                  ...styles.badge,
                  backgroundColor: typeStatus.scheduleActive
                    ? "#10B981"
                    : "#6B7280",
                }}
              >
                {typeStatus.scheduleActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          )}
        </div>

        <div style={styles.cardContent}>
          {/* Enable/Disable Toggle */}
          <div style={styles.toggleContainer}>
            <label style={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={typeConfig?.enabled || false}
                onChange={(e) =>
                  handleChange(type, "enabled", e.target.checked)
                }
                style={styles.checkbox}
              />
              <span style={{ fontWeight: "500" }}>
                Aktifkan Auto Delete
              </span>
            </label>
          </div>

          {/* Interval Settings */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>Tipe Interval</label>
              <select
                value={typeConfig?.intervalType || "days"}
                onChange={(e) =>
                  handleChange(type, "intervalType", e.target.value)
                }
                style={styles.select}
              >
                {intervalOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} (1-{opt.max})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputWrapper}>
              <label style={styles.label}>Nilai Interval</label>
              <input
                type="number"
                min="1"
                max={getMaxValue(typeConfig?.intervalType || "days")}
                value={typeConfig?.intervalValue || 1}
                onChange={(e) =>
                  handleChange(type, "intervalValue", e.target.value)
                }
                style={styles.input}
              />
            </div>
          </div>

          {/* Description */}
          <div style={styles.infoBox}>
            <i
              className="fas fa-info-circle"
              style={{ color: "#3B82F6", marginRight: "8px" }}
            ></i>
            <span>
              File yang lebih tua dari{" "}
              <strong>
                {typeConfig?.intervalValue || 1}{" "}
                {intervalOptions.find(
                  (o) => o.value === (typeConfig?.intervalType || "days")
                )?.label || "hari"}
              </strong>{" "}
              akan dihapus otomatis
            </span>
          </div>

          {/* Statistics */}
          {typeStatus && (
            <div style={styles.statsContainer}>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>File Saat Ini</div>
                <div style={styles.statValue}>
                  {typeStatus.currentFiles || 0}
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Total Terhapus</div>
                <div style={styles.statValue}>
                  {typeStatus.totalDeleted || 0}
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Terakhir Dijalankan</div>
                <div style={styles.statValue}>
                  {formatDate(typeStatus.lastRun)}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <button
              onClick={() => saveChanges(type)}
              disabled={saving}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Simpan Pengaturan
                </>
              )}
            </button>

            <button
              onClick={() => executeDelete(type)}
              disabled={executing === type}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                opacity: executing === type ? 0.6 : 1,
              }}
            >
              {executing === type ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Menghapus...
                </>
              ) : (
                <>
                  <i className="fas fa-play"></i> Jalankan Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <i
            className="fas fa-spinner fa-spin"
            style={{ fontSize: "48px", color: "#3B82F6" }}
          ></i>
          <p style={{ marginTop: "16px", color: "#6B7280" }}>
            Loading auto-delete settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <i className="fas fa-trash-alt"></i> Auto Delete Settings
        </h1>
        <p style={styles.subtitle}>
          Kelola penghapusan otomatis untuk chat history dan analysis history
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          style={{
            ...styles.alert,
            backgroundColor:
              message.type === "success" ? "#D1FAE5" : "#FEE2E2",
            color: message.type === "success" ? "#065F46" : "#991B1B",
            borderColor:
              message.type === "success" ? "#A7F3D0" : "#FCA5A5",
          }}
        >
          <i
            className={`fas ${
              message.type === "success"
                ? "fa-check-circle"
                : "fa-exclamation-circle"
            }`}
            style={{ marginRight: "8px" }}
          ></i>
          {message.text}
        </div>
      )}

      {/* Sections */}
      {renderSection(
        "chatHistory",
        "Chat History Auto Delete",
        "fa-comments",
        "#3B82F6"
      )}
      {renderSection(
        "analysisHistory",
        "Analysis History Auto Delete",
        "fa-chart-line",
        "#10B981"
      )}

      {/* Reset Button */}
      <div style={styles.resetContainer}>
        <button onClick={resetConfig} style={styles.buttonDanger}>
          <i className="fas fa-redo"></i> Reset ke Default
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: "#F9FAFB",
    minHeight: "100vh",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6B7280",
    margin: "0",
  },
  alert: {
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "24px",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "20px 24px",
    borderBottom: "2px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
  },
  cardContent: {
    padding: "24px",
  },
  toggleContainer: {
    marginBottom: "24px",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#374151",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  inputGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  select: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#111827",
    cursor: "pointer",
    outline: "none",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    outline: "none",
  },
  infoBox: {
    padding: "12px",
    backgroundColor: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#1E40AF",
    display: "flex",
    alignItems: "center",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
  },
  statItem: {
    textAlign: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6B7280",
    marginBottom: "4px",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  button: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
  },
  buttonPrimary: {
    backgroundColor: "#3B82F6",
    color: "white",
  },
  buttonSecondary: {
    backgroundColor: "#10B981",
    color: "white",
  },
  buttonDanger: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#EF4444",
    color: "white",
    transition: "all 0.2s",
  },
  resetContainer: {
    textAlign: "center",
    paddingTop: "16px",
    borderTop: "1px solid #E5E7EB",
  },
};