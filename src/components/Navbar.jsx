// components/Navbar.js
import React from 'react';

const Navbar = ({ activeTab, setActiveTab, showBotDashboard, selectedBot }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <i className="fas fa-robot"></i>
        <span>WhatsApp Bot Manager</span>
      </div>
      
      <div className="navbar-nav">
        <button 
          className={activeTab === 'management' ? 'nav-item active' : 'nav-item'}
          onClick={() => setActiveTab('management')}
        >
          <i className="fas fa-list"></i>
          <span>Bot Management</span>
        </button>
        
        {showBotDashboard && selectedBot && (
          <button className="nav-item active">
            <i className="fas fa-dashboard"></i>
            <span>{selectedBot.name} Dashboard</span>
          </button>
        )}
        
        <button 
          className={activeTab === 'analytics' ? 'nav-item active' : 'nav-item'}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-bar"></i>
          <span>Analytics</span>
        </button>
        
        <button 
          className={activeTab === 'models' ? 'nav-item active' : 'nav-item'}
          onClick={() => setActiveTab('models')}
        >
          <i className="fas fa-brain"></i>
          <span>Model Management</span>
        </button>
        
        <button 
          className={activeTab === 'settings' ? 'nav-item active' : 'nav-item'}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </button>
      </div>
      
      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #2d3748;
          color: white;
          padding: 0 1rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .navbar-nav {
          display: flex;
          gap: 0.5rem;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          color: #cbd5e0;
          text-decoration: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }
        
        .nav-item:hover {
          background: #4a5568;
          color: white;
        }
        
        .nav-item.active {
          background: #4299e1;
          color: white;
        }
        
        @media (max-width: 768px) {
          .navbar {
            padding: 0 0.5rem;
            height: 50px;
          }
          
          .navbar-brand span {
            display: none;
          }
          
          .nav-item span {
            display: none;
          }
          
          .nav-item {
            padding: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;