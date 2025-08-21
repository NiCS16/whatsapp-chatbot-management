import React, { useState, useEffect, useRef } from "react";

export default function BotDashboard({ bot, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use the passed bot data or fallback to default
  const [currentBot, setCurrentBot] = useState(
    bot || {
      id: 1,
      name: "Solahart Support",
      number: "+6281234567890",
      status: "online",
      purpose: "customer-support"
    }
  );
  
  // Update currentBot when bot prop changes
  useEffect(() => {
    if (bot) {
      setCurrentBot(bot);
    }
  }, [bot]);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      incoming: true,
      time: "10:00 AM"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  
  // Customer analysis states
  const [customers] = useState({
    budi: {
      name: "Budi Santoso",
      phone: "+628123456789",
      location: "Jakarta, Indonesia",
      lastChat: "2023-06-15T14:30:00Z",
      type: "prospect",
      sentiment: "positive",
      needs: "Water heater installation",
      status: "Active - Needs follow up",
      aiEnabled: true,
      interactions: [
        { date: "15 Jun 2023 14:30", status: "Completed", note: "Asked about product specifications" },
        { date: "14 Jun 2023 10:15", status: "Pending", note: "Requested price quotation" }
      ],
      action: "Send follow-up message with installation options and pricing"
    },
    anton: {
      name: "Anton Wijaya",
      phone: "+628987654321",
      location: "Bandung, Indonesia",
      lastChat: "2023-06-14T09:15:00Z",
      type: "customer",
      sentiment: "neutral",
      needs: "Product maintenance",
      status: "Waiting for response",
      aiEnabled: true,
      interactions: [
        { date: "12 Jun 2023 09:30", status: "Completed", note: "Reported maintenance issue" },
        { date: "10 Jun 2023 16:45", status: "Completed", note: "Initial inquiry" }
      ],
      action: "Schedule technician visit and send confirmation"
    },
    rusli: {
      name: "Rusli Abdullah",
      phone: "+628567891234",
      location: "Surabaya, Indonesia",
      lastChat: "2023-06-18T11:20:00Z",
      type: "prospect",
      sentiment: "negative",
      needs: "New product inquiry",
      status: "New lead",
      aiEnabled: false,
      interactions: [
        { date: "18 Jun 2023 11:20", status: "New", note: "Initial contact" }
      ],
      action: "Send product catalog and schedule demo"
    }
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState('budi');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [sortFilter, setSortFilter] = useState('latest');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  
  // Settings states
  const [botSettings, setBotSettings] = useState({
    name: currentBot.name || "Bot",
    number: currentBot.number || "",
    description: `Official WhatsApp bot for ${currentBot.name || "customer support"} and sales inquiries.`,
    timezone: "GMT+7",
    enableSheets: true,
    sheetsUrl: "",
    sheetsTab: "",
    sheetsRange: ""
  });
  
  const [aiPrompt, setAiPrompt] = useState("You are a helpful customer service assistant. Your role is to answer customer inquiries about our products, provide information, assist with troubleshooting, and guide customers through the purchasing process. Be polite, professional, and concise in your responses. If you don't know an answer, offer to connect the customer with a human representative.");
  const [temperature, setTemperature] = useState(0.7);
  
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    setBotSettings(prev => ({
      ...prev,
      name: currentBot.name || "Bot",
      number: currentBot.number || "",
      description: `Official WhatsApp bot for ${currentBot.name || "customer support"} and sales inquiries.`
    }));
  }, [currentBot]);

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Tab switching
  const switchTab = (tabId) => {
    console.log("Switching to tab:", tabId);
    setActiveTab(tabId);
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Chat functionality
  const sendTestMessage = () => {
    if (!chatInput.trim()) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const newMessage = {
      id: chatMessages.length + 1,
      text: chatInput,
      incoming: false,
      time: timeString
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your question. Let me check that for you.",
        "Thanks for your message! How can I assist you further?",
        "I can help with that. Here's what I found...",
        "That's a great question! Here's the information you requested."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      const aiResponse = {
        id: chatMessages.length + 2,
        text: randomResponse,
        incoming: true,
        time: responseTime
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Handle Enter key in chat input
  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendTestMessage();
    }
  };

  // Customer filtering and sorting
  const getFilteredCustomers = () => {
    let customerArray = Object.entries(customers).map(([id, customer]) => ({ id, ...customer }));
    
    // Apply filters
    if (typeFilter !== 'all') {
      customerArray = customerArray.filter(customer => customer.type === typeFilter);
    }
    
    if (sentimentFilter !== 'all') {
      customerArray = customerArray.filter(customer => customer.sentiment === sentimentFilter);
    }
    
    if (customerSearchTerm) {
      customerArray = customerArray.filter(customer => 
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
        customer.phone.includes(customerSearchTerm) ||
        customer.location.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortFilter === 'latest') {
      customerArray.sort((a, b) => new Date(b.lastChat) - new Date(a.lastChat));
    } else {
      customerArray.sort((a, b) => new Date(a.lastChat) - new Date(b.lastChat));
    }
    
    return customerArray;
  };

  // Customer selection
  const selectCustomer = (customerId) => {
    setSelectedCustomer(customerId);
  };

  // Toggle AI for customer
  const toggleCustomerAI = (customerId, event) => {
    event.stopPropagation();
    console.log(`Toggle AI for customer: ${customerId}`);
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const currentCustomer = customers[selectedCustomer];
  const filteredCustomers = getFilteredCustomers();

  return (
    <div className="page active">    
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-robot"></i> {currentBot.name} Dashboard
        </h1>
        <button className="btn btn-outline" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back to Bot Management
        </button>
      </div>
      
      <div className="bot-tabs">
        <div 
          className={`bot-tab ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => switchTab('overview')}
        >
          Overview
        </div>
        <div 
          className={`bot-tab ${activeTab === 'connection' ? 'active' : ''}`} 
          onClick={() => switchTab('connection')}
        >
          Connection
        </div>
        <div 
          className={`bot-tab ${activeTab === 'prompt' ? 'active' : ''}`} 
          onClick={() => switchTab('prompt')}
        >
          Prompt Settings
        </div>
        <div 
          className={`bot-tab ${activeTab === 'test-chat' ? 'active' : ''}`} 
          onClick={() => switchTab('test-chat')}
        >
          Test Chat
        </div>
        <div 
          className={`bot-tab ${activeTab === 'analysis' ? 'active' : ''}`} 
          onClick={() => switchTab('analysis')}
        >
          Analysis
        </div>
        <div 
          className={`bot-tab ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => switchTab('settings')}
        >
          Settings
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bot-tab-content" style={{padding: '10px'}}>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Conversations</h3>
              <div className="stat-number">1,245</div>
              <div className="stat-label">+12% from last week</div>
            </div>
            <div className="stat-card">
              <h3>Active Today</h3>
              <div className="stat-number">42</div>
              <div className="stat-label">+3 from yesterday</div>
            </div>
            <div className="stat-card">
              <h3>Response Rate</h3>
              <div className="stat-number">98%</div>
              <div className="stat-label">Industry average: 92%</div>
            </div>
            <div className="stat-card">
              <h3>Avg. Response Time</h3>
              <div className="stat-number">2.3s</div>
              <div className="stat-label">Faster than 95% of bots</div>
            </div>
          </div>
                  
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px'}}>
            <div className="card">
              <div className="card-header">
                <h3><i className="fas fa-chart-line"></i> Conversation Trends</h3>
              </div>
              <div className="card-content">
                <div style={{height: '250px', background: '#f8f9fa', border: '2px dashed #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d'}}>
                  Chart.js Integration Needed
                </div>
              </div>
            </div>
                      
            <div className="card">
              <div className="card-header">
                <h3><i className="fas fa-comment-dots"></i> Sentiment Analysis</h3>
              </div>
              <div className="card-content">
                <div style={{height: '250px', background: '#f8f9fa', border: '2px dashed #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d'}}>
                  Chart.js Integration Needed
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Connection Tab */}
      {activeTab === 'connection' && (
        <div className="bot-tab-content" style={{border: '2px solid blue', padding: '10px'}}>
          <div className="qr-container">
            <h3>Scan QR Code to Connect</h3>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/whatsapp-bot-connect" 
              alt="QR Code" 
            />
            <p>Scan this QR code with WhatsApp on your phone</p>
            <div className="connection-status connected">
              <i className="fas fa-check-circle"></i> Connected
            </div>
            <button className="btn btn-danger" style={{marginTop: '15px'}}>
              <i className="fas fa-power-off"></i> Disconnect
            </button>
          </div>
        </div>
      )}
      
      {/* Prompt Settings Tab */}
      {activeTab === 'prompt' && (
        <div className="bot-tab-content" style={{border: '2px solid blue', padding: '10px'}}>
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-comment-alt"></i> AI Prompt Configuration</h3>
            </div>
            <div className="card-content">
              <div className="prompt-editor">
                <label htmlFor="ai-prompt">Instructions for the AI assistant:</label>
                <textarea 
                  id="ai-prompt" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows="6"
                  style={{width: '100%', marginTop: '10px'}}
                />
              </div>
              
              <div className="temperature-control" style={{marginTop: '20px'}}>
                <label htmlFor="temperature">Response Creativity (Temperature): {temperature}</label>
                <input 
                  type="range" 
                  id="temperature" 
                  className="temperature-slider" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{width: '100%', marginTop: '10px'}}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}>
                  <span style={{color: '#718096'}}>Precise</span>
                  <span style={{color: '#718096'}}>Balanced</span>
                  <span style={{color: '#718096'}}>Creative</span>
                </div>
              </div>
              
              <button className="btn btn-primary" style={{marginTop: '15px'}}>
                <i className="fas fa-save"></i> Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Test Chat Tab */}
      {activeTab === 'test-chat' && (
        <div className="bot-tab-content" style={{border: '2px solid blue', padding: '10px'}}>
          <div className="chat-simulator">
            <div className="chat-header">
              <i className="fas fa-robot"></i>
              <span>Test Chat with {currentBot.name}</span>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {chatMessages.map(message => (
                <div key={message.id} className={`message message-${message.incoming ? 'incoming' : 'outgoing'}`}>
                  <div className={`message-bubble ${message.incoming ? 'incoming-bubble' : 'outgoing-bubble'}`}>
                    {message.text}
                  </div>
                  <span className="message-time">{message.time}</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
              />
              <button onClick={sendTestMessage}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="bot-tab-content" style={{border: '2px solid blue', padding: '10px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px'}}>
            {/* Customer List */}
            <div className="card">
              <div className="card-header">
                <h3><i className="fas fa-users"></i> Customer List</h3>
              </div>
              <div className="card-content">
                <div className="search-box">
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  />
                  <button><i className="fas fa-search"></i></button>
                </div>
                
                {/* Filter Controls */}
                <div style={{margin: '15px 0', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  <select 
                    className="form-control" 
                    style={{flex: 1, minWidth: '120px'}}
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <select 
                    className="form-control" 
                    style={{flex: 1, minWidth: '120px'}}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="prospect">Prospects</option>
                    <option value="customer">Customers</option>
                  </select>
                  <select 
                    className="form-control" 
                    style={{flex: 1, minWidth: '120px'}}
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                  >
                    <option value="all">All Sentiments</option>
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                
                <div className="customer-list" style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {filteredCustomers.map(customer => (
                    <div 
                      key={customer.id}
                      className={`customer-item ${selectedCustomer === customer.id ? 'active' : ''}`}
                      onClick={() => selectCustomer(customer.id)}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                          <h4>{customer.name}</h4>
                          <p>{customer.phone}</p>
                          <p><i className="fas fa-map-marker-alt"></i> {customer.location}</p>
                        </div>
                        <span className={`badge badge-${customer.type}`}>
                          {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                        </span>
                      </div>
                      <div className="customer-meta">
                        <span><i className="far fa-clock"></i> {formatDate(customer.lastChat)}</span>
                        <span className={`badge badge-${customer.sentiment}`}>
                          {customer.sentiment.charAt(0).toUpperCase() + customer.sentiment.slice(1)}
                        </span>
                      </div>
                      <div style={{marginTop: '10px', display: 'flex', justifyContent: 'space-between'}}>
                        <button 
                          className={`btn btn-sm ${customer.aiEnabled ? 'btn-primary' : 'btn-outline'}`}
                          onClick={(e) => toggleCustomerAI(customer.id, e)}
                        >
                          <i className="fas fa-robot"></i> AI {customer.aiEnabled ? 'On' : 'Off'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Analysis */}
            <div className="card">
              <div className="card-header">
                <h3><i className="fas fa-chart-pie"></i> Customer Analysis</h3>
              </div>
              <div className="card-content">
                {currentCustomer && (
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
                      <div style={{
                        width: '60px', 
                        height: '60px', 
                        backgroundColor: '#2d3748', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontSize: '1.5rem'
                      }}>
                        <span>{currentCustomer.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h2>{currentCustomer.name}</h2>
                        <p style={{color: '#718096'}}>{currentCustomer.phone}</p>
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                      <div className="info-card">
                        <h4><i className="fas fa-map-marker-alt"></i> Location</h4>
                        <p>{currentCustomer.location}</p>
                      </div>
                      <div className="info-card">
                        <h4><i className="fas fa-shopping-cart"></i> Needs</h4>
                        <p>{currentCustomer.needs}</p>
                      </div>
                      <div className="info-card">
                        <h4><i className="fas fa-comments"></i> Conversation Status</h4>
                        <p>{currentCustomer.status}</p>
                      </div>
                      <div className="info-card">
                        <h4><i className="fas fa-star"></i> Sentiment</h4>
                        <p>
                          {currentCustomer.sentiment} 
                          <span style={{color: currentCustomer.sentiment === 'positive' ? '#2e7d32' : currentCustomer.sentiment === 'negative' ? '#e53e3e' : '#d97706'}}>
                            {currentCustomer.sentiment === 'positive' ? ' 😊' : currentCustomer.sentiment === 'negative' ? ' 😞' : ' 😐'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="card" style={{marginBottom: '20px'}}>
                      <div className="card-header">
                        <h3><i className="fas fa-history"></i> Interaction History</h3>
                      </div>
                      <div className="card-content">
                        {currentCustomer.interactions.map((interaction, index) => (
                          <div key={index} className="interaction-item">
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                              <strong>{interaction.date}</strong>
                              <span className={`badge badge-${interaction.status === 'Completed' ? 'success' : interaction.status === 'Pending' ? 'warning' : 'secondary'}`}>
                                {interaction.status}
                              </span>
                            </div>
                            <p>{interaction.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <h3><i className="fas fa-lightbulb"></i> Recommended Action</h3>
                      </div>
                      <div className="card-content">
                        <p>{currentCustomer.action}</p>
                        <button className="btn btn-primary" style={{marginTop: '10px'}}>
                          <i className="fas fa-paper-plane"></i> Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bot-tab-content" style={{border: '2px solid blue', padding: '10px'}}>
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-cog"></i> Bot Configuration</h3>
            </div>
            <div className="card-content">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Bot Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={botSettings.name}
                    onChange={(e) => setBotSettings({...botSettings, name: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={botSettings.number}
                    onChange={(e) => setBotSettings({...botSettings, number: e.target.value})}
                  />
                </div>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Description</label>
                <textarea 
                  className="form-control" 
                  style={{width: '100%', minHeight: '100px'}}
                  value={botSettings.description}
                  onChange={(e) => setBotSettings({...botSettings, description: e.target.value})}
                />
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Timezone</label>
                <select 
                  className="form-control"
                  value={botSettings.timezone}
                  onChange={(e) => setBotSettings({...botSettings, timezone: e.target.value})}
                >
                  <option value="GMT+7">GMT+7 (Jakarta)</option>
                  <option value="GMT+8">GMT+8 (Singapore)</option>
                  <option value="GMT+0">GMT+0 (London)</option>
                </select>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Bot Avatar</label>
                <input type="file" className="form-control" />
              </div>

              <div style={{marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px'}}>
                <h3 style={{marginBottom: '15px'}}><i className="fab fa-google"></i> Google Sheets Integration</h3>
                
                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                    <input 
                      type="checkbox" 
                      checked={botSettings.enableSheets}
                      onChange={(e) => setBotSettings({...botSettings, enableSheets: e.target.checked})}
                    /> 
                    Enable Google Sheets Integration
                  </label>
                </div>
          
                {botSettings.enableSheets && (
                  <div style={{marginBottom: '15px'}}>
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Google Sheets URL</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="https://docs.google.com/spreadsheets/d/..." 
                        value={botSettings.sheetsUrl}
                        onChange={(e) => setBotSettings({...botSettings, sheetsUrl: e.target.value})}
                      />
                    </div>
                    
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Sheet Name/Tab</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., Customer Data" 
                        value={botSettings.sheetsTab}
                        onChange={(e) => setBotSettings({...botSettings, sheetsTab: e.target.value})}
                      />
                    </div>
                    
                    <div style={{marginBottom: '15px'}}>
                      <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Data Range</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., A1:E1000" 
                        value={botSettings.sheetsRange}
                        onChange={(e) => setBotSettings({...botSettings, sheetsRange: e.target.value})}
                      />
                    </div>
                    
                    <button className="btn btn-primary" style={{marginTop: '10px'}}>
                      <i className="fas fa-sync-alt"></i> Test Connection
                    </button>
                    
                    <button className="btn btn-secondary" style={{marginTop: '10px', marginLeft: '10px'}}>
                      <i className="fas fa-key"></i> Re-authenticate
                    </button>
                  </div>
                )}
              </div>
                  
              <button className="btn btn-primary">
                <i className="fas fa-save"></i> Save Settings
              </button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-exclamation-triangle" style={{color: '#e53e3e'}}></i> Danger Zone</h3>
            </div>
            <div className="card-content">
              <div style={{background: '#fff5f5', border: '1px solid #fed7d7', padding: '15px', borderRadius: '6px'}}>
                <h4 style={{color: '#e53e3e', marginBottom: '10px'}}>Delete This Bot</h4>
                <p style={{marginBottom: '15px', color: '#718096'}}>This action cannot be undone. All bot data will be permanently deleted.</p>
                <button className="btn btn-danger">
                  <i className="fas fa-trash"></i> Delete Bot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}