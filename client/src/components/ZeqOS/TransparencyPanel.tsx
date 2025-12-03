import React, { useState, useEffect } from 'react';
import { Button } from '@librechat/client';
import { Download, Trash2, Eye, RefreshCw } from 'lucide-react';

interface TransparencyLogEntry {
  id: string;
  timestamp: string;
  userQuery: string;
  platform: string;
  url: string;
  activeOperators?: string[];
  domains?: string[];
  informationIntegrity?: number;
  [key: string]: unknown;
}

export default function TransparencyPanel() {
  const [logs, setLogs] = useState<TransparencyLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState<unknown>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    if (typeof window !== 'undefined' && window.transparencyManager) {
      try {
        const allLogs = window.transparencyManager.getLog();
        setLogs(allLogs || []);
      } catch (error) {
        console.error('Error loading transparency logs:', error);
      }
    }
  };

  const handleDownloadTranscript = () => {
    if (typeof window !== 'undefined' && window.transparencyManager) {
      try {
        window.transparencyManager.downloadTransparency({
          platform: 'librechat',
          includeAll: true
        });
      } catch (error) {
        console.error('Error downloading transcript:', error);
        alert('Error downloading transparency transcript. Check console for details.');
      }
    } else {
      alert('Transparency Manager not available');
    }
  };

  const handleViewTranscript = () => {
    if (typeof window !== 'undefined' && window.transparencyManager) {
      try {
        const transcript = window.transparencyManager.exportTransparency({
          platform: 'librechat',
          includeAll: true
        });
        setTranscript(transcript);
        console.log('Transparency Transcript:', transcript);
      } catch (error) {
        console.error('Error viewing transcript:', error);
        alert('Error generating transcript. Check console for details.');
      }
    } else {
      alert('Transparency Manager not available');
    }
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all transparency logs? This cannot be undone.')) {
      if (typeof window !== 'undefined' && window.transparencyManager) {
        try {
          await window.transparencyManager.clearLog();
          setLogs([]);
          setTranscript(null);
          alert('Transparency logs cleared successfully');
        } catch (error) {
          console.error('Error clearing logs:', error);
          alert('Error clearing logs. Check console for details.');
        }
      }
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Zeq OS Transparency</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={!window.transparencyManager}
            title="Refresh logs"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewTranscript}
            disabled={!window.transparencyManager || logs.length === 0}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Transcript
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTranscript}
            disabled={!window.transparencyManager || logs.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearLogs}
            disabled={!window.transparencyManager || logs.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Logs
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-2 text-sm text-gray-600">
          Total Log Entries: <strong>{logs.length}</strong>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">No transparency logs yet. Start using the framework to generate logs.</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {logs.slice(-20).reverse().map((log) => (
              <div key={log.id} className="rounded border p-3 text-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{log.userQuery || 'No query'}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatDate(log.timestamp)} • {log.platform}
                    </div>
                    {log.activeOperators && log.activeOperators.length > 0 && (
                      <div className="mt-1 text-xs">
                        Operators: {log.activeOperators.length}
                      </div>
                    )}
                    {log.informationIntegrity !== undefined && (
                      <div className="mt-1 text-xs">
                        Integrity: {(log.informationIntegrity * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {transcript && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Transcript Preview (check console for full JSON)</h3>
          <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs">
            {JSON.stringify(transcript, null, 2).substring(0, 1000)}...
          </pre>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Transparency Features:</strong>
        <ul className="mt-2 list-disc pl-5">
          <li>Complete audit trail of all framework processing</li>
          <li>Exact prompts sent to LLM (full mathematical framework state)</li>
          <li>Historical pattern analysis and operator success rates</li>
          <li>Exportable JSON transcripts for compliance and analysis</li>
        </ul>
      </div>
    </div>
  );
}

