import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function BotManagement({ onManageBot }) {
  const [bots, setBots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [qrData, setQrData] = useState({ qr: null, status: 'unknown' });
  const [searchTerm, setSearchTerm] = useState("");
  const [newBot, setNewBot] = useState({
    name: "",
    description: "",
    allowedNumbers: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrPollInterval, setQrPollInterval] = useState(null);
  const [runningBots, setRunningBots] = useState(new Set());
  const [lastQrHash, setLastQrHash] = useState(null); // Track QR changes

  const API_BASE = "http://localhost:3001";

  // Generate simple hash for QR data to detect changes
  const generateQrHash = (qrString) => {
    if (!qrString) return null;
    let hash = 0;
    for (let i = 0; i < qrString.length; i++) {
      const char = qrString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  // Fetch bots from backend
  const fetchBots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/bots`);
      if (!response.ok) throw new Error('Failed to fetch bots');
      const data = await response.json();
      setBots(data.bots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch running bots to get real running status
  const fetchRunningBots = async () => {
    try {
      const response = await fetch(`${API_BASE}/running`);
      if (response.ok) {
        const data = await response.json();
        const runningSet = new Set(data.bots.map(bot => bot.name));
        setRunningBots(runningSet);
      }
    } catch (err) {
      console.warn('Failed to fetch running bots:', err);
    }
  };

  // Enhanced QR polling with change detection
  const pollQrCode = async (botName) => {
    try {
      const qrResponse = await fetch(`${API_BASE}/bots/${botName}/qr?t=${Date.now()}`);
      
      if (qrResponse.ok) {
        const qrResponseData = await qrResponse.json();
        
        // Generate hash for current QR data
        const currentQrHash = generateQrHash(qrResponseData.qr);
        
        // Only update if QR data actually changed or status changed
        if (currentQrHash !== lastQrHash || qrResponseData.status !== qrData.status) {
          console.log('QR Code updated:', {
            oldHash: lastQrHash,
            newHash: currentQrHash,
            status: qrResponseData.status
          });
          
          setQrData(qrResponseData);
          setLastQrHash(currentQrHash);
        }

        // Check if authentication completed
        if (['authenticated', 'ready'].includes(qrResponseData.status)) {
          if (qrPollInterval) {
            clearInterval(qrPollInterval);
            setQrPollInterval(null);
          }
          
          await fetchBots();
          await fetchRunningBots();

          setTimeout(() => {
            setShowQRModal(false);
            setLastQrHash(null);
          }, 3000);
          
          return true; // Signal completion
        }
      } else if (qrResponse.status === 404) {
        // QR not available yet
        setQrData(prev => ({ ...prev, status: 'waiting' }));
      }
    } catch (err) {
      console.error('Error polling QR:', err);
      setQrData(prev => ({ ...prev, status: 'error' }));
    }
    
    return false; // Continue polling
  };

  useEffect(() => {
    fetchBots();
    fetchRunningBots();

    // Set up periodic refresh for running status
    const refreshInterval = setInterval(() => {
      fetchRunningBots();
    }, 5000);

    // Clean up intervals on unmount
    return () => {
      if (qrPollInterval) clearInterval(qrPollInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  // Helper function to get bot display status
  const getBotDisplayStatus = (bot) => {
    const isRunning = runningBots.has(bot.name);

    if (isRunning) {
      return {
        text: bot.runtimeStatus || 'Running',
        className: 'status-running',
        icon: 'fa-play-circle'
      };
    }

    switch (bot.status) {
      case 'Ready':
        return {
          text: 'Ready to Start',
          className: 'status-ready',
          icon: 'fa-circle-check'
        };
      case 'Not Configured':
        return {
          text: 'Not Configured',
          className: 'status-error',
          icon: 'fa-circle-xmark'
        };
      case 'Not Authenticated':
        return {
          text: 'Not Authenticated',
          className: 'status-warning',
          icon: 'fa-circle-exclamation'
        };
      default:
        return {
          text: bot.status || 'Unknown',
          className: 'status-offline',
          icon: 'fa-circle-question'
        };
    }
  };

  // Helper function to get available actions for a bot
  const getBotActions = (bot) => {
    const isRunning = runningBots.has(bot.name);

    if (isRunning) {
      return [
        {
          type: 'manage',
          label: 'Manage',
          icon: 'fa-cog',
          className: 'btn-secondary',
          onClick: () => manageBot(bot)
        },
        {
          type: 'stop',
          label: 'Stop',
          icon: 'fa-stop',
          className: 'btn-warning',
          onClick: () => stopBot(bot)
        },
        {
          type: 'delete',
          label: 'Delete',
          icon: 'fa-trash',
          className: 'btn-danger',
          onClick: () => deleteBot(bot.name)
        }
      ];
    }

    const actions = [];

    if (bot.status !== 'Not Configured') {
      actions.push({
        type: 'start',
        label: bot.status === 'Ready' ? 'Start' : 'Login',
        icon: bot.status === 'Ready' ? 'fa-play' : 'fa-sign-in-alt',
        className: 'btn-primary',
        onClick: () => loginBot(bot)
      });
    }

    actions.push({
      type: 'delete',
      label: 'Delete',
      icon: 'fa-trash',
      className: 'btn-danger',
      onClick: () => deleteBot(bot.name)
    },
    {
      type: 'manage',
      label: 'Manage',
      icon: 'fa-cog',
      className: 'btn-secondary',
      onClick: () => manageBot(bot)
    });

    return actions;
  };

  // Show add bot modal
  const showAddBotModal = () => {
    setShowAddModal(true);
  };

  // Close add bot modal
  const closeAddBotModal = () => {
    setShowAddModal(false);
    setNewBot({
      name: "",
      description: "",
      allowedNumbers: ""
    });
    setError(null);
  };

  // Add new bot
  const addNewBot = async () => {
    if (!newBot.name.trim() || !newBot.allowedNumbers.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/bots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBot.name,
          description: newBot.description,
          allowedNumbers: newBot.allowedNumbers.split(',').map(n => n.trim()).filter(Boolean)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bot');
      }

      await fetchBots();
      closeAddBotModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete bot
  const deleteBot = async (name) => {
    if (!window.confirm(`Are you sure you want to delete bot "${name}"?`)) return;

    try {
      const response = await fetch(`${API_BASE}/bots/${name}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bot');
      }

      await fetchBots();
      await fetchRunningBots();
    } catch (err) {
      setError(err.message);
    }
  };

  // Login/Start bot with enhanced QR polling
  const loginBot = async (bot) => {
    setSelectedBot(bot);
    setQrData({ qr: null, status: 'starting' });
    setShowQRModal(true);
    setError(null);
    setLastQrHash(null);

    try {
      // Start the bot
      const response = await fetch(`${API_BASE}/bots/${bot.name}/run`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start bot');
      }

      await fetchRunningBots();

      // If bot was already authenticated
      if (bot.status === 'Ready') {
        setQrData({ qr: null, status: 'authenticated' });
        setTimeout(() => {
          setShowQRModal(false);
          fetchBots();
        }, 2000);
        return;
      }

      // Enhanced polling with more aggressive refresh
      let pollAttempts = 0;
      const maxAttempts = 60; // 2 minutes at 2-second intervals
      
      const interval = setInterval(async () => {
        pollAttempts++;
        
        const isComplete = await pollQrCode(bot.name);
        
        if (isComplete) {
          clearInterval(interval);
          setQrPollInterval(null);
          return;
        }
        
        if (pollAttempts >= maxAttempts) {
          clearInterval(interval);
          setQrPollInterval(null);
          setError('QR code timeout. Please try again.');
          setShowQRModal(false);
        }
      }, 2000); // Poll every 2 seconds

      setQrPollInterval(interval);

    } catch (err) {
      setError(err.message);
      setShowQRModal(false);
    }
  };

  // Stop bot
  const stopBot = async (bot) => {
    try {
      const response = await fetch(`${API_BASE}/bots/${bot.name}/stop`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to stop bot');
      }

      await fetchBots();
      await fetchRunningBots();
    } catch (err) {
      setError(err.message);
    }
  };

  // Close QR modal with cleanup
  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedBot(null);
    setQrData({ qr: null, status: 'unknown' });
    setLastQrHash(null);
    
    if (qrPollInterval) {
      clearInterval(qrPollInterval);
      setQrPollInterval(null);
    }
  };

  // Manage bot
  const manageBot = (bot) => {
    if (onManageBot) {
      onManageBot(bot);
    }
  };

  // Manual refresh QR code
  const refreshQrCode = async () => {
    if (!selectedBot) return;
    
    setQrData(prev => ({ ...prev, status: 'refreshing' }));
    setLastQrHash(null);
    
    // Force refresh by calling the API immediately
    await pollQrCode(selectedBot.name);
  };

  // Filter bots based on search term
  const filteredBots = bots.filter(bot =>
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bot.config?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page active">
        <div className="loading">Loading bots...</div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-robot"></i> Bot Management
          <span className="bot-count">
            {bots.length} total, {runningBots.size} running
          </span>
        </h1>
        <button className="btn btn-primary" onClick={showAddBotModal}>
          <i className="fas fa-plus"></i> Add New Bot
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button onClick={() => setError(null)} className="close-alert">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search bots..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button><i className="fas fa-search"></i></button>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Bot Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Running Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBots.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  {searchTerm ? 'No bots found matching your search.' : 'No bots found. Create your first bot to get started.'}
                </td>
              </tr>
            ) : (
              filteredBots.map(bot => {
                const displayStatus = getBotDisplayStatus(bot);
                const actions = getBotActions(bot);
                const isRunning = runningBots.has(bot.name);

                return (
                  <tr key={bot.name}>
                    <td>
                      <strong>{bot.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                        {bot.config?.allowedNumbers?.join(', ') || 'No numbers configured'}
                      </div>
                    </td>
                    <td>{bot.config?.description || 'No description'}</td>
                    <td>
                      <span className={`status-badge status-${bot.status?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}>
                        <i className="fas fa-circle"></i>
                        {bot.status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${displayStatus.className}`}>
                        <i className={`fas ${displayStatus.icon}`}></i>
                        {isRunning ? 'RUNNING' : 'STOPPED'}
                      </span>
                      {isRunning && bot.runtimeStatus && (
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                          {bot.runtimeStatus}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            className={`btn ${action.className}`}
                            onClick={action.onClick}
                            title={action.label}
                            disabled={action.disabled}
                          >
                            <i className={`fas ${action.icon}`}></i>
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Bot Modal */}
      {showAddModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Bot</h3>
              <button className="close-btn" onClick={closeAddBotModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Bot Name*</label>
                <input
                  type="text"
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  placeholder="Enter bot name (letters, numbers, _, - only)"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newBot.description}
                  onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
                  placeholder="Enter bot description"
                />
              </div>
              <div className="form-group">
                <label>Allowed Numbers*</label>
                <textarea
                  value={newBot.allowedNumbers}
                  onChange={(e) => setNewBot({ ...newBot, allowedNumbers: e.target.value })}
                  placeholder="Enter phone numbers separated by commas (e.g., +628123456789, +628987654321)"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeAddBotModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={addNewBot}>
                Add Bot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced QR Login Modal */}
      {showQRModal && selectedBot && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {qrData.status === 'starting' ? 'Starting Bot' : 'WhatsApp Login'} - {selectedBot.name}
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {qrData.qr && (
                  <button 
                    className="btn btn-sm btn-secondary" 
                    onClick={refreshQrCode}
                    title="Refresh QR Code"
                    disabled={qrData.status === 'refreshing'}
                  >
                    <i className={`fas fa-sync-alt ${qrData.status === 'refreshing' ? 'fa-spin' : ''}`}></i>
                  </button>
                )}
                <button className="close-btn" onClick={closeQRModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="qr-placeholder" style={{
                width: '200px',
                height: '200px',
                border: '2px dashed #ccc',
                margin: '20px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#666',
                position: 'relative'
              }}>
                {qrData.qr ? (
                  <>
                    {qrData.qr.startsWith("data:image") ? (
                      <img 
                        src={qrData.qr} 
                        alt="QR Code" 
                        style={{ width: '100%', height: '100%' }}
                        key={lastQrHash} // Force re-render when QR changes
                      />
                    ) : (
                      <QRCodeCanvas 
                        value={qrData.qr} 
                        size={200} 
                        key={lastQrHash} // Force re-render when QR changes
                      />
                    )}
                    {/* Auto-refresh indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                      animation: 'pulse 2s infinite'
                    }} title="Auto-refreshing QR code"></div>
                  </>
                ) : qrData.status === 'starting' ? (
                  <div>
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <div style={{ marginTop: '10px' }}>Starting bot...</div>
                  </div>
                ) : qrData.status === 'waiting' || qrData.status === 'refreshing' ? (
                  <div>
                    <i className={`fas fa-qrcode fa-2x ${qrData.status === 'refreshing' ? 'fa-pulse' : ''}`}></i>
                    <div style={{ marginTop: '10px' }}>
                      {qrData.status === 'refreshing' ? 'Refreshing QR Code...' : 'Generating QR Code...'}
                    </div>
                  </div>
                ) : qrData.status === 'authenticated' ? (
                  <div>
                    <i className="fas fa-check-circle fa-2x" style={{ color: 'green' }}></i>
                    <div style={{ marginTop: '10px', color: 'green' }}>Bot Started!</div>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-exclamation-triangle fa-2x" style={{ color: 'orange' }}></i>
                    <div style={{ marginTop: '10px' }}>QR Code not available</div>
                  </div>
                )}
              </div>
              
              <div className={`connection-status ${['authenticated', 'ready'].includes(qrData.status) ? 'connected' : 'disconnected'}`}>
                <i className={`fas ${['authenticated', 'ready'].includes(qrData.status) ? 'fa-check-circle' : 'fa-clock'}`}></i>
                {qrData.status === 'starting' ? ' Starting bot...' :
                  ['authenticated', 'ready'].includes(qrData.status) ? ' Connected!' :
                    qrData.status === 'waiting' ? ' Waiting for QR code...' :
                      qrData.status === 'refreshing' ? ' Refreshing QR code...' :
                        ' Waiting for connection...'}
              </div>
              
              {qrData.qr && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    Scan the QR code with WhatsApp on your phone
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#999' }}>
                    QR code auto-refreshes every 2 seconds
                  </p>
                </div>
              )}
              
              {['authenticated', 'ready'].includes(qrData.status) && (
                <p style={{ color: 'green', fontWeight: 'bold' }}>
                  Bot started successfully! This window will close automatically.
                </p>
              )}
              
              {qrData.status === 'error' && (
                <div style={{ color: 'red', marginTop: '1rem' }}>
                  <i className="fas fa-exclamation-circle"></i> Error loading QR code
                  <br />
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={refreshQrCode}
                    style={{ marginTop: '10px' }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .fa-pulse {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
}