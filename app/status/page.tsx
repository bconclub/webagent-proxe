'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface StatusData {
  system: {
    status: 'operational' | 'degraded';
    timestamp: string;
  };
  database: {
    status: 'ok' | 'error';
    message: string;
  };
  apiEndpoints: {
    chat: {
      status: 'ok' | 'error';
      message: string;
      responseTime?: number;
    };
    calendar: {
      status: 'ok' | 'error';
      message: string;
      responseTime?: number;
    };
  };
  version: {
    buildId: string | null;
    gitCommit: string | null;
    deployTime: string | null;
  };
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/status', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const data = await response.json();
      setStatusData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status');
      console.error('Status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const StatusIndicator = ({ status }: { status: 'ok' | 'error' | 'operational' | 'degraded' }) => {
    const isOk = status === 'ok' || status === 'operational';
    return (
      <div className={styles.statusIndicator}>
        <div className={`${styles.statusDot} ${isOk ? styles.statusDotOk : styles.statusDotError}`} />
        <span className={styles.statusText}>{isOk ? 'Operational' : 'Error'}</span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Status</h1>
        <div className={styles.lastUpdated}>
          Last updated: {formatTime(lastUpdated)}
        </div>
      </div>

      {loading && !statusData && (
        <div className={styles.loading}>Loading status...</div>
      )}

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {statusData && (
        <>
          {/* System Status */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>System Status</h2>
              <StatusIndicator status={statusData.system.status} />
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Overall Status:</span>
                <span className={styles.infoValue}>
                  {statusData.system.status === 'operational' ? 'All Systems Operational' : 'Service Degraded'}
                </span>
              </div>
            </div>
          </section>

          {/* Database Connection */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Database Connection</h2>
              <StatusIndicator status={statusData.database.status} />
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={styles.infoValue}>{statusData.database.message}</span>
              </div>
            </div>
          </section>

          {/* API Endpoints */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>API Endpoints</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.endpoint}>
                <div className={styles.endpointHeader}>
                  <span className={styles.endpointPath}>/api/chat</span>
                  <StatusIndicator status={statusData.apiEndpoints.chat.status} />
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Response:</span>
                  <span className={styles.infoValue}>
                    {statusData.apiEndpoints.chat.message}
                    {statusData.apiEndpoints.chat.responseTime && (
                      <span className={styles.responseTime}>
                        {' '}({statusData.apiEndpoints.chat.responseTime}ms)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className={styles.endpoint}>
                <div className={styles.endpointHeader}>
                  <span className={styles.endpointPath}>/api/calendar</span>
                  <StatusIndicator status={statusData.apiEndpoints.calendar.status} />
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Response:</span>
                  <span className={styles.infoValue}>
                    {statusData.apiEndpoints.calendar.message}
                    {statusData.apiEndpoints.calendar.responseTime && (
                      <span className={styles.responseTime}>
                        {' '}({statusData.apiEndpoints.calendar.responseTime}ms)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Version Info */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Version Information</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Build ID:</span>
                <span className={styles.infoValue}>
                  {statusData.version.buildId || 'Not available'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Git Commit:</span>
                <span className={styles.infoValue}>
                  {statusData.version.gitCommit || 'Not available'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Deploy Time:</span>
                <span className={styles.infoValue}>
                  {formatDate(statusData.version.deployTime)}
                </span>
              </div>
            </div>
          </section>
        </>
      )}

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Status page auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}
