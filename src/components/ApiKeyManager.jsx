import { useState, useEffect } from "react";
import { getSupabase } from "../utils/supabase";

export default function ApiKeyManager({ user, subscription }) {
  const [apiKeyStatus, setApiKeyStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEnterprise = subscription?.plan === "Enterprise";

  useEffect(() => {
    if (isEnterprise && user) {
      loadApiKeyStatus();
    }
  }, [user, isEnterprise]);

  const loadApiKeyStatus = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://verishelf-e0b90033152c.herokuapp.com/api';

      const response = await fetch(`${API_BASE_URL}/api-key-status`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeyStatus(data);
      }
    } catch (error) {
      console.error('Error loading API key status:', error);
    }
  };

  const generateApiKey = async () => {
    if (!window.confirm('Generate a new API key? This will invalidate your existing key if you have one.')) {
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to generate an API key');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://verishelf-e0b90033152c.herokuapp.com/api';

      const response = await fetch(`${API_BASE_URL}/generate-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNewApiKey(data.api_key);
        setShowKey(true);
        await loadApiKeyStatus();
        alert('API key generated! Copy it now - it will not be shown again.');
      } else {
        alert(`Error: ${data.message || 'Failed to generate API key'}`);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Error generating API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async () => {
    if (!window.confirm('Regenerate your API key? This will invalidate your current key and all integrations using it will stop working.')) {
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to regenerate API key');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://verishelf-e0b90033152c.herokuapp.com/api';

      const response = await fetch(`${API_BASE_URL}/regenerate-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNewApiKey(data.api_key);
        setShowKey(true);
        await loadApiKeyStatus();
        alert('API key regenerated! Copy the new key and update all your integrations immediately.');
      } else {
        alert(`Error: ${data.message || 'Failed to regenerate API key'}`);
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Error regenerating API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disableApiKey = async () => {
    if (!window.confirm('Disable your API key? All API requests will be rejected until you generate a new key.')) {
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to disable API key');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://verishelf-e0b90033152c.herokuapp.com/api';

      const response = await fetch(`${API_BASE_URL}/disable-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        await loadApiKeyStatus();
        alert('API key disabled successfully.');
      } else {
        alert(`Error: ${data.message || 'Failed to disable API key'}`);
      }
    } catch (error) {
      console.error('Error disabling API key:', error);
      alert('Error disabling API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isEnterprise) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">API Access</h2>
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-200 text-sm">
            API access requires an <strong>Enterprise</strong> plan subscription. 
            Upgrade to Enterprise to get full REST API access, webhooks, and integration support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800">
      <h2 className="text-2xl font-bold text-white mb-4">API Key Management</h2>
      <p className="text-slate-400 text-sm mb-6">
        Manage your API keys for programmatic access to VeriShelf. Use these keys to integrate with your POS, ERP, or custom systems.
      </p>

      {newApiKey && showKey && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-emerald-200 font-semibold">New API Key Generated</h3>
            <button
              onClick={() => setShowKey(false)}
              className="text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-emerald-400 text-sm font-mono break-all">
              {newApiKey}
            </code>
            <button
              onClick={() => copyToClipboard(newApiKey)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-amber-200 text-xs">
            ⚠️ <strong>Important:</strong> Copy this key now. It will not be shown again. Store it securely.
          </p>
        </div>
      )}

      {apiKeyStatus && (
        <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h3 className="text-white font-semibold mb-3">API Key Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-semibold ${apiKeyStatus.enabled ? 'text-emerald-400' : 'text-red-400'}`}>
                {apiKeyStatus.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {apiKeyStatus.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-300">
                  {new Date(apiKeyStatus.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {apiKeyStatus.last_used_at && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Used:</span>
                <span className="text-slate-300">
                  {new Date(apiKeyStatus.last_used_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!apiKeyStatus?.has_api_key ? (
          <button
            onClick={generateApiKey}
            disabled={loading}
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate API Key'}
          </button>
        ) : (
          <>
            <button
              onClick={regenerateApiKey}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Regenerating...' : 'Regenerate API Key'}
            </button>
            <button
              onClick={disableApiKey}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Disabling...' : 'Disable API Key'}
            </button>
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
        <h4 className="text-white font-semibold mb-2 text-sm">API Documentation</h4>
        <p className="text-slate-400 text-xs mb-3">
          View complete API documentation with examples and endpoints.
        </p>
        <a
          href="/api-docs.html"
          target="_blank"
          className="text-emerald-400 hover:text-emerald-300 text-sm underline"
        >
          View API Documentation →
        </a>
      </div>

      <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <h4 className="text-amber-200 font-semibold mb-2 text-sm">Security Best Practices</h4>
        <ul className="text-amber-200/80 text-xs space-y-1 list-disc list-inside">
          <li>Never share your API key or commit it to version control</li>
          <li>Use environment variables to store API keys</li>
          <li>Regenerate keys immediately if compromised</li>
          <li>Monitor API usage for suspicious activity</li>
        </ul>
      </div>
    </div>
  );
}
