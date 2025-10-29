/**
 * Trade School Submission Form - Client-side Validation and API Integration
 */

// Configuration
const RECAPTCHA_SITE_KEY = 'YOUR_RECAPTCHA_SITE_KEY'; // Replace with actual key from Google reCAPTCHA console
const API_ENDPOINT = '/api/schools/submit';

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFormHandlers();
});

function initializeFormHandlers() {
    // Show/hide "Other Program" field based on checkbox
    const programOtherCheckbox = document.getElementById('programOtherCheckbox');
    if (programOtherCheckbox) {
        programOtherCheckbox.addEventListener('change', function(e) {
            const otherGroup = document.getElementById('programOtherGroup');
            if (otherGroup) {
                otherGroup.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }

    // Character counter for description
    const descriptionField = document.getElementById('schoolDescription');
    if (descriptionField) {
        descriptionField.addEventListener('input', function(e) {
            const count = e.target.value.length;
            const counter = document.getElementById('descriptionCount');
            if (counter) counter.textContent = count;
        });
    }

    // Phone number formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            if (value.length >= 6) {
                e.target.value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
            } else if (value.length >= 3) {
                e.target.value = `(${value.slice(0,3)}) ${value.slice(3)}`;
            } else if (value.length > 0) {
                e.target.value = value;
            }
        });
    }

    // ZIP code formatting
    const zipField = document.getElementById('zipCode');
    if (zipField) {
        zipField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) value = value.slice(0, 9);
            if (value.length > 5) {
                e.target.value = `${value.slice(0,5)}-${value.slice(5)}`;
            } else {
                e.target.value = value;
            }
        });
    }

    // Real-time validation for required fields
    const requiredFields = ['schoolName', 'streetAddress', 'city', 'state', 'zipCode', 'contactEmail', 'phone'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    showError(fieldId, 'This field is required');
                } else if (this.validity && !this.validity.valid) {
                    showError(fieldId, 'Please enter a valid value');
                } else {
                    clearError(fieldId);
                }
            });

            field.addEventListener('input', function() {
                if (this.value.trim() && (!this.validity || this.validity.valid)) {
                    clearError(fieldId);
                }
            });
        }
    });

    // Form submission handler
    const form = document.getElementById('schoolSubmissionForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// Field validation helpers
function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) {
        inputEl.classList.add('error');
        inputEl.classList.remove('success');
    }
}

function clearError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) {
        inputEl.classList.remove('error');
        inputEl.classList.add('success');
    }
}

function showMessage(type, message) {
    const successEl = document.getElementById('formSuccessMessage');
    const errorEl = document.getElementById('formErrorMessage');

    if (type === 'success') {
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
            successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (errorEl) errorEl.style.display = 'none';
    } else {
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (successEl) successEl.style.display = 'none';
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (successEl) successEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
    }, 10000);
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();

    // Clear previous messages
    const successEl = document.getElementById('formSuccessMessage');
    const errorEl = document.getElementById('formErrorMessage');
    if (successEl) successEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    // Clear all errors
    const requiredFields = ['schoolName', 'streetAddress', 'city', 'state', 'zipCode', 'contactEmail', 'phone'];
    requiredFields.forEach(fieldId => {
        const errorElField = document.getElementById(`${fieldId}-error`);
        const inputElField = document.getElementById(fieldId);
        if (errorElField) errorElField.textContent = '';
        if (inputElField) inputElField.classList.remove('error', 'success');
    });
    clearError('programs');
    clearError('programOther');

    // Validate all fields
    let hasErrors = false;

    // Check required text fields
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            showError(fieldId, 'This field is required');
            hasErrors = true;
        } else if (field && field.validity && !field.validity.valid) {
            showError(fieldId, 'Please enter a valid value');
            hasErrors = true;
        }
    });

    // Check programs
    const programCheckboxes = document.querySelectorAll('input[name="programs"]:checked');
    if (programCheckboxes.length === 0) {
        showError('programs', 'Please select at least one program');
        hasErrors = true;
    }

    // Check "Other" program field if selected
    const otherCheckbox = document.getElementById('programOtherCheckbox');
    const otherInput = document.getElementById('programOther');
    if (otherCheckbox && otherCheckbox.checked && otherInput && !otherInput.value.trim()) {
        showError('programOther', 'Please specify the other program');
        hasErrors = true;
    }

    if (hasErrors) {
        showMessage('error', 'Please fix the errors above and try again.');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitBtnLoading = document.getElementById('submitBtnLoading');
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtnText) submitBtnText.style.display = 'none';
    if (submitBtnLoading) submitBtnLoading.style.display = 'inline';

    try {
        // Get reCAPTCHA token
        let recaptchaToken = '';
        if (typeof grecaptcha !== 'undefined' && RECAPTCHA_SITE_KEY !== 'YOUR_RECAPTCHA_SITE_KEY') {
            recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
        } else {
            // For testing without reCAPTCHA - remove in production
            console.warn('reCAPTCHA not configured. Using test token.');
            recaptchaToken = 'test-token';
        }

        // Collect form data
        const programs = Array.from(programCheckboxes).map(cb => cb.value);
        const formData = {
            schoolName: document.getElementById('schoolName').value.trim(),
            streetAddress: document.getElementById('streetAddress').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value.trim(),
            contactEmail: document.getElementById('contactEmail').value.trim().toLowerCase(),
            phone: document.getElementById('phone').value.trim(),
            website: document.getElementById('website') ? document.getElementById('website').value.trim() : '',
            programs: programs,
            programOther: (otherCheckbox && otherCheckbox.checked && otherInput) ? otherInput.value.trim() : '',
            schoolDescription: document.getElementById('schoolDescription') ? document.getElementById('schoolDescription').value.trim() : '',
            submitterName: document.getElementById('submitterName') ? document.getElementById('submitterName').value.trim() : '',
            recaptchaToken: recaptchaToken
        };

        // Submit to API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success
            showMessage('success', result.message || 'Thank you! Your school submission has been received and will be reviewed shortly.');

            // Reset form
            document.getElementById('schoolSubmissionForm').reset();
            if (document.getElementById('programOtherGroup')) {
                document.getElementById('programOtherGroup').style.display = 'none';
            }
            if (document.getElementById('descriptionCount')) {
                document.getElementById('descriptionCount').textContent = '0';
            }

            // Clear success/error classes from all fields
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.classList.remove('success', 'error');
                }
            });
        } else {
            // Error from server
            if (result.errors) {
                // Show field-specific errors
                Object.entries(result.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                        showError(field, messages[0]);
                    }
                });
            }
            showMessage('error', result.error || 'Submission failed. Please check the form and try again.');
        }
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
        // Reset button state
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnText) submitBtnText.style.display = 'inline';
        if (submitBtnLoading) submitBtnLoading.style.display = 'none';
    }
}
