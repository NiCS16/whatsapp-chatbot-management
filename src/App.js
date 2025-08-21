import React, { useState } from "react";
import Navbar from "./components/Navbar";
import BotManagement from "./pages/BotManagement";
import BotDashboard from "./pages/BotDashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

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

  const renderContent = () => {
    console.log("Rendering content for tab:", activeTab);
    
    switch(activeTab) {
      case 'management':
        return <BotManagement onManageBot={handleBotManage} />;
      case 'bot-dashboard':
        return selectedBot ? (
          <BotDashboard bot={selectedBot} onBack={handleBackToBots} />
        ) : (
          <div>No bot selected. <button onClick={() => setActiveTab('management')}>Go back</button></div>
        );
      case 'analytics':
        return <Analytics />;
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
        setActiveTab={setActiveTab}
        showBotDashboard={activeTab === 'bot-dashboard'}
      />
      <div className="container">
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;