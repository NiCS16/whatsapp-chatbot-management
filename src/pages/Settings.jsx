import React, { useState } from "react";

export default function Settings() {
  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    timezone: 'GMT+8'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    frequency: 'daily'
  });

  // API settings state
  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk_test_1234567890abcdef',
    webhookUrl: ''
  });

  // Loading states
  const [loading, setLoading] = useState({
    account: false,
    notifications: false,
    api: false
  });

  // Success messages
  const [successMessages, setSuccessMessages] = useState({});

  // Handle account settings change
  const handleAccountChange = (field, value) => {
    setAccountSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle notification settings change
  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle API settings change
  const handleApiChange = (field, value) => {
    setApiSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save functions with loading states
  const saveAccountSettings = async () => {
    setLoading(prev => ({ ...prev, account: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessages(prev => ({ ...prev, account: 'Account settings saved successfully!' }));
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, account: '' }));
      }, 3000);
    } catch (error) {
      console.error('Error saving account settings:', error);
    } finally {
      setLoading(prev => ({ ...prev, account: false }));
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessages(prev => ({ ...prev, notifications: 'Notification settings saved successfully!' }));
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, notifications: '' }));
      }, 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  const saveApiSettings = async () => {
    setLoading(prev => ({ ...prev, api: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessages(prev => ({ ...prev, api: 'API settings saved successfully!' }));
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, api: '' }));
      }, 3000);
    } catch (error) {
      console.error('Error saving API settings:', error);
    } finally {
      setLoading(prev => ({ ...prev, api: false }));
    }
  };

  // Copy API key to clipboard
  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiSettings.apiKey);
      setSuccessMessages(prev => ({ ...prev, copy: 'API key copied to clipboard!' }));
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, copy: '' }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
    }
  };

  // Generate new API key
  const regenerateApiKey = () => {
    const newKey = 'sk_test_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiSettings(prev => ({ ...prev, apiKey: newKey }));
    setSuccessMessages(prev => ({ ...prev, regenerate: 'New API key generated!' }));
    setTimeout(() => {
      setSuccessMessages(prev => ({ ...prev, regenerate: '' }));
    }, 2000);
  };

  return (
    <div id="settings" className="page active">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-cog"></i> Settings
        </h1>
      </div>
      
      {/* Account Settings */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3><i className="fas fa-user"></i> Account Settings</h3>
        </div>
        <div className="card-content">
          {successMessages.account && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#D1FAE5', 
              color: '#065F46', 
              borderRadius: '6px', 
              marginBottom: '15px',
              border: '1px solid #A7F3D0'
            }}>
              <i className="fas fa-check-circle"></i> {successMessages.account}
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="account-name" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Name</label>
              <input 
                type="text" 
                id="account-name" 
                className="form-control" 
                value={accountSettings.name}
                onChange={(e) => handleAccountChange('name', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="account-email" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
              <input 
                type="email" 
                id="account-email" 
                className="form-control" 
                value={accountSettings.email}
                onChange={(e) => handleAccountChange('email', e.target.value)}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="account-timezone" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Timezone</label>
            <select 
              id="account-timezone" 
              className="form-control" 
              value={accountSettings.timezone}
              onChange={(e) => handleAccountChange('timezone', e.target.value)}
            >
              <option value="GMT+7">GMT+7 (Jakarta)</option>
              <option value="GMT+8">GMT+8 (Singapore)</option>
              <option value="GMT+0">GMT+0 (London)</option>
              <option value="GMT-5">GMT-5 (New York)</option>
              <option value="GMT-8">GMT-8 (Los Angeles)</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={saveAccountSettings}
            disabled={loading.account}
          >
            {loading.account ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Account Settings
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3><i className="fas fa-bell"></i> Notification Settings</h3>
        </div>
        <div className="card-content">
          {successMessages.notifications && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#D1FAE5', 
              color: '#065F46', 
              borderRadius: '6px', 
              marginBottom: '15px',
              border: '1px solid #A7F3D0'
            }}>
              <i className="fas fa-check-circle"></i> {successMessages.notifications}
            </div>
          )}
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notificationSettings.emailNotifications}
                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              /> 
              Email Notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notificationSettings.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
              /> 
              Push Notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notificationSettings.smsAlerts}
                onChange={(e) => handleNotificationChange('smsAlerts', e.target.checked)}
              /> 
              SMS Alerts
            </label>
          </div>
          
          <div style={{ marginTop: '15px' }}>
            <label htmlFor="notification-frequency" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Notification Frequency</label>
            <select 
              id="notification-frequency" 
              className="form-control" 
              value={notificationSettings.frequency}
              onChange={(e) => handleNotificationChange('frequency', e.target.value)}
            >
              <option value="immediate">Immediately</option>
              <option value="hourly">Hourly Digest</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Report</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '15px' }}
            onClick={saveNotificationSettings}
            disabled={loading.notifications}
          >
            {loading.notifications ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Notification Settings
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* API Integration */}
      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-code"></i> API Integration</h3>
        </div>
        <div className="card-content">
          {successMessages.api && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#D1FAE5', 
              color: '#065F46', 
              borderRadius: '6px', 
              marginBottom: '15px',
              border: '1px solid #A7F3D0'
            }}>
              <i className="fas fa-check-circle"></i> {successMessages.api}
            </div>
          )}
          
          {(successMessages.copy || successMessages.regenerate) && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#DBEAFE', 
              color: '#1E40AF', 
              borderRadius: '6px', 
              marginBottom: '15px',
              border: '1px solid #93C5FD'
            }}>
              <i className="fas fa-info-circle"></i> {successMessages.copy || successMessages.regenerate}
            </div>
          )}
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="api-key" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>API Key</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                id="api-key" 
                className="form-control" 
                value={apiSettings.apiKey}
                style={{ flex: '1' }} 
                readOnly 
              />
              <button 
                className="btn btn-outline" 
                onClick={copyApiKey}
                title="Copy to clipboard"
              >
                <i className="fas fa-copy"></i> Copy
              </button>
              <button 
                className="btn btn-outline" 
                onClick={regenerateApiKey}
                title="Generate new API key"
              >
                <i className="fas fa-redo"></i> Regenerate
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="webhook-url" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Webhook URL</label>
            <input 
              type="text" 
              id="webhook-url" 
              className="form-control" 
              placeholder="https://yourdomain.com/webhook"
              value={apiSettings.webhookUrl}
              onChange={(e) => handleApiChange('webhookUrl', e.target.value)}
            />
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={saveApiSettings}
            disabled={loading.api}
          >
            {loading.api ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save API Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}