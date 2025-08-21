import React, { useState } from "react";

export default function Navbar({ activeTab, setActiveTab, showBotDashboard = false }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (e, tab) => {
    e.preventDefault();
    
    setActiveTab(tab);
    closeMobileMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <i className="fas fa-robot"></i>
          WhatsApp Bot Manager
        </div>

        <button 
          className="navbar-toggler" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          <i className="fas fa-bars"></i>
        </button>

        <div className={`navbar-nav ${isMobileMenuOpen ? 'show' : ''}`}>
          <a 
            href="#management"
            className={`nav-link ${(activeTab === 'management' || activeTab === 'bot-dashboard') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'management')}
          >
            <i className="fas fa-robot"></i>
            Bot Management
          </a>
          
          <a 
            href="#analytics"
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'analytics')}
          >
            <i className="fas fa-chart-bar"></i>
            Analytics
          </a>
          
          <a 
            href="#settings"
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'settings')}
          >
            <i className="fas fa-cog"></i>
            Settings
          </a>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'block'
          }}
        />
      )}
    </nav>
  );
}