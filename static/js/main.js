// ADK Workshop Training Portal - Main JavaScript

// Visual Builder Status Checking
function checkVisualBuilderStatus() {
    fetch('/api/visual-builder-status')
        .then(response => response.json())
        .then(data => {
            const statusDot = document.getElementById('vb-status-dot');
            const statusText = document.getElementById('vb-status-text');

            if (statusDot && statusText) {
                if (data.running) {
                    statusDot.className = 'status-dot running';
                    statusText.textContent = 'Visual Builder is running';
                } else {
                    statusDot.className = 'status-dot stopped';
                    statusText.textContent = 'Visual Builder not running';
                }
            }
        })
        .catch(error => {
            console.error('Error checking Visual Builder status:', error);
        });
}

// Launch Visual Builder
function launchVisualBuilder() {
    const modal = document.getElementById('visual-builder-modal');
    const statusContent = document.getElementById('vb-status-content');

    // Show modal
    modal.style.display = 'block';

    // Show loading state
    statusContent.innerHTML = `
        <div class="spinner"></div>
        <p>Launching Visual Builder...</p>
        <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
            This may take a few seconds...
        </p>
    `;

    fetch('/api/launch-visual-builder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            statusContent.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #34a853; margin-bottom: 1rem;"></i>
                    <h3>Visual Builder is Running!</h3>
                    <p style="margin: 1rem 0;">${data.message}</p>
                    <a href="${data.url}" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-external-link-alt"></i> Open Visual Builder
                    </a>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                        The Visual Builder will open in a new tab.
                    </p>
                </div>
            `;

            // Update status indicator
            checkVisualBuilderStatus();

            // Auto-open in new tab after short delay
            setTimeout(() => {
                window.open(data.url, '_blank');
            }, 1000);
        } else {
            statusContent.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #ea4335; margin-bottom: 1rem;"></i>
                    <h3>Failed to Launch</h3>
                    <p style="margin: 1rem 0;">${data.error}</p>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: left;">
                        <strong>Troubleshooting steps:</strong>
                        <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                            <li>Make sure your virtual environment is activated</li>
                            <li>Verify ADK is installed: <code>pip list | grep google-adk</code></li>
                            <li>Try launching manually: <code>adk web</code></li>
                            <li>Check the <a href="/guides/troubleshooting-guide">troubleshooting guide</a></li>
                        </ol>
                    </div>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error launching Visual Builder:', error);
        statusContent.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #ea4335; margin-bottom: 1rem;"></i>
                <h3>Connection Error</h3>
                <p style="margin: 1rem 0;">Failed to connect to the training portal server.</p>
                <p style="font-size: 0.9rem; color: #666;">Error: ${error.message}</p>
            </div>
        `;
    });
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Launch Visual Builder button handlers
    const launchButtons = document.querySelectorAll('#launch-visual-builder, #big-launch-button');
    launchButtons.forEach(button => {
        button.addEventListener('click', launchVisualBuilder);
    });

    // Modal close handler
    const modal = document.getElementById('visual-builder-modal');
    const closeBtn = modal?.querySelector('.close');

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Check Visual Builder status on page load
    if (document.getElementById('vb-status-dot')) {
        checkVisualBuilderStatus();
        // Check every 5 seconds
        setInterval(checkVisualBuilderStatus, 5000);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Code syntax highlighting (simple version)
    document.querySelectorAll('pre code').forEach(block => {
        // Add line numbers
        const lines = block.textContent.split('\n');
        if (lines.length > 3) {
            block.classList.add('line-numbers');
        }
    });

    // Print button functionality
    const printButtons = document.querySelectorAll('.print-button');
    printButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.print();
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to launch Visual Builder
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            launchVisualBuilder();
        }

        // Ctrl/Cmd + H to go home
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            window.location.href = '/';
        }
    });

    // Show keyboard shortcuts hint
    const keyboardHint = document.createElement('div');
    keyboardHint.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; z-index: 999; display: none;" id="keyboard-hint">
            <strong>Keyboard Shortcuts:</strong><br>
            Ctrl/Cmd + K: Launch Visual Builder<br>
            Ctrl/Cmd + H: Go to Dashboard
        </div>
    `;
    document.body.appendChild(keyboardHint);

    // Show hint on ? keypress
    document.addEventListener('keydown', function(e) {
        if (e.key === '?') {
            const hint = document.getElementById('keyboard-hint');
            hint.style.display = hint.style.display === 'none' ? 'block' : 'none';
            setTimeout(() => {
                hint.style.display = 'none';
            }, 5000);
        }
    });

    console.log('%c🚀 ADK Workshop Training Portal', 'font-size: 1.2rem; color: #1a73e8; font-weight: bold;');
    console.log('%cPress ? to see keyboard shortcuts', 'font-size: 0.9rem; color: #666;');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page is visible, check Visual Builder status
        checkVisualBuilderStatus();
    }
});

// Export functions for use in other scripts
window.ADKPortal = {
    checkVisualBuilderStatus,
    launchVisualBuilder,
    showNotification
};
