/**
 * BuilderSolve Contact Form - Complete Implementation
 * @version 3.0.0
 */

class ContactForm {
    constructor() {
        this.config = {
            debug: window.location.hostname === 'localhost',
            submitEndpoint: '/api/contact', // Change to your actual endpoint
            emailServiceEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // Or use Formspree
            maxMessageLength: 2000,
            phoneRegex: /^[\d\s\-\+\(\)]+$/,
            emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        };

        this.state = {
            isSubmitting: false,
            isInitialized: false
        };

        this.elements = {};
        
        this.init();
    }

    /**
     * Initialize contact form
     */
    init() {
        console.log('🚀 Contact form initializing...');
        
        try {
            this.cacheElements();
            this.bindEvents();
            this.setupValidation();
            
            this.state.isInitialized = true;
            console.log('✅ Contact form initialized successfully');
            
            this.trackEvent('contact_form_loaded');
            
        } catch (error) {
            console.error('❌ Contact form initialization failed:', error);
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            form: document.getElementById('contact-form'),
            submitBtn: document.getElementById('submit-btn'),
            btnText: document.querySelector('.btn-text'),
            btnLoader: document.querySelector('.btn-loader'),
            successMessage: document.getElementById('success-message'),
            errorMessage: document.getElementById('error-message'),
            
            // Form fields
            firstName: document.getElementById('first-name'),
            lastName: document.getElementById('last-name'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            company: document.getElementById('company'),
            projectType: document.getElementById('project-type'),
            budget: document.getElementById('budget'),
            timeline: document.getElementById('timeline'),
            message: document.getElementById('message'),
            privacyConsent: document.getElementById('privacy-consent'),
            
            // Error spans
            firstNameError: document.getElementById('first-name-error'),
            lastNameError: document.getElementById('last-name-error'),
            emailError: document.getElementById('email-error'),
            phoneError: document.getElementById('phone-error'),
            companyError: document.getElementById('company-error'),
            projectTypeError: document.getElementById('project-type-error'),
            messageError: document.getElementById('message-error'),
            privacyConsentError: document.getElementById('privacy-consent-error')
        };

        console.log('📦 Form elements cached:', {
            form: !!this.elements.form,
            submitBtn: !!this.elements.submitBtn,
            fields: Object.keys(this.elements).filter(k => k.includes('Error')).length
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.elements.form) return;

        // Form submission
        this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));

        // Real-time validation on blur
        const fields = [
            'firstName', 'lastName', 'email', 'phone', 
            'company', 'projectType', 'message'
        ];
        
        fields.forEach(field => {
            if (this.elements[field]) {
                this.elements[field].addEventListener('blur', () => {
                    this.validateField(field);
                });
                
                // Clear error on input
                this.elements[field].addEventListener('input', () => {
                    this.clearFieldError(field);
                });
            }
        });

        // Privacy consent checkbox
        if (this.elements.privacyConsent) {
            this.elements.privacyConsent.addEventListener('change', () => {
                this.validateField('privacyConsent');
            });
        }

        // Phone number formatting
        if (this.elements.phone) {
            this.elements.phone.addEventListener('input', this.formatPhoneNumber.bind(this));
        }

        console.log('✅ Form events bound');
    }

