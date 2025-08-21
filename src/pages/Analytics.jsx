import React, { useState, useEffect } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedBot, setSelectedBot] = useState('all');
  
  // Mock data for demonstration
  const [analyticsData, setAnalyticsData] = useState({
    totalMessages: 2847,
    responseRate: 98.5,
    avgResponseTime: 1.2,
    activeUsers: 342,
    messagesByDay: [245, 312, 189, 267, 398, 445, 321],
    botPerformance: {
      'Solahart Support': { messages: 1547, responseRate: 99.2, avgTime: 0.8 },
      'Ubin Kayu Sales': { messages: 1300, responseRate: 97.8, avgTime: 1.6 }
    }
  });

  const bots = ['all', 'Solahart Support', 'Ubin Kayu Sales'];

  // Create simple ASCII-style charts (since we can't use external chart libraries easily)
  const createBarChart = (data, maxHeight = 100) => {
    const max = Math.max(...data);
    return data.map((value, index) => {
      const height = (value / max) * maxHeight;
      return (
        <div key={index} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          flex: 1,
          margin: '0 2px'
        }}>
          <div style={{ 
            fontSize: '11px', 
            marginBottom: '5px',
            color: '#666'
          }}>
            {value}
          </div>
          <div style={{ 
            backgroundColor: '#4F46E5', 
            width: '20px', 
            height: `${height}px`,
            borderRadius: '2px 2px 0 0',
            transition: 'all 0.3s ease'
          }}></div>
          <div style={{ 
            fontSize: '10px', 
            marginTop: '5px',
            color: '#888'
          }}>
            Day {index + 1}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="page active">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-chart-line"></i> Analytics
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <select 
            value={selectedBot} 
            onChange={(e) => setSelectedBot(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            {bots.map(bot => (
              <option key={bot} value={bot}>
                {bot === 'all' ? 'All Bots' : bot}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4F46E5' }}>
              {analyticsData.totalMessages.toLocaleString()}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>
              <i className="fas fa-comments"></i> Total Messages
            </div>
            <div style={{ fontSize: '0.8rem', color: '#22C55E', marginTop: '5px' }}>
              ↑ 12% from last period
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22C55E' }}>
              {analyticsData.responseRate}%
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>
              <i className="fas fa-check-circle"></i> Response Rate
            </div>
            <div style={{ fontSize: '0.8rem', color: '#22C55E', marginTop: '5px' }}>
              ↑ 2.3% from last period
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>
              {analyticsData.avgResponseTime}s
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>
              <i className="fas fa-clock"></i> Avg Response Time
            </div>
            <div style={{ fontSize: '0.8rem', color: '#22C55E', marginTop: '5px' }}>
              ↓ 0.3s faster
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B5CF6' }}>
              {analyticsData.activeUsers}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>
              <i className="fas fa-users"></i> Active Users
            </div>
            <div style={{ fontSize: '0.8rem', color: '#22C55E', marginTop: '5px' }}>
              ↑ 8% from last period
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3><i className="fas fa-chart-bar"></i> Messages Over Time</h3>
          </div>
          <div className="card-content">
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              height: '200px', 
              padding: '20px',
              backgroundColor: '#F8F9FA',
              borderRadius: '8px'
            }}>
              {createBarChart(analyticsData.messagesByDay)}
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3><i className="fas fa-robot"></i> Bot Performance</h3>
          </div>
          <div className="card-content">
            {Object.entries(analyticsData.botPerformance).map(([botName, data]) => (
              <div key={botName} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>{botName}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                  <div>
                    <strong>{data.messages}</strong>
                    <div style={{ color: '#666' }}>Messages</div>
                  </div>
                  <div>
                    <strong>{data.responseRate}%</strong>
                    <div style={{ color: '#666' }}>Response Rate</div>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <strong>{data.avgTime}s</strong>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>Avg Response Time</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Message Types Analysis */}
      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-pie-chart"></i> Message Types Distribution</h3>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: '#4F46E5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 10px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                65%
              </div>
              <div style={{ fontWeight: 'bold' }}>Text Messages</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Most common</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: '#22C55E', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 10px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                20%
              </div>
              <div style={{ fontWeight: 'bold' }}>Images</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Visual content</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: '#F59E0B', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 10px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                10%
              </div>
              <div style={{ fontWeight: 'bold' }}>Documents</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Files & PDFs</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: '#8B5CF6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 10px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                5%
              </div>
              <div style={{ fontWeight: 'bold' }}>Audio</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Voice messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}