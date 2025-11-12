import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Cloud, 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw,
  Save,
  Palette,
  Globe,
  Shield,
  Bell,
  Mail,
  Server,
  Activity
} from 'lucide-react';
import { healthService } from '../utils/api';

interface HealthStatus {
  timestamp: string;
  uptime: number;
  status: 'OK' | 'WARNING' | 'ERROR';
  services: {
    database: string;
    s3: string;
  };
}

interface PlatformSettings {
  platformName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

const AdminSettings: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'Modern Business Academy',
    primaryColor: '#0B6B3A',
    secondaryColor: '#2FA38B',
    accentColor: '#F7C948',
    logoUrl: '',
    contactEmail: 'info@modernba.com',
    supportEmail: 'support@modernba.com',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    systemNotifications: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'system' | 'health'>('general');

  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = localStorage.getItem('platformSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    
    // Initial health check
    checkSystemHealth();
  }, []);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    const toast: Toast = { id, type, message };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const checkSystemHealth = async () => {
    try {
      setHealthLoading(true);
      const response = await healthService.checkHealth();
      setHealthStatus(response.data.data);
      
      if (response.data.data.status === 'ERROR') {
        showToast('error', 'System health check failed');
      } else if (response.data.data.status === 'WARNING') {
        showToast('warning', 'System health check shows warnings');
      } else {
        showToast('success', 'System health check passed');
      }
    } catch (error: any) {
      showToast('error', 'Failed to check system health');
      console.error('Health check error:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSettingsLoading(true);
      
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('platformSettings', JSON.stringify(settings));
      
      // Apply theme changes to CSS variables
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
      document.documentElement.style.setProperty('--accent-color', settings.accentColor);
      
      showToast('success', 'Settings saved successfully');
    } catch (error) {
      showToast('error', 'Failed to save settings');
      console.error('Settings save error:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
      case 'connected':
      case 'accessible':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'WARNING':
      case 'disconnected':
      case 'inaccessible':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'ERROR':
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
      case 'connected':
      case 'accessible':
        return 'text-green-600 bg-green-100';
      case 'WARNING':
      case 'disconnected':
      case 'inaccessible':
        return 'text-yellow-600 bg-yellow-100';
      case 'ERROR':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'system', name: 'System', icon: Server },
    { id: 'health', name: 'Health Check', icon: Activity },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-2">Settings</h1>
        <p className="text-neutral-600">Manage platform settings and monitor system health</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Platform Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                      className="input"
                      placeholder="Modern Business Academy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => handleSettingChange('logoUrl', e.target.value)}
                      className="input"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                      className="input"
                      placeholder="info@modernba.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                      className="input"
                      placeholder="support@modernba.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Platform Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-neutral-800">Allow New Registrations</span>
                      <p className="text-sm text-neutral-500">Allow new users to register for the platform</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-neutral-800">Maintenance Mode</span>
                      <p className="text-sm text-neutral-500">Put the platform in maintenance mode</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Color Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                        className="w-12 h-10 border border-neutral-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                        className="input flex-1"
                        placeholder="#0B6B3A"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 border border-neutral-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                        className="input flex-1"
                        placeholder="#2FA38B"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                        className="w-12 h-10 border border-neutral-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                        className="input flex-1"
                        placeholder="#F7C948"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Preview</h3>
                <div className="p-6 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      MBA
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">{settings.platformName}</h4>
                      <p className="text-sm text-neutral-600">Platform Preview</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: settings.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: settings.accentColor }}
                    >
                      Accent Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-neutral-800">Email Notifications</span>
                      <p className="text-sm text-neutral-500">Send email notifications to users</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.systemNotifications}
                      onChange={(e) => handleSettingChange('systemNotifications', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-neutral-800">System Notifications</span>
                      <p className="text-sm text-neutral-500">Show in-app system notifications</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Future Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                    <h4 className="font-medium text-neutral-800 mb-2">Audit Logs</h4>
                    <p className="text-sm text-neutral-600">Track user actions and system events</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Coming Soon
                    </span>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                    <h4 className="font-medium text-neutral-800 mb-2">Billing Management</h4>
                    <p className="text-sm text-neutral-600">Manage subscriptions and payments</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Coming Soon
                    </span>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                    <h4 className="font-medium text-neutral-800 mb-2">Analytics Dashboard</h4>
                    <p className="text-sm text-neutral-600">Detailed platform usage analytics</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Coming Soon
                    </span>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                    <h4 className="font-medium text-neutral-800 mb-2">API Management</h4>
                    <p className="text-sm text-neutral-600">Manage API keys and integrations</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Health Check */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-800">System Health Status</h3>
                <button
                  onClick={checkSystemHealth}
                  disabled={healthLoading}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {healthLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-neutral-600 mt-4">Checking system health...</p>
                </div>
              ) : healthStatus ? (
                <div className="space-y-4">
                  {/* Overall Status */}
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-neutral-800">Overall Status</h4>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.status)}`}>
                        {getStatusIcon(healthStatus.status)}
                        <span>{healthStatus.status}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600">Uptime:</span>
                        <span className="ml-2 font-medium">{formatUptime(healthStatus.uptime)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Last Check:</span>
                        <span className="ml-2 font-medium">
                          {new Date(healthStatus.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Service Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Database className="w-5 h-5 text-neutral-600" />
                          <h4 className="font-medium text-neutral-800">Database</h4>
                        </div>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium ${getStatusColor(healthStatus.services.database)}`}>
                          {getStatusIcon(healthStatus.services.database)}
                          <span className="capitalize">{healthStatus.services.database}</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600">MongoDB Atlas connection status</p>
                    </div>

                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Cloud className="w-5 h-5 text-neutral-600" />
                          <h4 className="font-medium text-neutral-800">File Storage</h4>
                        </div>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium ${getStatusColor(healthStatus.services.s3)}`}>
                          {getStatusIcon(healthStatus.services.s3)}
                          <span className="capitalize">{healthStatus.services.s3}</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600">AWS S3 bucket accessibility</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {healthStatus.status !== 'OK' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">Recommendations</h4>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {healthStatus.services.database !== 'connected' && (
                          <li>• Check MongoDB Atlas connection and network settings</li>
                        )}
                        {healthStatus.services.s3 !== 'accessible' && (
                          <li>• Verify AWS S3 credentials and bucket permissions</li>
                        )}
                        <li>• Contact system administrator if issues persist</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Health Data</h3>
                  <p className="text-neutral-500">Click refresh to check system health</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button (for non-health tabs) */}
        {activeTab !== 'health' && (
          <div className="border-t border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-end">
              <button
                onClick={saveSettings}
                disabled={settingsLoading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {settingsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;