    /**
     * Setup form validation
     */
    setupValidation() {
        // Prevent browser default validation
        if (this.elements.form) {
            this.elements.form.setAttribute('novalidate', 'true');
        }
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();

        if (this.state.isSubmitting) {
            console.log('⏳ Form already submitting...');
            return;
        }

        console.log('📤 Form submission started');

        // Validate all fields
        const isValid = this.validateForm();

        if (!isValid) {
            console.log('❌ Form validation failed');
            this.trackEvent('form_validation_failed');
            this.scrollToFirstError();
            return;
        }

        // Get form data
        const formData = this.getFormData();
        
        console.log('📋 Form data:', formData);

        // Submit form
        await this.submitForm(formData);
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const fields = [
            'firstName', 'lastName', 'email', 'phone',
            'company', 'projectType', 'message', 'privacyConsent'
        ];

        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(fieldName) {
        const field = this.elements[fieldName];
        const errorSpan = this.elements[`${fieldName}Error`];

        if (!field) return true;

        let isValid = true;
        let errorMessage = '';

        const value = field.type === 'checkbox' ? field.checked : field.value.trim();

        // Required field validation
        if (field.hasAttribute('required') || field.getAttribute('aria-required') === 'true') {
            if (!value || (typeof value === 'string' && value === '')) {
                isValid = false;
                errorMessage = 'This field is required';
            }
        }

        // Specific field validations
        if (isValid && value) {
            switch (fieldName) {
                case 'firstName':
                case 'lastName':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Must be at least 2 characters';
                    }
                    break;

                case 'email':
                    if (!this.config.emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;

                case 'phone':
                    const cleanPhone = value.replace(/\D/g, '');
                    if (cleanPhone.length < 10) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;

                case 'company':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Please enter your company name';
                    }
                    break;

                case 'message':
                    if (value.length < 10) {
                        isValid = false;
                        errorMessage = 'Please provide at least 10 characters';
                    } else if (value.length > this.config.maxMessageLength) {
                        isValid = false;
                        errorMessage = `Message is too long (max ${this.config.maxMessageLength} characters)`;
                    }
                    break;

                case 'privacyConsent':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'You must agree to the privacy policy';
                    }
                    break;
            }
        }

        // Update UI
        if (!isValid) {
            this.showFieldError(field, errorSpan, errorMessage);
        } else {
            this.clearFieldError(fieldName);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(field, errorSpan, message) {
        if (field) {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
        }
        
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('show');
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldName) {
        const field = this.elements[fieldName];
        const errorSpan = this.elements[`${fieldName}Error`];

        if (field) {
            field.classList.remove('error');
            field.removeAttribute('aria-invalid');
        }
        
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        }
    }

    /**
     * Format phone number
     */
    formatPhoneNumber(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, '');
        
