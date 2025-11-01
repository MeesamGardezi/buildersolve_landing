/**
 * BuilderSolve Contact Form - Perfected Version
 * @version 4.0.0
 * Simplified, reliable, and fully functional
 */

class ContactForm {
    constructor() {
        // ==========================================
        // SETUP: Replace YOUR_FORM_ID with your actual Formspree form ID
        // Get it from: https://formspree.io/forms
        // ==========================================
        this.config = {
            formspreeId: 'YOUR_FORM_ID', // ← CHANGE THIS!
            formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // ← CHANGE THIS!
            
            // Alternative: Use your own backend
            // customEndpoint: '/api/contact',
            // useCustomBackend: false,
        };

        this.state = {
            isSubmitting: false,
            formData: {}
        };

        this.init();
    }

    /**
     * Initialize form
     */
    init() {
        console.log('🚀 Initializing contact form...');
        
        // Cache elements
        this.form = document.getElementById('contact-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.successMsg = document.getElementById('success-message');
        this.errorMsg = document.getElementById('error-message');

        if (!this.form) {
            console.error('❌ Contact form not found!');
            return;
        }

        // Bind events
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.setupRealTimeValidation();

        console.log('✅ Contact form ready');
    }

    /**
     * Setup real-time validation
     */
    setupRealTimeValidation() {
        const fields = ['first-name', 'last-name', 'email', 'phone', 'company', 'project-type', 'message'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            // Clear error on input
            field.addEventListener('input', () => {
                this.clearError(fieldId);
            });

            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(fieldId);
            });
        });

        // Privacy checkbox
        const privacyBox = document.getElementById('privacy-consent');
        if (privacyBox) {
            privacyBox.addEventListener('change', () => {
                this.clearError('privacy-consent');
            });
        }
    }

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();

        // Prevent double submission
        if (this.state.isSubmitting) return;

        console.log('📤 Form submitted');

        // Hide any previous messages
        this.hideMessages();

        // Validate form
        if (!this.validateAll()) {
            console.log('❌ Validation failed');
            this.scrollToFirstError();
            return;
        }

        // Get form data
        const formData = this.getFormData();
        console.log('📋 Form data collected:', formData);

        // Submit
        await this.submit(formData);
    }

    /**
     * Validate all fields
     */
    validateAll() {
        let isValid = true;

        // Required fields
        const requiredFields = [
            { id: 'first-name', name: 'First name', minLength: 2 },
            { id: 'last-name', name: 'Last name', minLength: 2 },
            { id: 'email', name: 'Email', type: 'email' },
            { id: 'phone', name: 'Phone', type: 'phone' },
            { id: 'company', name: 'Company', minLength: 2 },
            { id: 'project-type', name: 'Project type', type: 'select' },
            { id: 'message', name: 'Message', minLength: 10 }
        ];

        requiredFields.forEach(field => {
            if (!this.validateField(field.id)) {
                isValid = false;
            }
        });

        // Privacy consent
        const privacyBox = document.getElementById('privacy-consent');
        if (privacyBox && !privacyBox.checked) {
            this.showError('privacy-consent', 'You must agree to the privacy policy');
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
        // Phone validation
        else if (fieldId === 'phone' && value) {
            const phoneDigits = value.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                error = 'Please enter a valid phone number';
            }
        }
        // Minimum length
        else if (value && value.length < 2 && fieldId !== 'message') {
            error = 'Must be at least 2 characters';
        }
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
        return {
            firstName: document.getElementById('first-name')?.value.trim() || '',
            lastName: document.getElementById('last-name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            company: document.getElementById('company')?.value.trim() || '',
            projectType: document.getElementById('project-type')?.value || '',
            budget: document.getElementById('budget')?.value || 'Not specified',
            timeline: document.getElementById('timeline')?.value || 'Not specified',
            message: document.getElementById('message')?.value.trim() || '',
            timestamp: new Date().toISOString(),
            source: 'BuilderSolve Landing Page'
        };
    }

    /**
     * Submit form data
     */
    async submit(formData) {
        this.setLoading(true);

        try {
            console.log('📡 Sending to Formspree...');

            const response = await fetch(this.config.formspreeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Form submitted successfully!');
                this.handleSuccess(formData);
            } else {
                throw new Error(result.error || 'Submission failed');
            }

        } catch (error) {
            console.error('❌ Submission error:', error);
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle success
     */
    handleSuccess(formData) {
        // Show success message
        if (this.successMsg) {
            this.successMsg.classList.add('show');
            this.successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Reset form
        this.form.reset();

        // Track conversion
        this.trackConversion(formData);

        // Hide success message after 10 seconds
        setTimeout(() => {
            if (this.successMsg) {
                this.successMsg.classList.remove('show');
            }
        }, 10000);

        console.log('🎉 Success!');
    }

    /**
     * Handle error
     */
    handleError(error) {
        // Show error message
        if (this.errorMsg) {
            this.errorMsg.classList.add('show');
            this.errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Hide error message after 10 seconds
        setTimeout(() => {
            if (this.errorMsg) {
                this.errorMsg.classList.remove('show');
            }
        }, 10000);

        console.error('💥 Submission failed');
    }

    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.state.isSubmitting = isLoading;

        if (this.submitBtn) {
            if (isLoading) {
                this.submitBtn.classList.add('loading');
                this.submitBtn.disabled = true;
            } else {
                this.submitBtn.classList.remove('loading');
                this.submitBtn.disabled = false;
            }
        }
    }

    /**
     * Hide all messages
     */
    hideMessages() {
        if (this.successMsg) this.successMsg.classList.remove('show');
        if (this.errorMsg) this.errorMsg.classList.remove('show');
    }

    /**
     * Scroll to first error
     */
    scrollToFirstError() {
        const firstError = this.form.querySelector('.form-error.show');
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
    trackConversion(data) {
        console.log('📊 Tracking conversion:', data);

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'contact',
                event_label: data.projectType,
                value: 1
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Contact Form',
                content_category: 'Lead'
            });
        }

        // Custom event
        window.dispatchEvent(new CustomEvent('buildersolve:form:submitted', {
            detail: data
        }));
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContactForm();
    });
} else {
    new ContactForm();
}