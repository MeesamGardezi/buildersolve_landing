/**
 * BuilderSolve Minimal Footer
 * @version 2.0.0
 */

class MinimalFooter {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.loadFooterHTML();
            this.updateYear();
            console.log('✅ Minimal footer initialized');
        } catch (error) {
            console.error('❌ Footer error:', error);
        }
    }

    async loadFooterHTML() {
        const container = document.getElementById('footer');
        if (!container) return;

        try {
            const response = await fetch('components/footer/footer.html');
            if (response.ok) {
                container.innerHTML = await response.text();
            } else {
                throw new Error('Failed to load');
            }
        } catch (error) {
            // Fallback HTML
            container.innerHTML = `
                <footer class="footer-minimal" role="contentinfo">
                    <div class="footer-content">
                        <p class="footer-text">
                            © <span id="current-year">2024</span> BuilderSolve. All rights reserved.
                            <span class="footer-divider">•</span>
                            <a href="https://buildersolve.com/privacy" class="footer-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        </p>
                    </div>
                </footer>
            `;
        }
    }

    updateYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MinimalFooter());
} else {
    new MinimalFooter();
}