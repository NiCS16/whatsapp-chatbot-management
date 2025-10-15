import React, { useState, useEffect } from "react";

export default function BotScheduleSettings({ bot }) {
  const API_BASE = 'http://localhost:3001';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState({
    enabled: true,
    autoStartEnabled: true,
    autoStartHour: 19,
    autoStartMinute: 0,
    autoStopEnabled: true,
    autoStopHour: 7,
    autoStopMinute: 0,
    timezone: 'Asia/Jakarta'
  });

  const [originalSchedule, setOriginalSchedule] = useState(null);

  useEffect(() => {
    if (bot) {
      fetchSchedule();
    }
  }, [bot]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${bot.name}/schedule`);
      const data = await response.json();
      if (data.success) {
        setSchedule(data.schedule);
        setOriginalSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Gagal memuat konfigurasi schedule');
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${bot.name}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Schedule berhasil disimpan! Perubahan akan aktif segera.');
        setOriginalSchedule(data.schedule);
        setSchedule(data.schedule);
      } else {
        alert(`❌ Gagal menyimpan: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('❌ Gagal menyimpan schedule');
    } finally {
      setSaving(false);
    }
  };

  const resetSchedule = async () => {
    if (!window.confirm('Reset schedule ke default (Start: 19:00, Stop: 07:00)?')) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${bot.name}/schedule`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Schedule direset ke default');
        setSchedule(data.schedule);
        setOriginalSchedule(data.schedule);
      } else {
        alert(`❌ Gagal reset: ${data.error}`);
      }
    } catch (error) {
      console.error('Error resetting schedule:', error);
      alert('❌ Gagal reset schedule');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!originalSchedule) return false;
    return JSON.stringify(schedule) !== JSON.stringify(originalSchedule);
  };

  const formatTime = (hour, minute) => {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
        <p>Memuat konfigurasi schedule...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Info Banner */}
      <div className="info-banner">
        <i className="fas fa-info-circle"></i>
        <div>
          <strong>Tentang Auto Schedule</strong>
          <p>Bot "{bot.name}" akan otomatis menyala dan mati sesuai jadwal yang Anda atur di sini. Pastikan server tetap berjalan agar schedule dapat bekerja.</p>
        </div>
      </div>

      {/* Master Toggle */}
      <div className="card">
        <div className="card-content">
          <div className="setting-row" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) => setSchedule({...schedule, enabled: e.target.checked})}
              />
              <span className="switch-slider"></span>
              <span className="switch-text" style={{ fontSize: '1.1rem' }}>
                <strong>{schedule.enabled ? '✓ Schedule Aktif' : '✗ Schedule Tidak Aktif'}</strong>
              </span>
            </label>
            <p style={{ marginTop: '10px', marginLeft: '62px', color: '#718096', fontSize: '0.9rem' }}>
              {schedule.enabled 
                ? 'Bot akan mengikuti jadwal auto start/stop yang dikonfigurasi di bawah'
                : 'Semua schedule untuk bot ini dinonaktifkan. Bot hanya bisa dijalankan manual.'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {schedule.enabled && (
        <div className="status-card">
          <h3><i className="fas fa-calendar-check"></i> Status Schedule Saat Ini</h3>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-label">🌅 Auto Start</div>
              <div className={`status-value ${schedule.autoStartEnabled ? 'active' : 'inactive'}`}>
                {schedule.autoStartEnabled 
                  ? `✓ Aktif pada ${formatTime(schedule.autoStartHour, schedule.autoStartMinute)} WIB`
                  : '✗ Tidak Aktif'
                }
              </div>
            </div>
            <div className="status-item">
              <div className="status-label">🌙 Auto Stop</div>
              <div className={`status-value ${schedule.autoStopEnabled ? 'active' : 'inactive'}`}>
                {schedule.autoStopEnabled 
                  ? `✓ Aktif pada ${formatTime(schedule.autoStopHour, schedule.autoStopMinute)} WIB`
                  : '✗ Tidak Aktif'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto Start Settings */}
      {schedule.enabled && (
        <div className="card">
          <div className="card-header">
            <h3><i className="fas fa-play-circle"></i> Auto Start Bot</h3>
          </div>
          <div className="card-content">
            <div className="setting-row">
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={schedule.autoStartEnabled}
                  onChange={(e) => setSchedule({...schedule, autoStartEnabled: e.target.checked})}
                />
                <span className="switch-slider"></span>
                <span className="switch-text">
                  {schedule.autoStartEnabled ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </label>
            </div>

            {schedule.autoStartEnabled && (
              <div className="time-picker-row">
                <div className="time-picker-group">
                  <label>Jam</label>
                  <select
                    value={schedule.autoStartHour}
                    onChange={(e) => setSchedule({...schedule, autoStartHour: parseInt(e.target.value)})}
                    className="time-select"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="time-separator">:</span>
                <div className="time-picker-group">
                  <label>Menit</label>
                  <select
                    value={schedule.autoStartMinute}
                    onChange={(e) => setSchedule({...schedule, autoStartMinute: parseInt(e.target.value)})}
                    className="time-select"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="time-display">
                  <i className="fas fa-arrow-right"></i>
                  <span className="time-preview">
                    {formatTime(schedule.autoStartHour, schedule.autoStartMinute)} WIB
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto Stop Settings */}
      {schedule.enabled && (
        <div className="card">
          <div className="card-header">
            <h3><i className="fas fa-stop-circle"></i> Auto Stop Bot</h3>
          </div>
          <div className="card-content">
            <div className="setting-row">
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={schedule.autoStopEnabled}
                  onChange={(e) => setSchedule({...schedule, autoStopEnabled: e.target.checked})}
                />
                <span className="switch-slider"></span>
                <span className="switch-text">
                  {schedule.autoStopEnabled ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </label>
            </div>

            {schedule.autoStopEnabled && (
              <div className="time-picker-row">
                <div className="time-picker-group">
                  <label>Jam</label>
                  <select
                    value={schedule.autoStopHour}
                    onChange={(e) => setSchedule({...schedule, autoStopHour: parseInt(e.target.value)})}
                    className="time-select"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="time-separator">:</span>
                <div className="time-picker-group">
                  <label>Menit</label>
                  <select
                    value={schedule.autoStopMinute}
                    onChange={(e) => setSchedule({...schedule, autoStopMinute: parseInt(e.target.value)})}
                    className="time-select"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="time-display">
                  <i className="fas fa-arrow-right"></i>
                  <span className="time-preview">
                    {formatTime(schedule.autoStopHour, schedule.autoStopMinute)} WIB
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={saveSchedule}
          disabled={saving || !hasChanges()}
        >
          <i className="fas fa-save"></i>
          {saving ? ' Menyimpan...' : ' Simpan Perubahan'}
        </button>
        <button
          className="btn btn-outline"
          onClick={resetSchedule}
          disabled={saving}
        >
          <i className="fas fa-undo"></i>
          Reset ke Default
        </button>
        {hasChanges() && (
          <button
            className="btn btn-secondary"
            onClick={() => setSchedule(originalSchedule)}
          >
            <i className="fas fa-times"></i>
            Batal
          </button>
        )}
      </div>

      {/* Warning */}
      {schedule.enabled && (
        <div className="warning-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Penting!</strong>
            <p>Schedule ini hanya berlaku untuk bot "{bot.name}". Pastikan server tetap berjalan 24/7 agar schedule dapat bekerja dengan baik.</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .info-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: start;
          gap: 15px;
          margin-bottom: 25px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .info-banner i { font-size: 1.5rem; margin-top: 2px; }
        .info-banner strong { display: block; margin-bottom: 5px; font-size: 1.1rem; }
        .info-banner p { margin: 0; opacity: 0.95; line-height: 1.5; }

        .status-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .status-card h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .status-item {
          padding: 15px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #e2e8f0;
        }
        .status-label {
          font-size: 0.875rem;
          color: #718096;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .status-value {
          font-size: 1rem;
          font-weight: 600;
        }
        .status-value.active { color: #38a169; }
        .status-value.inactive { color: #cbd5e0; }

        .card {
          background: white;
          border-radius: 12px;
          margin-bottom: 25px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .card-header {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 20px 25px;
          border-bottom: 1px solid #e2e8f0;
        }
        .card-header h3 {
          margin: 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
        }
        .card-content {
          padding: 25px;
        }

        .setting-row {
          margin-bottom: 20px;
        }
        .switch-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }
        .switch-label input[type="checkbox"] {
          display: none;
        }
        .switch-slider {
          position: relative;
          width: 50px;
          height: 26px;
          background: #cbd5e0;
          border-radius: 34px;
          transition: 0.3s;
          margin-right: 12px;
        }
        .switch-slider::before {
          content: "";
          position: absolute;
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }
        .switch-label input:checked + .switch-slider {
          background: #48bb78;
        }
        .switch-label input:checked + .switch-slider::before {
          transform: translateX(24px);
        }
        .switch-text {
          font-weight: 500;
          color: #2d3748;
          font-size: 1rem;
        }

        .time-picker-row {
          display: flex;
          align-items: end;
          gap: 15px;
          margin-top: 20px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          border: 2px dashed #cbd5e0;
          flex-wrap: wrap;
        }
        .time-picker-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .time-picker-group label {
          font-size: 0.875rem;
          color: #718096;
          font-weight: 500;
        }
        .time-select {
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 70px;
        }
        .time-select:hover {
          border-color: #cbd5e0;
        }
        .time-select:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
        .time-separator {
          font-size: 2rem;
          font-weight: bold;
          color: #4a5568;
          margin: 0 5px;
          padding-bottom: 8px;
        }
        .time-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 15px;
          background: white;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          margin-left: 10px;
        }
        .time-display i {
          color: #718096;
        }
        .time-preview {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2d3748;
          font-family: 'Courier New', monospace;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          margin: 30px 0;
          flex-wrap: wrap;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-outline {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }
        .btn-outline:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #2d3748;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .warning-banner {
          background: #fff5f5;
          border-left: 4px solid #fc8181;
          color: #742a2a;
          padding: 20px;
          border-radius: 8px;
          display: flex;
          align-items: start;
          gap: 15px;
          margin-top: 25px;
        }
        .warning-banner i {
          font-size: 1.5rem;
          color: #fc8181;
          margin-top: 2px;
        }
        .warning-banner strong {
          display: block;
          margin-bottom: 5px;
          font-size: 1rem;
        }
        .warning-banner p {
          margin: 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .status-grid {
            grid-template-columns: 1fr;
          }
          .time-picker-row {
            flex-wrap: wrap;
          }
          .time-display {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }
          .action-buttons {
            flex-direction: column;
          }
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}