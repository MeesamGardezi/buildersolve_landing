/**
 * BuilderSolve Contact Form - Dual Button (Email + WhatsApp)
 * @version 7.0.0 - Two contact methods in one form
 */

class ContactForm {
    constructor() {
        // ==========================================
        // CONFIGURATION - UPDATE THESE!
        // ==========================================
        this.config = {
            whatsappNumber: '12345678900', // ← Country code + number (no + or spaces)
            emailTo: 'info@buildersolve.com' // ← Your email address
        };

        this.state = {
            isSubmitting: false
        };

        this.init();
    }

    /**
     * Initialize form
     */
    init() {
        console.log('🚀 Initializing dual-button contact form...');
        
        // Cache elements
        this.form = document.getElementById('contact-form');
        this.emailBtn = document.getElementById('emailBtn') || document.getElementById('email-btn');
        this.whatsappBtn = document.getElementById('whatsappBtn') || document.getElementById('whatsapp-btn');
        this.errorMsg = document.getElementById('errorMessage') || document.getElementById('error-message');

        if (!this.form) {
            console.error('❌ Contact form not found!');
            return;
        }

        // Bind events
        this.bindEvents();
        
        // Real-time validation
        this.setupRealTimeValidation();

        console.log('✅ Contact form ready');
        console.log(`📧 Email: ${this.config.emailTo}`);
        console.log(`📱 WhatsApp: ${this.config.whatsappNumber}`);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Email button
        if (this.emailBtn) {
            this.emailBtn.addEventListener('click', (e) => this.handleEmailClick(e));
            console.log('✅ Email button bound');
        }

        // WhatsApp button
        if (this.whatsappBtn) {
            this.whatsappBtn.addEventListener('click', (e) => this.handleWhatsAppClick(e));
            console.log('✅ WhatsApp button bound');
        }
    }

