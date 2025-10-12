import React, { useState, useEffect } from "react";

export default function BotDashboard({ bot, onBack }) {
  const API_BASE = 'http://localhost:3001';

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

  // Admin number states
  const [adminConfig, setAdminConfig] = useState({
    adminNumber: '',
    allowedNumbers: [],
    updatedAt: null
  });
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [tempAdminNumber, setTempAdminNumber] = useState('');

  useEffect(() => {
    if (bot) {
      setCurrentBot(bot);
      fetchBotData();
    }
  }, [bot]);

  const fetchBotData = async () => {
    if (!currentBot?.name) return;

    try {
      await fetchPrompt();
      await fetchAnalysisResults();
      await fetchSheetsConfig();
      await fetchAdminConfig();
    } catch (error) {
      console.error('Error fetching bot data:', error);
    }
  };

  const clearSession = async () => {
    if (!currentBot?.name) return;
    if (!window.confirm(`Yakin ingin hapus session bot "${currentBot.name}"? Bot harus login ulang dengan QR baru.`)) return;
    try {
      const response = await fetch(`${API_BASE}/bots/clear-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botName: currentBot.name }),
      });
      const data = await response.json();
      if (data.success) alert(data.message);
      else alert(`Gagal clear session: ${data.message || data.error}`);
    } catch (err) {
      console.error('Error clear session:', err);
      alert('Terjadi kesalahan saat clear session');
    }
  };

  // ========== AI PROMPT ==========
  const fetchPrompt = async () => {
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/prompt`);
      if (response.ok) {
        const data = await response.json();
        setAiPrompt(data.prompt);
      } else {
        setAiPrompt("Kamu adalah asisten AI yang ramah dan membantu melalui WhatsApp.");
      }
    } catch {
      setAiPrompt("Kamu adalah asisten AI yang ramah dan membantu melalui WhatsApp.");
    }
  };

  const savePrompt = async () => {
    setIsSavingPrompt(true);
    try {
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/prompt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (response.ok) alert('Prompt berhasil disimpan!');
      else alert(`Gagal menyimpan prompt: ${data.error}`);
    } catch {
      alert('Gagal menyimpan prompt.');
    } finally {
      setIsSavingPrompt(false);
    }
  };

  // ========== ANALISIS ==========
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
      const response = await fetch(`${API_BASE}/bots/${currentBot.name}/analyze`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        alert(`Analisis selesai! Diproses ${data.result?.processed || 0} file baru.`);
        await fetchAnalysisResults();
      } else alert(`Gagal analisis: ${data.error}`);
    } catch {
      alert('Gagal melakukan analisis.');
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
      } else alert('Gagal membuka laporan');
    } catch {
      alert('Gagal membuka laporan');
    }
  };

  const reanalyzeReport = async (phoneNumber) => {
    if (!currentBot?.name) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/api/analyze-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botName: currentBot.name, phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Re-analyze selesai untuk ${phoneNumber}`);
        await fetchAnalysisResults();
        if (selectedReport?.phoneNumber === phoneNumber) await viewReport(phoneNumber);
      } else alert(`Gagal re-analyze: ${data.error}`);
    } catch {
      alert('Terjadi kesalahan saat re-analyze');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ========== GOOGLE SHEETS ==========
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetsConfig),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Konfigurasi Google Sheets disimpan!');
        await fetchSheetsConfig();
      } else alert(`Gagal: ${data.error}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadToSheets = async () => {
    if (!sheetsConfig.spreadsheetId) return alert('Isi Spreadsheet ID dahulu!');
    setIsUploadingSheets(true);
    try {
      const res = await fetch(`${API_BASE}/bots/${currentBot.name}/upload-sheets`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Upload berhasil!');
        if (data.spreadsheetUrl) window.open(data.spreadsheetUrl, '_blank');
      } else alert(`Gagal upload: ${data.error}`);
    } finally {
      setIsUploadingSheets(false);
    }
  };

  // ========== ADMIN ==========
  const fetchAdminConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/bots/${currentBot.name}/admin`);
      if (res.ok) {
        const data = await res.json();
        setAdminConfig(data);
        setTempAdminNumber(data.adminNumber);
      }
    } catch (e) {
      console.error('Error fetching admin config:', e);
    }
  };

  const saveAdminNumber = async () => {
    try {
      const res = await fetch(`${API_BASE}/bots/${currentBot.name}/admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNumber: tempAdminNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Nomor admin diperbarui!');
        setIsEditingAdmin(false);
        await fetchAdminConfig();
      } else alert(data.error || 'Gagal update');
    } catch {
      alert('Gagal update admin.');
    }
  };

  const resetAdminNumber = async () => {
    if (!window.confirm('Reset admin ke default?')) return;
    try {
      const res = await fetch(`${API_BASE}/bots/${currentBot.name}/admin`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert('Admin direset ke default');
        await fetchAdminConfig();
      } else alert(data.error);
    } catch {
      alert('Gagal reset admin.');
    }
  };

  const formatDate = (d) =>
    !d ? '-' : new Date(d).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // ========== RENDER ==========
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
        <h1 className="page-title"><i className="fas fa-robot"></i> {currentBot.name} Dashboard</h1>
        <button className="btn btn-outline" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Kembali ke Bot Management
        </button>
      </div>

      <div className="bot-tabs">
        {['overview','prompt','analysis','sheets','admin'].map(tab => (
          <div
            key={tab}
            className={`bot-tab ${activeTab===tab?'active':''}`}
            onClick={()=>setActiveTab(tab)}
          >
            {tab==='overview'?'Overview':tab==='prompt'?'AI Prompt':tab==='analysis'?'Analisis Chat':tab==='sheets'?'Google Sheets':'Admin Number'}
          </div>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab==='overview' && (
        <div className="bot-tab-content" style={{padding:'20px'}}>
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-info-circle"></i> Informasi Bot</h3></div>
            <div className="card-content">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                <div><h4>Nama Bot</h4><p>{currentBot.name}</p></div>
                <div><h4>Status</h4><p><span className={`badge badge-${currentBot.isRunning?'success':'secondary'}`}>{currentBot.isRunning?'Berjalan':'Berhenti'}</span></p></div>
                <div><h4>Nomor Login</h4><p>{currentBot.config?.allowedNumbers?.join(', ')||'-'}</p></div>
                <div><h4>Google Sheets</h4><p><span className={`badge badge-${currentBot.hasSheetsConfig?'success':'secondary'}`}>{currentBot.hasSheetsConfig?'Dikonfigurasi':'Belum dikonfigurasi'}</span></p></div>
              </div>
              <div style={{marginTop:'20px'}}><h4>Deskripsi</h4><p>{currentBot.config?.description||'-'}</p></div>
              <div style={{marginTop:'20px',display:'flex',gap:'10px'}}>
                <button className="btn btn-danger" onClick={clearSession}><i className="fas fa-trash-alt"></i> Clear Session (Logout)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI PROMPT */}
      {activeTab==='prompt' && (
        <div className="bot-tab-content" style={{padding:'20px'}}>
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-comment-alt"></i> Konfigurasi AI Prompt</h3></div>
            <div className="card-content">
              <label style={{display:'block',marginBottom:'10px',fontWeight:'500'}}>Instruksi untuk AI:</label>
              <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} rows="10" style={{width:'100%',padding:'15px',border:'1px solid #ddd',borderRadius:'6px',fontSize:'14px',fontFamily:'monospace'}} placeholder="Masukkan instruksi untuk AI di sini..."/>
              <button className="btn btn-primary" style={{marginTop:'15px'}} onClick={savePrompt} disabled={isSavingPrompt}><i className="fas fa-save"></i>{isSavingPrompt?' Menyimpan...':' Simpan Prompt'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ANALYSIS */}
      {activeTab==='analysis' && (
        <div className="bot-tab-content" style={{padding:'20px'}}>
          <div style={{display:'grid',gridTemplateColumns:selectedReport?'1fr 1fr':'1fr',gap:'20px'}}>
            <div className="card">
              <div className="card-header"><h3><i className="fas fa-chart-bar"></i> Analisis Chat History</h3>
                <button className="btn btn-primary" onClick={startAnalysis} disabled={isAnalyzing}><i className="fas fa-sync-alt"></i>{isAnalyzing?' Menganalisis...':' Mulai Analisis'}</button>
              </div>
              <div className="card-content">
                <p>Total laporan: {analysisResults.length}</p>
                <div style={{marginTop:'15px'}}>
                  {analysisResults.length===0?(
                    <div style={{textAlign:'center',padding:'40px',color:'#666',background:'#f8f9fa',borderRadius:'6px'}}>
                      <i className="fas fa-inbox" style={{fontSize:'2rem',marginBottom:'10px'}}></i>
                      <p>Belum ada hasil analisis</p><p>Klik "Mulai Analisis" untuk memulai</p>
                    </div>
                  ):(
                    <div style={{maxHeight:'400px',overflowY:'auto'}}>
                      {analysisResults.map((report,index)=>(
                        <div key={index} className="customer-item" style={{marginBottom:'10px'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div onClick={()=>viewReport(report.phoneNumber)} style={{cursor:'pointer'}}>
                              <h4>{report.phoneNumber}</h4>
                              <p style={{fontSize:'0.9rem',color:'#666'}}>Dibuat: {formatDate(report.createdAt)}</p>
                            </div>
                            <div style={{display:'flex',gap:'10px'}}>
                              <button className="btn btn-sm btn-outline" onClick={()=>reanalyzeReport(report.phoneNumber)} disabled={isAnalyzing}><i className="fas fa-sync-alt"></i> Re-analyze</button>
                              <span className="badge badge-primary">{(report.size/1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                          <p style={{marginTop:'8px',fontSize:'0.9rem'}}>{report.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selectedReport&&(
              <div className="card">
                <div className="card-header"><h3><i className="fas fa-file-alt"></i> Detail Laporan</h3>
                  <button className="btn btn-outline" onClick={()=>setSelectedReport(null)}><i className="fas fa-times"></i></button>
                </div>
                <div className="card-content">
                  <h4>Nomor: {selectedReport.phoneNumber}</h4><p style={{color:'#666'}}>Dibuat: {formatDate(selectedReport.createdAt)}</p>
                  <div style={{background:'#f8f9fa',padding:'15px',borderRadius:'6px',maxHeight:'400px',overflowY:'auto',whiteSpace:'pre-wrap',fontSize:'0.9rem'}}>{selectedReport.content}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE SHEETS */}
      {activeTab==='sheets' && (
        <div className="bot-tab-content" style={{padding:'20px'}}>
          <div className="card">
            <div className="card-header"><h3><i className="fab fa-google"></i> Konfigurasi Google Sheets</h3></div>
            <div className="card-content">
              <label>Spreadsheet ID</label>
              <input type="text" className="form-control" value={sheetsConfig.spreadsheetId} onChange={e=>setSheetsConfig({...sheetsConfig,spreadsheetId:e.target.value})}/>
              <label>Nama Sheet</label>
              <input type="text" className="form-control" value={sheetsConfig.sheetName} onChange={e=>setSheetsConfig({...sheetsConfig,sheetName:e.target.value})}/>
              <label>Credentials Path</label>
              <input type="text" className="form-control" value={sheetsConfig.credentialsPath} onChange={e=>setSheetsConfig({...sheetsConfig,credentialsPath:e.target.value})}/>
              <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
                <button className="btn btn-primary" onClick={saveSheetsConfig} disabled={loading}>{loading?'Menyimpan...':'Simpan'}</button>
                <button className="btn btn-success" onClick={uploadToSheets} disabled={isUploadingSheets}>{isUploadingSheets?'Mengupload...':'Upload ke Sheets'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN */}
      {activeTab==='admin' && (
        <div className="bot-tab-content" style={{padding:'20px'}}>
          <div className="card">
            <div className="card-header"><h3><i className="fas fa-user-shield"></i> Konfigurasi Admin Number</h3></div>
            <div className="card-content">
              <p><b>Nomor Admin:</b> {adminConfig.adminNumber||'-'}</p>
              <p><b>Terakhir Update:</b> {formatDate(adminConfig.updatedAt)}</p>
              {!isEditingAdmin?(
                <div style={{display:'flex',gap:'10px'}}>
                  <button className="btn btn-primary" onClick={()=>setIsEditingAdmin(true)}>Edit</button>
                  <button className="btn btn-danger" onClick={resetAdminNumber}>Reset</button>
                </div>
              ):(
                <div>
                  <input className="form-control" value={tempAdminNumber} onChange={e=>setTempAdminNumber(e.target.value)} placeholder="Masukkan nomor admin"/>
                  <button className="btn btn-success" onClick={saveAdminNumber} style={{marginRight:'10px'}}>Simpan</button>
                  <button className="btn btn-outline" onClick={()=>setIsEditingAdmin(false)}>Batal</button>
                </div>
              )}
              <div style={{marginTop:'20px'}}>
                <h4>Nomor Diperbolehkan:</h4>
                <ul>{adminConfig.allowedNumbers.map(n=><li key={n}>{n}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-danger{background:#e53e3e;color:#fff;border:none;}
        .bot-tabs{display:flex;border-bottom:2px solid #e2e8f0;margin-bottom:20px;}
        .bot-tab{padding:12px 20px;cursor:pointer;border-bottom:3px solid transparent;transition:all .3s;font-weight:500;}
        .bot-tab:hover{background-color:#f8f9fa;}
        .bot-tab.active{border-bottom-color:#3182ce;color:#3182ce;background-color:#ebf8ff;}
        .customer-item{background:#f8f9fa;padding:15px;border-radius:6px;border:1px solid #e2e8f0;transition:all .2s;}
        .customer-item:hover{background:#e2e8f0;border-color:#cbd5e0;}
        .badge{display:inline-block;padding:4px 8px;font-size:.75rem;font-weight:600;line-height:1;text-align:center;border-radius:.375rem;}
        .badge-success{color:#fff;background-color:#38a169;}
        .badge-secondary{color:#fff;background-color:#718096;}
        .badge-primary{color:#fff;background-color:#3182ce;}
      `}</style>
    </div>
  );
}