        // Format as: +1 (555) 123-4567
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else if (value.length <= 10) {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
            } else {
                value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 11)}`;
            }
        }
        
        input.value = value;
    }

    /**
     * Get form data
     */
    getFormData() {
        return {
            firstName: this.elements.firstName?.value.trim() || '',
            lastName: this.elements.lastName?.value.trim() || '',
            email: this.elements.email?.value.trim() || '',
            phone: this.elements.phone?.value.trim() || '',
            company: this.elements.company?.value.trim() || '',
            projectType: this.elements.projectType?.value || '',
            budget: this.elements.budget?.value || '',
            timeline: this.elements.timeline?.value || '',
            message: this.elements.message?.value.trim() || '',
            privacyConsent: this.elements.privacyConsent?.checked || false,
            timestamp: new Date().toISOString(),
            source: 'BuilderSolve Landing Page'
        };
    }

    /**
     * Submit form to backend
     */
    async submitForm(formData) {
        this.setSubmitting(true);

        try {
            console.log('📡 Sending form data...');

            // OPTION 1: Use Formspree (no backend needed)
            const response = await fetch(this.config.emailServiceEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // OPTION 2: Use your own backend endpoint
            // const response = await fetch(this.config.submitEndpoint, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Form submitted successfully:', result);

            this.handleSuccess(formData);

        } catch (error) {
            console.error('❌ Form submission error:', error);
            this.handleError(error);
        } finally {
            this.setSubmitting(false);
        }
    }

    /**
     * Handle successful submission
     */
    handleSuccess(formData) {
        // Show success message
        this.showMessage('success');

        // Reset form
        if (this.elements.form) {
            this.elements.form.reset();
        }

        // Track conversion
        this.trackConversion('form_submitted', formData);

        // Scroll to success message
        setTimeout(() => {
            this.elements.successMessage?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);

        console.log('🎉 Form submission completed successfully');
    }

    /**
     * Handle submission error
     */
    handleError(error) {
        // Show error message
        this.showMessage('error');

        // Track error
        this.trackEvent('form_submission_failed', {
            error: error.message,
            timestamp: Date.now()
        });

        // Scroll to error message
        setTimeout(() => {
            this.elements.errorMessage?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);

        console.error('💥 Form submission failed');
    }

    /**
     * Show success/error message
     */
    showMessage(type) {
        this.hideMessages();

        const messageElement = type === 'success' 
            ? this.elements.successMessage 
            : this.elements.errorMessage;

        if (messageElement) {
            messageElement.classList.add('show');
        }

        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideMessages();
        }, 10000);
    }

    /**
     * Hide all messages
     */
    hideMessages() {
        this.elements.successMessage?.classList.remove('show');
        this.elements.errorMessage?.classList.remove('show');
    }

    /**
     * Set submitting state
     */
    setSubmitting(isSubmitting) {
        this.state.isSubmitting = isSubmitting;

        if (this.elements.submitBtn) {
            if (isSubmitting) {
                this.elements.submitBtn.classList.add('loading');
                this.elements.submitBtn.disabled = true;
            } else {
                this.elements.submitBtn.classList.remove('loading');
                this.elements.submitBtn.disabled = false;
            }
        }
    }

    /**
     * Scroll to first error
     */
    scrollToFirstError() {
        const firstError = document.querySelector('.form-error.show');
        
        if (firstError) {
            const field = firstError.previousElementSibling;
            
            if (field) {
                field.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Focus the field
                setTimeout(() => {
                    field.focus();
                }, 300);
            }
        }
    }

    /**
     * Track events
     */
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            component: 'contact_form',
            timestamp: Date.now(),
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'contact_form',
                event_label: data.projectType || '',
                value: data.timestamp || 0
            });
        }

        // Custom analytics
        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }

        // PostHog
        if (window.posthog) {
            window.posthog.capture(eventName, eventData);
        }
    }

    /**
     * Track conversions
     */
    trackConversion(eventName, data = {}) {
        this.trackEvent(eventName, { ...data, conversion: true });
        
        // Facebook Pixel
        if (window.fbq) {
            window.fbq('track', 'Lead', {
                content_name: 'Contact Form',
                content_category: 'Lead Generation'
            });
        }

        // Google Ads
        if (window.gtag) {
            window.gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
                value: 1.0,
                currency: 'USD'
            });
        }

        // LinkedIn Insight Tag
        if (window.lintrk) {
            window.lintrk('track', { conversion_id: 'YOUR_CONVERSION_ID' });
        }
    }

    /**
     * Public API
     */
    getAPI() {
        return {
            submit: () => this.handleSubmit({ preventDefault: () => {} }),
            reset: () => this.elements.form?.reset(),
            validate: () => this.validateForm(),
            isSubmitting: () => this.state.isSubmitting,
            isReady: () => this.state.isInitialized
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners
        if (this.elements.form) {
            this.elements.form.removeEventListener('submit', this.handleSubmit);
        }

        console.log('🧹 Contact form cleaned up');
    }
}

// Initialize contact form
let contactFormInstance;

const initializeContactForm = () => {
    try {
        console.log('🔄 Initializing Contact Form...');
        
        contactFormInstance = new ContactForm();
        
        // Export API
        window.BuilderSolveContactForm = contactFormInstance.getAPI();
        
        console.log('✅ Contact Form API exported to window.BuilderSolveContactForm');
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('buildersolve:contactform:ready', {
            detail: { api: window.BuilderSolveContactForm }
        }));
        
    } catch (error) {
        console.error('❌ Failed to initialize Contact Form:', error);
    }
};

// Initialize based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForm);
} else {
    // DOM already loaded
    setTimeout(initializeContactForm, 100);
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (contactFormInstance) {
        contactFormInstance.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactForm;
} else if (typeof define === 'function' && define.amd) {
    define(() => ContactForm);
}