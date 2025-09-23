import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Server, 
  Globe, 
  Mail, 
  Bell, 
  Lock, 
  Key, 
  Monitor, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  useGetPlatformSettingsQuery, 
  useUpdatePlatformSettingsMutation,
  useGetPlatformHealthQuery 
} from '../../store/api/superadminApi';
import styles from '../../styles/pages/SystemSettings.module.css';

/**
 * System Settings Page for SuperAdmin Portal
 * Manages platform-wide configuration, security, and system settings
 */
const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);

  // API queries
  const { 
    data: platformSettings, 
    isLoading: settingsLoading
  } = useGetPlatformSettingsQuery();
  
  const { 
    data: platformHealth, 
    isLoading: healthLoading 
  } = useGetPlatformHealthQuery();
  
  const [updatePlatformSettings, { isLoading: updateLoading }] = useUpdatePlatformSettingsMutation();

  // Initialize settings when data loads
  useEffect(() => {
    if (platformSettings) {
      setSettings(platformSettings);
    }
  }, [platformSettings]);

  // Handle setting changes
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
    setSaveStatus(null);
  };

  // Save settings
  const handleSaveSettings = async () => {
    try {
      await updatePlatformSettings(settings).unwrap();
      setHasChanges(false);
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
      console.error('Error saving settings:', error);
    }
  };

  // Reset settings
  const handleResetSettings = () => {
    if (platformSettings) {
      setSettings(platformSettings);
      setHasChanges(false);
      setSaveStatus(null);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'system', label: 'System', icon: Server },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor }
  ];

  if (settingsLoading) {
    return (
      <div className={styles.systemSettings}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <RefreshCw className={styles.spinIcon} />
            <span>Loading system settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.systemSettings}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>System Settings</h1>
          <p className={styles.pageDescription}>
            Configure platform-wide settings, security policies, and system parameters
          </p>
        </div>
        
        <div className={styles.headerActions}>
          {hasChanges && (
            <button 
              className={styles.resetButton}
              onClick={handleResetSettings}
              disabled={updateLoading}
            >
              <RefreshCw className={styles.buttonIcon} />
              Reset
            </button>
          )}
          
          <button 
            className={`${styles.saveButton} ${hasChanges ? styles.hasChanges : ''}`}
            onClick={handleSaveSettings}
            disabled={!hasChanges || updateLoading}
          >
            <Save className={styles.buttonIcon} />
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`${styles.statusAlert} ${styles[saveStatus.type]}`}>
          {saveStatus.type === 'success' ? (
            <CheckCircle className={styles.statusIcon} />
          ) : (
            <AlertTriangle className={styles.statusIcon} />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent className={styles.tabIcon} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'general' && (
          <GeneralSettings 
            settings={settings.general || {}} 
            onChange={(key, value) => handleSettingChange('general', key, value)}
          />
        )}
        
        {activeTab === 'security' && (
          <SecuritySettings 
            settings={settings.security || {}} 
            onChange={(key, value) => handleSettingChange('security', key, value)}
          />
        )}
        
        {activeTab === 'database' && (
          <DatabaseSettings 
            settings={settings.database || {}} 
            onChange={(key, value) => handleSettingChange('database', key, value)}
          />
        )}
        
        {activeTab === 'system' && (
          <SystemHealthSettings 
            settings={settings.system || {}} 
            health={platformHealth}
            healthLoading={healthLoading}
            onChange={(key, value) => handleSettingChange('system', key, value)}
          />
        )}
        
        {activeTab === 'notifications' && (
          <NotificationSettings 
            settings={settings.notifications || {}} 
            onChange={(key, value) => handleSettingChange('notifications', key, value)}
          />
        )}
        
        {activeTab === 'monitoring' && (
          <MonitoringSettings 
            settings={settings.monitoring || {}} 
            onChange={(key, value) => handleSettingChange('monitoring', key, value)}
          />
        )}
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Globe className={styles.cardIcon} />
            <h3>Platform Configuration</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Platform Name</label>
            <input
              type="text"
              className={styles.settingInput}
              value={settings.platformName || 'NoemieX Platform'}
              onChange={(e) => onChange('platformName', e.target.value)}
              placeholder="Enter platform name"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Platform URL</label>
            <input
              type="url"
              className={styles.settingInput}
              value={settings.platformUrl || 'https://platform.noemiex.com'}
              onChange={(e) => onChange('platformUrl', e.target.value)}
              placeholder="https://your-platform.com"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Default Timezone</label>
            <select
              className={styles.settingSelect}
              value={settings.defaultTimezone || 'UTC'}
              onChange={(e) => onChange('defaultTimezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Default Language</label>
            <select
              className={styles.settingSelect}
              value={settings.defaultLanguage || 'en'}
              onChange={(e) => onChange('defaultLanguage', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
        
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Settings className={styles.cardIcon} />
            <h3>System Limits</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Max Accounts per Platform</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.maxAccounts || 1000}
              onChange={(e) => onChange('maxAccounts', parseInt(e.target.value))}
              min="1"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Max Users per Account</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.maxUsersPerAccount || 100}
              onChange={(e) => onChange('maxUsersPerAccount', parseInt(e.target.value))}
              min="1"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>File Upload Limit (MB)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.fileUploadLimit || 10}
              onChange={(e) => onChange('fileUploadLimit', parseInt(e.target.value))}
              min="1"
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Lock className={styles.cardIcon} />
            <h3>Authentication</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Session Timeout (minutes)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.sessionTimeout || 60}
              onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value))}
              min="5"
              max="480"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Password Minimum Length</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.passwordMinLength || 8}
              onChange={(e) => onChange('passwordMinLength', parseInt(e.target.value))}
              min="6"
              max="32"
            />
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.requirePasswordComplexity || false}
                onChange={(e) => onChange('requirePasswordComplexity', e.target.checked)}
              />
              Require password complexity
            </label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.enableTwoFactor || false}
                onChange={(e) => onChange('enableTwoFactor', e.target.checked)}
              />
              Enable two-factor authentication
            </label>
          </div>
        </div>
        
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Key className={styles.cardIcon} />
            <h3>API Security</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>API Rate Limit (requests/minute)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.apiRateLimit || 100}
              onChange={(e) => onChange('apiRateLimit', parseInt(e.target.value))}
              min="10"
              max="1000"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>JWT Token Expiry (hours)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.jwtExpiry || 24}
              onChange={(e) => onChange('jwtExpiry', parseInt(e.target.value))}
              min="1"
              max="168"
            />
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.enableApiLogging || true}
                onChange={(e) => onChange('enableApiLogging', e.target.checked)}
              />
              Enable API request logging
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Database Settings Component
const DatabaseSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Database className={styles.cardIcon} />
            <h3>Database Configuration</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Connection Pool Size</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.connectionPoolSize || 10}
              onChange={(e) => onChange('connectionPoolSize', parseInt(e.target.value))}
              min="5"
              max="50"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Query Timeout (seconds)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.queryTimeout || 30}
              onChange={(e) => onChange('queryTimeout', parseInt(e.target.value))}
              min="5"
              max="300"
            />
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.enableQueryLogging || false}
                onChange={(e) => onChange('enableQueryLogging', e.target.checked)}
              />
              Enable query logging
            </label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.enableBackupSchedule || true}
                onChange={(e) => onChange('enableBackupSchedule', e.target.checked)}
              />
              Enable automated backups
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// System Health Settings Component
const SystemHealthSettings = ({ settings, health, healthLoading, onChange }) => {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Monitor className={styles.cardIcon} />
            <h3>System Health</h3>
          </div>
          
          {healthLoading ? (
            <div className={styles.healthLoading}>
              <RefreshCw className={styles.spinIcon} />
              <span>Loading system health...</span>
            </div>
          ) : (
            <div className={styles.healthMetrics}>
              <div className={styles.healthMetric}>
                <span className={styles.metricLabel}>CPU Usage</span>
                <span className={styles.metricValue}>{health?.cpu || '0'}%</span>
              </div>
              <div className={styles.healthMetric}>
                <span className={styles.metricLabel}>Memory Usage</span>
                <span className={styles.metricValue}>{health?.memory || '0'}%</span>
              </div>
              <div className={styles.healthMetric}>
                <span className={styles.metricLabel}>Disk Usage</span>
                <span className={styles.metricValue}>{health?.disk || '0'}%</span>
              </div>
              <div className={styles.healthMetric}>
                <span className={styles.metricLabel}>Uptime</span>
                <span className={styles.metricValue}>{health?.uptime || '0h'}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Server className={styles.cardIcon} />
            <h3>Performance</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Cache TTL (seconds)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.cacheTtl || 300}
              onChange={(e) => onChange('cacheTtl', parseInt(e.target.value))}
              min="60"
              max="3600"
            />
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.enableCaching || true}
                onChange={(e) => onChange('enableCaching', e.target.checked)}
              />
              Enable caching
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Mail className={styles.cardIcon} />
            <h3>Email Configuration</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>SMTP Server</label>
            <input
              type="text"
              className={styles.settingInput}
              value={settings.smtpServer || ''}
              onChange={(e) => onChange('smtpServer', e.target.value)}
              placeholder="smtp.example.com"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>SMTP Port</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.smtpPort || 587}
              onChange={(e) => onChange('smtpPort', parseInt(e.target.value))}
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>From Email</label>
            <input
              type="email"
              className={styles.settingInput}
              value={settings.fromEmail || ''}
              onChange={(e) => onChange('fromEmail', e.target.value)}
              placeholder="noreply@noemiex.com"
            />
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.enableEmailNotifications || true}
                onChange={(e) => onChange('enableEmailNotifications', e.target.checked)}
              />
              Enable email notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Monitoring Settings Component
const MonitoringSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Monitor className={styles.cardIcon} />
            <h3>Monitoring & Alerts</h3>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Log Retention (days)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.logRetention || 30}
              onChange={(e) => onChange('logRetention', parseInt(e.target.value))}
              min="7"
              max="365"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Alert Threshold CPU (%)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.alertThresholdCpu || 80}
              onChange={(e) => onChange('alertThresholdCpu', parseInt(e.target.value))}
              min="50"
              max="95"
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Alert Threshold Memory (%)</label>
            <input
              type="number"
              className={styles.settingInput}
              value={settings.alertThresholdMemory || 85}
              onChange={(e) => onChange('alertThresholdMemory', parseInt(e.target.value))}
              min="50"
              max="95"
            />
          </div>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={settings.enableSystemAlerts || true}
                onChange={(e) => onChange('enableSystemAlerts', e.target.checked)}
              />
              Enable system alerts
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

// AI-NOTE: Created comprehensive SystemSettings page with tabbed interface for platform configuration.
// Includes general settings, security, database, system health, notifications, and monitoring.
// Integrates with existing superadminApi endpoints for platform settings management.