    /**
     * Setup real-time validation
     */
    setupRealTimeValidation() {
        const fields = ['firstName', 'lastName', 'first-name', 'last-name', 'email', 'message'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            // Clear error on input
            field.addEventListener('input', () => {
                this.clearError(fieldId);
                if (this.errorMsg) {
                    this.errorMsg.classList.remove('show');
                }
            });

            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(fieldId);
            });
        });

        // Privacy checkbox
        const privacyIds = ['privacy', 'privacy-consent'];
        privacyIds.forEach(id => {
            const privacyBox = document.getElementById(id);
            if (privacyBox) {
                privacyBox.addEventListener('change', () => {
                    this.clearError(id);
                    if (this.errorMsg) {
                        this.errorMsg.classList.remove('show');
                    }
                });
            }
        });
    }

    /**
     * Handle Email button click
     */
    handleEmailClick(e) {
        e.preventDefault();

        console.log('📧 Email button clicked');

        // Hide error message
        if (this.errorMsg) {
            this.errorMsg.classList.remove('show');
        }

        // Validate form
        if (!this.validateAll()) {
            console.log('❌ Validation failed');
            if (this.errorMsg) {
                this.errorMsg.classList.add('show');
            }
            this.scrollToFirstError();
            return;
        }

        // Get form data
        const data = this.getFormData();
        console.log('📋 Form data collected:', data);

        // Send via email
        this.sendViaEmail(data);
    }

    /**
     * Handle WhatsApp button click
     */
    handleWhatsAppClick(e) {
        e.preventDefault();

        console.log('💬 WhatsApp button clicked');

        // Hide error message
        if (this.errorMsg) {
            this.errorMsg.classList.remove('show');
        }

        // Validate form
        if (!this.validateAll()) {
            console.log('❌ Validation failed');
            if (this.errorMsg) {
                this.errorMsg.classList.add('show');
            }
            this.scrollToFirstError();
            return;
        }

        // Get form data
        const data = this.getFormData();
        console.log('📋 Form data collected:', data);

        // Send via WhatsApp
        this.sendViaWhatsApp(data);
    }

    /**
     * Validate all fields
     */
    validateAll() {
        let isValid = true;

        // Get fields (support multiple ID formats)
        const firstNameField = document.getElementById('firstName') || document.getElementById('first-name');
        const lastNameField = document.getElementById('lastName') || document.getElementById('last-name');
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');

        // Validate each field
        if (firstNameField && !this.validateField(firstNameField.id)) isValid = false;
        if (lastNameField && !this.validateField(lastNameField.id)) isValid = false;
        if (emailField && !this.validateField('email')) isValid = false;
        if (messageField && !this.validateField('message')) isValid = false;

        // Privacy consent
        const privacyBox = document.getElementById('privacy') || document.getElementById('privacy-consent');
        if (privacyBox && !privacyBox.checked) {
            this.showError(privacyBox.id, 'You must agree to the privacy policy');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return true;

        const value = field.value.trim();
        let error = '';

        // Check if required
        if (field.hasAttribute('required') && !value) {
            error = 'This field is required';
        }
        // Email validation
        else if (fieldId === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                error = 'Please enter a valid email address';
            }
        }
        // Minimum length for names
        else if ((fieldId.includes('Name') || fieldId.includes('name')) && value && value.length < 2) {
            error = 'Must be at least 2 characters';
        }
        // Message minimum
        else if (fieldId === 'message' && value && value.length < 10) {
            error = 'Please provide at least 10 characters';
        }

        if (error) {
            this.showError(fieldId, error);
            return false;
        }

        this.clearError(fieldId);
        return true;
    }

    /**
     * Show field error
     */
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`${fieldId}-error`);

        if (field) {
            field.classList.add('error');
        }

        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('show');
        }
    }

    /**
     * Clear field error
     */
    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`${fieldId}-error`);

        if (field) {
            field.classList.remove('error');
        }

        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        }
    }

    /**
     * Get form data
     */
    getFormData() {
        // Support multiple ID formats
        const firstNameField = document.getElementById('firstName') || document.getElementById('first-name');
        const lastNameField = document.getElementById('lastName') || document.getElementById('last-name');
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');

        return {
            firstName: firstNameField?.value.trim() || '',
            lastName: lastNameField?.value.trim() || '',
            email: emailField?.value.trim() || '',
            message: messageField?.value.trim() || ''
        };
    }

    /**
     * Send via Email
     */
    sendViaEmail(data) {
        console.log('📧 Preparing email...');

        const subject = `Contact from ${data.firstName} ${data.lastName}`;
        
        const body = `Name: ${data.firstName} ${data.lastName}
Email: ${data.email}

Message:
${data.message}`;

        const mailtoLink = `mailto:${this.config.emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        console.log('📧 Opening email client...');
        
        // Open email client
        window.location.href = mailtoLink;

        // Track conversion
        this.trackConversion('email', data);

        // Reset form after delay
        setTimeout(() => {
            this.form.reset();
            console.log('✅ Form reset');
        }, 1000);
    }

    /**
     * Send via WhatsApp
     */
    sendViaWhatsApp(data) {
        console.log('💬 Preparing WhatsApp message...');

        const whatsappMessage = `*New Contact from BuilderSolve Website*

*Name:* ${data.firstName} ${data.lastName}
*Email:* ${data.email}

*Message:*
${data.message}`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${this.config.whatsappNumber}?text=${encodedMessage}`;

        console.log('💬 Opening WhatsApp...');

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');

        // Track conversion
        this.trackConversion('whatsapp', data);

        // Reset form after delay
        setTimeout(() => {
            this.form.reset();
            console.log('✅ Form reset');
        }, 1000);
    }

    /**
     * Scroll to first error
     */
    scrollToFirstError() {
        const firstError = this.form.querySelector('.error-message.show');
        if (firstError) {
            const field = firstError.previousElementSibling;
            if (field) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => field.focus(), 300);
            }
        }
    }

    /**
     * Track conversion
     */
    trackConversion(method, data) {
        console.log(`📊 Tracking ${method} conversion:`, data);

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'contact',
                event_label: method,
                value: 1
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Contact', {
                content_name: `Contact Form - ${method}`,
                content_category: 'Lead'
            });
        }

        // Custom event
        window.dispatchEvent(new CustomEvent('buildersolve:contact:sent', {
            detail: {
                method: method,
                ...data
            }
        }));
    }

    /**
     * Public API
     */
    getAPI() {
        return {
            validateAll: () => this.validateAll(),
            getFormData: () => this.getFormData(),
            sendViaEmail: (data) => this.sendViaEmail(data || this.getFormData()),
            sendViaWhatsApp: (data) => this.sendViaWhatsApp(data || this.getFormData()),
            reset: () => this.form.reset()
        };
    }
}

// Initialize when DOM is ready
let contactFormInstance;

function initContactForm() {
    try {
        contactFormInstance = new ContactForm();
        
        // Export API to global scope
        window.BuilderSolveContactForm = contactFormInstance.getAPI();
        
        console.log('✅ Contact form initialized successfully');
        console.log('🔧 API exported to window.BuilderSolveContactForm');
        
    } catch (error) {
        console.error('❌ Failed to initialize contact form:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactForm;
}