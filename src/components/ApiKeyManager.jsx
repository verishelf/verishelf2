import { useState, useEffect } from "react";
import { getSupabase } from "../utils/supabase";

export default function ApiKeyManager({ user, subscription }) {
  const [apiKeyStatus, setApiKeyStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEnterprise = subscription?.plan === "Enterprise";

  // Check if development mode is enabled (localhost = dev mode)
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

  useEffect(() => {
    if ((isEnterprise || isDevelopment) && user) {
      loadApiKeyStatus();
    }
  }, [user, isEnterprise, isDevelopment]);

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
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error loading API key status:', errorData);
        // Set default status if error
        setApiKeyStatus({
          has_api_key: false,
          enabled: false,
          created_at: null,
          last_used_at: null,
        });
      }
    } catch (error) {
      console.error('Error loading API key status:', error);
      // Set default status on error
      setApiKeyStatus({
        has_api_key: false,
        enabled: false,
        created_at: null,
        last_used_at: null,
      });
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
        // Don't show alert - the key is displayed in the UI
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

  if (!isEnterprise && !isDevelopment) {
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
      {isDevelopment && !isEnterprise && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200 text-xs">
            🔧 <strong>Development Mode:</strong> API key generation is enabled without Enterprise plan for testing purposes.
          </p>
        </div>
      )}
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
          <div className="mb-3">
            <label className="block text-slate-400 text-xs mb-2 font-semibold">Your API Key (Copy this now!):</label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <code className="block w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded text-emerald-400 text-sm font-mono break-all overflow-x-auto">
                  {newApiKey}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(newApiKey)}
                className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
              >
                {copied ? '✅ Copied to Clipboard!' : '📋 Copy API Key'}
              </button>
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded border border-slate-700 mb-3">
            <p className="text-slate-300 text-xs mb-2"><strong>How to use in mobile app:</strong></p>
            <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
              <li>Open the VeriShelf mobile app</li>
              <li>Enter API Base URL: <code className="text-emerald-400">http://localhost:3000</code></li>
              <li>Paste the API key above</li>
              <li>Click "Connect"</li>
            </ol>
          </div>
          <p className="text-amber-200 text-xs">
            ⚠️ <strong>Important:</strong> Copy this key now. It will not be shown again. Store it securely.
          </p>
        </div>
      )}

      {apiKeyStatus && (
        <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h3 className="text-white font-semibold mb-3">API Key Status</h3>
          <div className="space-y-2 text-sm mb-4">
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
          
          {apiKeyStatus.has_api_key && apiKeyStatus.enabled && (
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-300 text-sm mb-3 font-semibold">✅ API Key Active</p>
              <div className="p-4 bg-slate-900/50 rounded border border-slate-700">
                <p className="text-slate-300 text-xs mb-2 font-semibold">📱 Mobile App Setup:</p>
                <ol className="text-slate-400 text-xs space-y-2 list-decimal list-inside mb-3">
                  <li>Open VeriShelf mobile app</li>
                  <li>Enter API Base URL: <code className="text-emerald-400">http://localhost:3000</code></li>
                  <li>Enter your API key (you should have saved it when generated)</li>
                  <li>Click "Connect"</li>
                </ol>
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                  <p className="text-amber-200 text-xs">
                    ⚠️ <strong>Important:</strong> API keys are only shown once when generated. If you lost your key, click "Regenerate API Key" above to create a new one.
                  </p>
                </div>
              </div>
            </div>
          )}
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
        <h4 className="text-white font-semibold mb-2 text-sm">Developer / Dashboard Session</h4>
        <p className="text-slate-400 text-xs mb-3">
          As a developer, you can use your current dashboard login session for API access. No API key needed!
        </p>
        <button
          onClick={async () => {
            try {
              const supabase = getSupabase();
              if (!supabase) {
                alert('Supabase not available');
                return;
              }
              
              const { data: { session } } = await supabase.auth.getSession();
              if (!session || !session.access_token) {
                alert('Please log in to the dashboard first');
                return;
              }

              // Copy session token to clipboard
              navigator.clipboard.writeText(session.access_token);
              
              alert(`✅ Session Token Copied!\n\nUse this in API requests:\nAuthorization: Bearer ${session.access_token.substring(0, 20)}...\n\nThis token is valid while you're logged into the dashboard.`);
            } catch (error) {
              console.error('Error getting session:', error);
              alert(`Error: ${error.message || 'Failed to get session token'}`);
            }
          }}
          className="text-emerald-400 hover:text-emerald-300 text-sm underline mb-3"
        >
          Copy Dashboard Session Token →
        </button>
        
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-white font-semibold mb-2 text-sm">Stripe Session (Optional)</h4>
          <p className="text-slate-400 text-xs mb-3">
            Users with active Stripe subscriptions can also use their Stripe session ID.
          </p>
          <button
            onClick={async () => {
              try {
                const supabase = getSupabase();
                if (!supabase) return;
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                  alert('Please log in first');
                  return;
                }

                const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                  ? 'http://localhost:3000/api'
                  : 'https://verishelf-e0b90033152c.herokuapp.com/api';

                const response = await fetch(`${API_BASE_URL}/stripe-session`, {
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                });

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                  throw new Error(errorData.message || `Server error: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.session_id) {
                  navigator.clipboard.writeText(data.session_id);
                  alert(`✅ Stripe Session ID Copied!\n\n${data.session_id}\n\nUse: Authorization: Bearer ${data.session_id}`);
                } else if (data.customer_id) {
                  navigator.clipboard.writeText(data.customer_id);
                  alert(`✅ Customer ID Copied!\n\n${data.customer_id}\n\n${data.message || 'Use this customer ID for API authentication'}`);
                } else {
                  alert(data.message || 'No Stripe information available');
                }
              } catch (error) {
                console.error('Error getting Stripe session:', error);
                alert(`Error: ${error.message || 'Failed to get Stripe session'}`);
              }
            }}
            className="text-emerald-400 hover:text-emerald-300 text-sm underline"
          >
            Get Stripe Session ID →
          </button>
        </div>
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
