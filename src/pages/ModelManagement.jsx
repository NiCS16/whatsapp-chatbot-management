// pages/ModelManagement.js
import React, { useState, useEffect } from 'react';

const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [usedModels, setUsedModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortFreeFirst, setSortFreeFirst] = useState(false);
  const [showUsedModels, setShowUsedModels] = useState(true); // <-- state baru untuk hide/show

  const API_BASE = "http://localhost:3001";

  useEffect(() => {
    fetchModels();
    fetchUsedModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/modelist`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const result = await response.json();
      setModels(result.models || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsedModels = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/models/used`);
      if (response.ok) {
        const data = await response.json();
        setUsedModels(data.usedModels || []);
      }
    } catch (err) {
      console.warn('Failed to fetch used models:', err);
    }
  };

  const setDefaultModel = async (modelName) => {
    try {
      const response = await fetch(`${API_BASE}/api/models/set-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelName })
      });

      if (!response.ok) throw new Error('Failed to set default model');
      
      setSelectedModel(modelName);
      alert(`Default model set to: ${modelName}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSortFree = () => {
    setSortFreeFirst(!sortFreeFirst);
  };

  const toggleUsedModels = () => {
    setShowUsedModels(!showUsedModels);
  };

  const filteredModels = models
    .filter(model =>
      model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortFreeFirst) return 0;
      const aFree = a.id.includes(':free');
      const bFree = b.id.includes(':free');
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
      return 0;
    });

  if (loading) {
    return (
      <div className="page active">
        <div className="loading">Loading models...</div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-brain"></i> Model Management
          <span className="bot-count">{models.length} models available</span>
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={fetchUsedModels}>
            <i className="fas fa-refresh"></i> Refresh Used
          </button>
          <button className="btn btn-primary" onClick={fetchModels}>
            <i className="fas fa-sync-alt"></i> Refresh Models
          </button>
          <button
            className={`btn ${sortFreeFirst ? 'btn-success' : 'btn-outline-success'}`}
            onClick={toggleSortFree}
          >
            <i className="fas fa-sort"></i> {sortFreeFirst ? 'Free First ON' : 'Free First OFF'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button onClick={() => setError(null)} className="close-alert">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Used Models Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>
            <i className="fas fa-history"></i> Recently Used Models
            <span className="badge">{usedModels.length}</span>
          </h3>
          <button className="btn btn-sm btn-outline-primary" onClick={toggleUsedModels}>
            {showUsedModels ? 'Hide' : 'Show'}
          </button>
        </div>
        {showUsedModels && (
          <div className="card-body">
            {usedModels.length === 0 ? (
              <p>No models used yet. Models will be automatically tracked when used.</p>
            ) : (
              <div className="used-models-list">
                {usedModels.slice(-10).reverse().map((entry, index) => (
                  <div key={index} className="used-model-item">
                    <span className="model-name">{entry.model}</span>
                    <span className="timestamp">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Models Search */}
      <div className="search-box" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search models by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%' }}
        />
        <button><i className="fas fa-search"></i></button>
      </div>

      {/* Models List */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Model ID</th>
              <th>Name</th>
              <th>Context Length</th>
              <th>Pricing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  {searchTerm ? 'No models found matching your search.' : 'No models available.'}
                </td>
              </tr>
            ) : (
              filteredModels.map(model => {
                const isFree = model.id.includes(':free');
                return (
                  <tr key={model.id}>
                    <td>
                      <code>{model.id}</code>
                      {isFree && (
                        <span style={{ marginLeft: '8px' }} className="badge badge-success">Free</span>
                      )}
                    </td>
                    <td><strong>{model.name}</strong></td>
                    <td>
                      {model.context_length ? (
                        <span className="badge badge-info">
                          {model.context_length.toLocaleString()} tokens
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {isFree ? (
                        <span className="badge badge-success">Free</span>
                      ) : model.pricing ? (
                        <div style={{ fontSize: '0.8rem' }}>
                          <div>Prompt: ${model.pricing.prompt}/1K</div>
                          <div>Completion: ${model.pricing.completion}/1K</div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setDefaultModel(model.id)}
                        title={`Set ${model.id} as default`}
                      >
                        <i className="fas fa-check"></i> Use
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .used-models-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .used-model-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f7fafc;
          border-radius: 4px;
          border-left: 4px solid #4299e1;
        }
        .model-name {
          font-weight: bold;
          color: #2d3748;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }
        .timestamp {
          font-size: 0.8rem;
          color: #718096;
        }
        .badge {
          background: #e2e8f0;
          color: #4a5568;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }
        .badge-info {
          background: #bee3f8;
          color: #2b6cb0;
        }
        .badge-success {
          background: #c6f6d5;
          color: #22543d;
        }
      `}</style>
    </div>
  );
};

export default ModelManagement;
