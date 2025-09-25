import React, { useState } from "react";
import Navbar from "./components/Navbar";
import BotManagement from "./pages/BotManagement";
import BotDashboard from "./pages/BotDashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ModelManagement from "./pages/ModelManagement";

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('management');
  const [selectedBot, setSelectedBot] = useState(null);

  // Navigation handlers
  const handleBotManage = (bot) => {
    console.log("Managing bot:", bot.name);
    setSelectedBot(bot);
    setActiveTab('bot-dashboard');
  };

  const handleBackToBots = () => {
    setSelectedBot(null);
    setActiveTab('management');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Jika berpindah dari bot dashboard, reset selected bot
    if (tab !== 'bot-dashboard') {
      setSelectedBot(null);
    }
  };

  const renderContent = () => {
    console.log("Rendering content for tab:", activeTab);
    
    switch(activeTab) {
      case 'management':
        return <BotManagement onManageBot={handleBotManage} />;
      
      case 'bot-dashboard':
        return selectedBot ? (
          <BotDashboard bot={selectedBot} onBack={handleBackToBots} />
        ) : (
          <div className="page active">
            <div className="error-page">
              <i className="fas fa-robot fa-3x" style={{color: '#ccc', marginBottom: '1rem'}}></i>
              <h2>No Bot Selected</h2>
              <p>Please select a bot from the management page to view its dashboard.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setActiveTab('management')}
              >
                <i className="fas fa-arrow-left"></i> Back to Bot Management
              </button>
            </div>
          </div>
        );
      
      case 'analytics':
        return <Analytics />;
      
      case 'models':
        return <ModelManagement />;
      
      case 'settings':
        return <Settings />;
      
      default:
        return <BotManagement onManageBot={handleBotManage} />;
    }
  };

  return (
    <div className="App">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        showBotDashboard={activeTab === 'bot-dashboard'}
        selectedBot={selectedBot}
      />
      <div className="container">
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
      
      <style jsx>{`
        .App {
          min-height: 100vh;
          background: #f5f5f5;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }
        
        .main-content {
          padding-top: 80px; /* Account for fixed navbar */
          min-height: calc(100vh - 80px);
        }
        
        .error-page {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin: 2rem 0;
        }
        
        .error-page h2 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .error-page p {
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0 10px;
          }
          
          .main-content {
            padding-top: 70px;
          }
        }
      `}</style>
      
      {/* Global Styles */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f5f5f5;
          color: #333;
        }
        
        /* Button Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          background: #e2e8f0;
          color: #4a5568;
        }
        
        .btn:hover {
          background: #cbd5e0;
          transform: translateY(-1px);
        }
        
        .btn-primary {
          background: #4299e1;
          color: white;
        }
        
        .btn-primary:hover {
          background: #3182ce;
        }
        
        .btn-secondary {
          background: #718096;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #4a5568;
        }
        
        .btn-success {
          background: #48bb78;
          color: white;
        }
        
        .btn-success:hover {
          background: #38a169;
        }
        
        .btn-warning {
          background: #ed8936;
          color: white;
        }
        
        .btn-warning:hover {
          background: #dd6b20;
        }
        
        .btn-danger {
          background: #f56565;
          color: white;
        }
        
        .btn-danger:hover {
          background: #e53e3e;
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }
        
        /* Page Styles */
        .page {
          display: none;
        }
        
        .page.active {
          display: block;
          animation: fadeIn 0.3s ease;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .page-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .bot-count {
          font-size: 1rem;
          background: #e2e8f0;
          color: #4a5568;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          margin-left: 1rem;
        }
        
        /* Table Styles */
        .table-responsive {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .table th {
          background: #f7fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .table tr:hover {
          background: #f7fafc;
        }
        
        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .status-running {
          background: #c6f6d5;
          color: #276749;
        }
        
        .status-ready {
          background: #bee3f8;
          color: #2c5aa0;
        }
        
        .status-warning {
          background: #fefcbf;
          color: #744210;
        }
        
        .status-error {
          background: #fed7d7;
          color: #c53030;
        }
        
        .status-offline {
          background: #e2e8f0;
          color: #4a5568;
        }
        
        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        /* Search Box */
        .search-box {
          display: flex;
          margin-bottom: 1rem;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .search-box input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          outline: none;
          font-size: 0.9rem;
        }
        
        .search-box button {
          padding: 0.75rem 1rem;
          background: #4299e1;
          color: white;
          border: none;
          cursor: pointer;
        }
        
        /* Alert Styles */
        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .alert-error {
          background: #fed7d7;
          color: #c53030;
          border: 1px solid #feb2b2;
        }
        
        .close-alert {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0.25rem;
        }
        
        /* Modal Styles */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: auto;
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #2d3748;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #718096;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        /* Form Styles */
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
        
        /* Card Styles */
        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }
        
        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .card-header h3 {
          margin: 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .card-body {
          padding: 1.5rem;
        }
        
        /* Loading */
        .loading {
          text-align: center;
          padding: 2rem;
          color: #718096;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .page-title {
            font-size: 1.5rem;
          }
          
          .action-buttons {
            flex-wrap: wrap;
          }
          
          .table th,
          .table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }
          
          .modal-content {
            width: 95%;
            margin: 1rem;
          }
        }
        
        /* QR Code Styles */
        .qr-placeholder {
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7fafc;
        }
        
        .connection-status {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 4px;
          text-align: center;
          font-weight: 500;
        }
        
        .connection-status.connected {
          background: #c6f6d5;
          color: #276749;
        }
        
        .connection-status.disconnected {
          background: #fed7d7;
          color: #c53030;
        }
        
        /* Code styling */
        code {
          background: #f7fafc;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
}

export default App;