import React, { useState, useEffect } from "react";

export default function BotManagement({ onManageBot }) {  // Accept the prop
  const [bots, setBots] = useState([
    {
      id: 1,
      name: "Solahart Support",
      number: "+6281234567890",
      status: "online",
      lastActive: "2023-06-15T14:30:00Z",
      purpose: "customer-support"
    },
    {
      id: 2,
      name: "Ubin Kayu Sales",
      number: "+6289876543210",
      status: "offline",
      lastActive: "2023-06-14T09:15:00Z",
      purpose: "sales"
    },
    {
      id: 3,
      name: "Marketing Promo",
      number: "+6281122334455",
      status: "online",
      lastActive: "2023-06-15T10:45:00Z",
      purpose: "marketing"
    },
    {
      id: 4,
      name: "Internal HR Bot",
      number: "+6285566778899",
      status: "offline",
      lastActive: "2023-06-12T16:20:00Z",
      purpose: "internal"
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [qrConnectionStatus, setQrConnectionStatus] = useState('waiting');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newBot, setNewBot] = useState({
    name: "",
    number: "",
    purpose: "customer-support"
  });

  // Filter bots based on search
  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.number.includes(searchTerm) ||
    bot.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const botsPerPage = 10;
  const totalPages = Math.ceil(filteredBots.length / botsPerPage);
  const startIndex = (currentPage - 1) * botsPerPage;
  const currentBots = filteredBots.slice(startIndex, startIndex + botsPerPage);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Show add bot modal
  const showAddBotModal = () => {
    setShowAddModal(true);
  };

  // Close add bot modal
  const closeAddBotModal = () => {
    setShowAddModal(false);
    setNewBot({ name: "", number: "", purpose: "customer-support" });
  };

  // Add new bot
  const addNewBot = () => {
    if (!newBot.name.trim() || !newBot.number.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const botToAdd = {
      id: Math.max(...bots.map(b => b.id)) + 1,
      name: newBot.name,
      number: newBot.number,
      status: 'offline',
      lastActive: new Date().toISOString(),
      purpose: newBot.purpose
    };

    setBots([...bots, botToAdd]);
    closeAddBotModal();
  };

  // Login bot (show QR modal)
  const loginBot = (bot) => {
    setSelectedBot(bot);
    setQrConnectionStatus('waiting');
    setShowQRModal(true);

    // Simulate connection after 3 seconds
    setTimeout(() => {
      setQrConnectionStatus('connected');
      
      // Update bot status
      setBots(prevBots => 
        prevBots.map(b => 
          b.id === bot.id 
            ? { ...b, status: 'online', lastActive: new Date().toISOString() }
            : b
        )
      );
    }, 3000);
  };

  // Close QR modal
  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedBot(null);
  };

  // Manage bot
  const manageBot = (bot) => {
    console.log("Manage button clicked for:", bot.name);
    if (onManageBot) {
        onManageBot(bot);
    } else {
        console.error("onManageBot prop is not provided!");
    }
    };

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="page active">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-robot"></i> Bot Management
        </h1>
        <button className="btn btn-primary" onClick={showAddBotModal}>
          <i className="fas fa-plus"></i> Add New Bot
        </button>
      </div>
      
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
              <th>Phone Number</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBots.map(bot => (
              <tr key={bot.id}>
                <td>
                  <strong>{bot.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    {bot.purpose.replace('-', ' ')}
                  </div>
                </td>
                <td>{bot.number}</td>
                <td>
                  <span className={`status-badge ${bot.status === 'online' ? 'status-online' : 'status-offline'}`}>
                    <i className={`fas ${bot.status === 'online' ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i> 
                    {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                  </span>
                </td>
                <td>{formatDate(bot.lastActive)}</td>
                <td>
                  {bot.status === 'online' ? (
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => manageBot(bot)}
                    >
                      <i className="fas fa-cog"></i> Manage
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => loginBot(bot)}
                    >
                      <i className="fas fa-sign-in-alt"></i> Login
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="pagination">
        <button 
          className="btn btn-outline" 
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const page = i + 1;
          return (
            <button 
              key={page}
              className={`btn ${currentPage === page ? 'btn-outline active' : 'btn-outline'}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          );
        })}
        
        <button 
          className="btn btn-outline" 
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
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
                <label>Bot Name</label>
                <input 
                  type="text" 
                  value={newBot.name}
                  onChange={(e) => setNewBot({...newBot, name: e.target.value})}
                  placeholder="Enter bot name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={newBot.number}
                  onChange={(e) => setNewBot({...newBot, number: e.target.value})}
                  placeholder="e.g., +628123456789"
                />
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <select 
                  value={newBot.purpose}
                  onChange={(e) => setNewBot({...newBot, purpose: e.target.value})}
                >
                  <option value="customer-support">Customer Support</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="internal">Internal</option>
                </select>
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

      {/* QR Login Modal */}
      {showQRModal && selectedBot && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>WhatsApp Login</h3>
              <button className="close-btn" onClick={closeQRModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <h4>Connecting: {selectedBot.name}</h4>
              <div className="qr-placeholder" style={{ 
                width: '200px', 
                height: '200px', 
                border: '2px dashed #ccc', 
                margin: '20px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#666'
              }}>
                QR Code Here
              </div>
              <div className={`connection-status ${qrConnectionStatus === 'connected' ? 'connected' : 'disconnected'}`}>
                <i className={`fas ${qrConnectionStatus === 'connected' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                {qrConnectionStatus === 'connected' ? ' Connected!' : ' Waiting for connection...'}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Scan the QR code with WhatsApp on your phone
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}