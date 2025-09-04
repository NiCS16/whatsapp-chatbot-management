import React, { useState, useEffect } from "react";

export default function BotDashboard({ bot, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentBot, setCurrentBot] = useState(bot);
  const [loading, setLoading] = useState(false);
  
  // Prompt states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  
  // Analysis states
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Google Sheets states
  const [sheetsConfig, setSheetsConfig] = useState({
    spreadsheetId: '',
    sheetName: 'Sheet1',
    credentialsPath: './chatbotku-107559128562.json',
    configured: false
  });
  const [isUploadingSheets, setIsUploadingSheets] = useState(false);
  
  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    if (bot) {
      setCurrentBot(bot);
      fetchBotData();
    }
  }, [bot]);

  const fetchBotData = async () => {
    if (!currentBot?.name) return;
    
    try {
      // Fetch prompt
      await fetchPrompt();
      // Fetch analysis results
      await fetchAnalysisResults();
      // Fetch sheets config
      await fetchSheetsConfig();
    } catch (error) {
      console.error('Error fetching bot data:', error);
    }
  };

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/prompt`);
      if (response.ok) {
        const data = await response.json();
        setAiPrompt(data.prompt);
      } else {
        console.error('Failed to fetch prompt');
        setAiPrompt("Kamu adalah asisten AI yang ramah dan membantu melalui WhatsApp.");
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setAiPrompt("Kamu adalah asisten AI yang ramah dan membantu melalui WhatsApp.");
    }
  };

  const savePrompt = async () => {
    setIsSavingPrompt(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/prompt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      
      if (response.ok) {
        alert('Prompt berhasil disimpan!');
      } else {
        const errorData = await response.json();
        alert(`Gagal menyimpan prompt: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Gagal menyimpan prompt. Silakan coba lagi.');
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const fetchAnalysisResults = async () => {
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/analysis`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching analysis results:', error);
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Analisis selesai! Diproses ${data.result.processed} file baru.`);
        await fetchAnalysisResults(); // Refresh results
      } else {
        const errorData = await response.json();
        alert(`Gagal melakukan analisis: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('Gagal melakukan analisis. Silakan coba lagi.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const viewReport = async (phoneNumber) => {
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/analysis/${phoneNumber}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data);
      } else {
        alert('Gagal membuka laporan');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Gagal membuka laporan');
    }
  };

  const fetchSheetsConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/sheets`);
      if (response.ok) {
        const data = await response.json();
        setSheetsConfig(data);
      }
    } catch (error) {
      console.error('Error fetching sheets config:', error);
    }
  };

  const saveSheetsConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/sheets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetsConfig),
      });
      
      if (response.ok) {
        alert('Konfigurasi Google Sheets berhasil disimpan!');
        await fetchSheetsConfig();
      } else {
        const errorData = await response.json();
        alert(`Gagal menyimpan konfigurasi: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving sheets config:', error);
      alert('Gagal menyimpan konfigurasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const uploadToSheets = async () => {
    if (!sheetsConfig.spreadsheetId) {
      alert('Silakan konfigurasi Google Sheets terlebih dahulu');
      return;
    }

    setIsUploadingSheets(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/upload-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Upload berhasil! Data telah disimpan ke Google Sheets.`);
        if (data.spreadsheetUrl) {
          window.open(data.spreadsheetUrl, '_blank');
        }
      } else {
        const errorData = await response.json();
        alert(`Gagal upload: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error uploading to sheets:', error);
      alert('Gagal upload ke Google Sheets. Silakan coba lagi.');
    } finally {
      setIsUploadingSheets(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID') + ' ' + date.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
  };

  if (!currentBot) {
    return (
      <div className="page active">
        <div className="page-header">
          <h1 className="page-title">Bot tidak ditemukan</h1>
          <button className="btn btn-outline" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">    
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-robot"></i> {currentBot.name} Dashboard
        </h1>
        <button className="btn btn-outline" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Kembali ke Bot Management
        </button>
      </div>
      
      <div className="bot-tabs">
        <div 
          className={`bot-tab ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        <div 
          className={`bot-tab ${activeTab === 'prompt' ? 'active' : ''}`} 
          onClick={() => setActiveTab('prompt')}
        >
          AI Prompt
        </div>
        <div 
          className={`bot-tab ${activeTab === 'analysis' ? 'active' : ''}`} 
          onClick={() => setActiveTab('analysis')}
        >
          Analisis Chat
        </div>
        <div 
          className={`bot-tab ${activeTab === 'sheets' ? 'active' : ''}`} 
          onClick={() => setActiveTab('sheets')}
        >
          Google Sheets
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bot-tab-content" style={{padding: '20px'}}>
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-info-circle"></i> Informasi Bot</h3>
            </div>
            <div className="card-content">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                  <h4>Nama Bot</h4>
                  <p>{currentBot.name}</p>
                </div>
                <div>
                  <h4>Status</h4>
                  <p>
                    <span className={`badge badge-${currentBot.isRunning ? 'success' : 'secondary'}`}>
                      {currentBot.isRunning ? 'Berjalan' : 'Berhenti'}
                    </span>
                  </p>
                </div>
                <div>
                  <h4>Nomor yang Diizinkan</h4>
                  <p>{currentBot.config?.allowedNumbers?.join(', ') || 'Tidak ada'}</p>
                </div>
                <div>
                  <h4>Google Sheets</h4>
                  <p>
                    <span className={`badge badge-${currentBot.hasSheetsConfig ? 'success' : 'secondary'}`}>
                      {currentBot.hasSheetsConfig ? 'Dikonfigurasi' : 'Belum dikonfigurasi'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div style={{marginTop: '20px'}}>
                <h4>Deskripsi</h4>
                <p>{currentBot.config?.description || 'Tidak ada deskripsi'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Prompt Tab */}
      {activeTab === 'prompt' && (
        <div className="bot-tab-content" style={{padding: '20px'}}>
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-comment-alt"></i> Konfigurasi AI Prompt</h3>
            </div>
            <div className="card-content">
              <div className="prompt-editor">
                <label htmlFor="ai-prompt" style={{display: 'block', marginBottom: '10px', fontWeight: '500'}}>
                  Instruksi untuk asisten AI:
                </label>
                <textarea 
                  id="ai-prompt" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows="10"
                  style={{
                    width: '100%', 
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                  placeholder="Masukkan instruksi untuk AI di sini..."
                />
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{marginTop: '15px'}}
                onClick={savePrompt}
                disabled={isSavingPrompt}
              >
                <i className="fas fa-save"></i> 
                {isSavingPrompt ? ' Menyimpan...' : ' Simpan Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="bot-tab-content" style={{padding: '20px'}}>
          <div style={{display: 'grid', gridTemplateColumns: selectedReport ? '1fr 1fr' : '1fr', gap: '20px'}}>
            <div className="card">
              <div className="card-header">
                <h3><i className="fas fa-chart-bar"></i> Analisis Chat History</h3>
                <button 
                  className="btn btn-primary"
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                >
                  <i className="fas fa-sync-alt"></i>
                  {isAnalyzing ? ' Menganalisis...' : ' Mulai Analisis'}
                </button>
              </div>
              <div className="card-content">
                <p>Total laporan: {analysisResults.length}</p>
                
                <div style={{marginTop: '15px'}}>
                  {analysisResults.length === 0 ? (
                    <div style={{
                      textAlign: 'center', 
                      padding: '40px', 
                      color: '#666',
                      background: '#f8f9fa',
                      borderRadius: '6px'
                    }}>
                      <i className="fas fa-inbox" style={{fontSize: '2rem', marginBottom: '10px'}}></i>
                      <p>Belum ada hasil analisis</p>
                      <p>Klik "Mulai Analisis" untuk menganalisis chat history</p>
                    </div>
                  ) : (
                    <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                      {analysisResults.map((report, index) => (
                        <div 
                          key={index}
                          className="customer-item"
                          onClick={() => viewReport(report.phoneNumber)}
                          style={{cursor: 'pointer', marginBottom: '10px'}}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                              <h4>{report.phoneNumber}</h4>
                              <p style={{fontSize: '0.9rem', color: '#666'}}>
                                Dibuat: {formatDate(report.createdAt)}
                              </p>
                            </div>
                            <div>
                              <span className="badge badge-primary">
                                {(report.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                          <p style={{marginTop: '8px', fontSize: '0.9rem'}}>
                            {report.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Report Detail */}
            {selectedReport && (
              <div className="card">
                <div className="card-header">
                  <h3><i className="fas fa-file-alt"></i> Detail Laporan</h3>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="card-content">
                  <div style={{marginBottom: '15px'}}>
                    <h4>Nomor: {selectedReport.phoneNumber}</h4>
                    <p style={{color: '#666'}}>
                      Dibuat: {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                  
                  <div style={{
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '6px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {selectedReport.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Sheets Tab */}
      {activeTab === 'sheets' && (
        <div className="bot-tab-content" style={{padding: '20px'}}>
          <div className="card">
            <div className="card-header">
              <h3><i className="fab fa-google"></i> Konfigurasi Google Sheets</h3>
            </div>
            <div className="card-content">
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
                  Spreadsheet ID
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" 
                  value={sheetsConfig.spreadsheetId}
                  onChange={(e) => setSheetsConfig({...sheetsConfig, spreadsheetId: e.target.value})}
                />
                <small style={{color: '#666'}}>
                  Ambil dari URL Google Sheets: https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                </small>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
                    Nama Sheet
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={sheetsConfig.sheetName}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, sheetName: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
                    Credentials Path
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={sheetsConfig.credentialsPath}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, credentialsPath: e.target.value})}
                  />
                </div>
              </div>

              <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                <button 
                  className="btn btn-primary"
                  onClick={saveSheetsConfig}
                  disabled={loading}
                >
                  <i className="fas fa-save"></i>
                  {loading ? ' Menyimpan...' : ' Simpan Konfigurasi'}
                </button>
                
                <button 
                  className="btn btn-success"
                  onClick={uploadToSheets}
                  disabled={isUploadingSheets || !sheetsConfig.spreadsheetId}
                >
                  <i className="fas fa-upload"></i>
                  {isUploadingSheets ? ' Mengupload...' : ' Upload ke Sheets'}
                </button>
              </div>

              {sheetsConfig.configured && sheetsConfig.spreadsheetId && (
                <div style={{
                  background: '#d4edda',
                  border: '1px solid #c3e6cb',
                  color: '#155724',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  <i className="fas fa-check-circle"></i> Google Sheets telah dikonfigurasi
                  <br />
                  <a 
                    href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheetId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{color: '#155724'}}
                  >
                    <i className="fas fa-external-link-alt"></i> Buka Spreadsheet
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-info-circle"></i> Cara Penggunaan</h3>
            </div>
            <div className="card-content">
              <ol style={{paddingLeft: '20px'}}>
                <li>Buat Google Spreadsheet baru atau gunakan yang sudah ada</li>
                <li>Copy Spreadsheet ID dari URL</li>
                <li>Pastikan file credentials JSON ada di path yang benar</li>
                <li>Klik "Simpan Konfigurasi"</li>
                <li>Jalankan analisis chat terlebih dahulu</li>
                <li>Klik "Upload ke Sheets" untuk mengirim hasil analisis</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bot-tabs {
          display: flex;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 20px;
        }

        .bot-tab {
          padding: 12px 20px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .bot-tab:hover {
          background-color: #f8f9fa;
        }

        .bot-tab.active {
          border-bottom-color: #3182ce;
          color: #3182ce;
          background-color: #ebf8ff;
        }

        .customer-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .customer-item:hover {
          background: #e2e8f0;
          border-color: #cbd5e0;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          vertical-align: baseline;
          border-radius: 0.375rem;
        }

        .badge-success {
          color: #fff;
          background-color: #38a169;
        }

        .badge-secondary {
          color: #fff;
          background-color: #718096;
        }

        .badge-primary {
          color: #fff;
          background-color: #3182ce;
        }
      `}</style>
    </div>
  );
}