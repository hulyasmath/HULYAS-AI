// Zeq OS Mathematical Framework - Popup Script

// Pulse animation at 1.287 Hz (period = 1/1.287 ≈ 0.777 seconds)
function startPulseAnimation() {
  const pulseCircle = document.getElementById('pulseCircle');
  if (!pulseCircle) return;
  
  // The CSS animation already handles the timing, but we can sync it
  // 1.287 Hz = period of 0.777 seconds
  const pulsePeriod = 1000 / 1.287; // milliseconds
  
  // Ensure animation is running
  pulseCircle.style.animation = `pulse ${pulsePeriod}ms ease-in-out infinite`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Start pulse animation
  startPulseAnimation();
  const enableToggle = document.getElementById('enableToggle');
  const platformChatGPT = document.getElementById('platform-chatgpt');
  const platformClaude = document.getElementById('platform-claude');
  const platformGrok = document.getElementById('platform-grok');
  const platformUniversal = document.getElementById('platform-universal');
  const saveButton = document.getElementById('saveButton');

  // Load current settings
  chrome.storage.sync.get(['enabled', 'platforms'], (result) => {
    enableToggle.checked = result.enabled !== false;
    platformChatGPT.checked = result.platforms?.chatgpt !== false;
    platformClaude.checked = result.platforms?.claude !== false;
    platformGrok.checked = result.platforms?.grok !== false;
    platformUniversal.checked = result.platforms?.universal !== false;
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const settings = {
      enabled: enableToggle.checked,
      platforms: {
        chatgpt: platformChatGPT.checked,
        claude: platformClaude.checked,
        grok: platformGrok.checked,
        universal: platformUniversal.checked
      }
    };

    chrome.storage.sync.set(settings, () => {
      // Notify all tabs of settings update
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'settingsUpdated',
            settings: settings
          }).catch(() => {
            // Ignore errors for tabs that don't have content script
          });
        });
      });

      // Also send to all frames
      chrome.runtime.sendMessage({
        action: 'broadcastSettings',
        settings: settings
      }).catch(() => {
        // Ignore errors
      });

      // Show confirmation
      saveButton.textContent = 'Saved!';
      saveButton.style.background = '#4caf50';
      setTimeout(() => {
        saveButton.textContent = 'Save Settings';
        saveButton.style.background = '';
      }, 1500);
    });
  });

  // Update platform checkboxes when main toggle changes
  enableToggle.addEventListener('change', () => {
    const isEnabled = enableToggle.checked;
    platformChatGPT.disabled = !isEnabled;
    platformClaude.disabled = !isEnabled;
    platformGrok.disabled = !isEnabled;
    platformUniversal.disabled = !isEnabled;
  });

  // Initial state
  const isEnabled = enableToggle.checked;
  platformChatGPT.disabled = !isEnabled;
  platformClaude.disabled = !isEnabled;
  platformGrok.disabled = !isEnabled;
  platformUniversal.disabled = !isEnabled;

  // Transparency Export functionality
  const exportTransparencyBtn = document.getElementById('exportTransparency');
  const clearTransparencyBtn = document.getElementById('clearTransparency');
  const transparencyStatus = document.getElementById('transparencyStatus');

  // Load transparency manager script and export data
  exportTransparencyBtn.addEventListener('click', async () => {
    try {
      exportTransparencyBtn.disabled = true;
      exportTransparencyBtn.textContent = 'Exporting...';
      transparencyStatus.textContent = '';
      transparencyStatus.className = 'status-message';

      // Check if TransparencyManager is available in popup context
      if (typeof TransparencyManager === 'undefined') {
        transparencyStatus.textContent = '❌ Transparency Manager not loaded. Please refresh the extension.';
        transparencyStatus.className = 'status-message error';
        exportTransparencyBtn.disabled = false;
        exportTransparencyBtn.textContent = 'Export Transparency Data';
        return;
      }

      try {
        const manager = new TransparencyManager();
        await manager.initialize();
        
        const log = manager.getLog();
        if (log.length === 0) {
          transparencyStatus.textContent = 'ℹ️ No transparency data to export yet. Process some queries first.';
          transparencyStatus.className = 'status-message';
          exportTransparencyBtn.disabled = false;
          exportTransparencyBtn.textContent = 'Export Transparency Data';
          return;
        }

        // Export transcript
        const transcript = manager.exportTransparency();
        
        // Create download
        const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: "application/json" });
        const date = new Date();
        const fileName = `zeq-transparency-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.json`;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        transparencyStatus.textContent = `✅ Exported ${log.length} entries as ${fileName}`;
        transparencyStatus.className = 'status-message success';
      } catch (error) {
        transparencyStatus.textContent = `❌ Export error: ${error.message}`;
        transparencyStatus.className = 'status-message error';
      }
    } catch (error) {
      transparencyStatus.textContent = `❌ Error: ${error.message}`;
      transparencyStatus.className = 'status-message error';
    } finally {
      exportTransparencyBtn.disabled = false;
      exportTransparencyBtn.textContent = 'Export Transparency Data';
    }
  });

  // Clear transparency log
  clearTransparencyBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear all transparency log data? This cannot be undone.')) {
      return;
    }

    try {
      clearTransparencyBtn.disabled = true;
      clearTransparencyBtn.textContent = 'Clearing...';
      transparencyStatus.textContent = '';
      transparencyStatus.className = 'status-message';

      // Check if TransparencyManager is available in popup context
      if (typeof TransparencyManager === 'undefined') {
        transparencyStatus.textContent = '❌ Transparency Manager not loaded. Please refresh the extension.';
        transparencyStatus.className = 'status-message error';
        clearTransparencyBtn.disabled = false;
        clearTransparencyBtn.textContent = 'Clear Log';
        return;
      }

      try {
        const manager = new TransparencyManager();
        await manager.initialize();
        await manager.clearLog();
        transparencyStatus.textContent = '✅ Transparency log cleared';
        transparencyStatus.className = 'status-message success';
      } catch (error) {
        transparencyStatus.textContent = `❌ Clear error: ${error.message}`;
        transparencyStatus.className = 'status-message error';
      }
    } catch (error) {
      transparencyStatus.textContent = `❌ Error: ${error.message}`;
      transparencyStatus.className = 'status-message error';
    } finally {
      clearTransparencyBtn.disabled = false;
      clearTransparencyBtn.textContent = 'Clear Log';
    }
  });
});

