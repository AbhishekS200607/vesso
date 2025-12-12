// Affiliate links configuration
const REDIRECT_MAP = {
    credit_card: "https://sales.gromo.in/gp-website/g/O8p6lft3uNYNfc8DSTq9h",
    bank_account: "https://sales.gromo.in/gp-website/g/O8p6lft3uNYNfc8DSTq9h",
    demat: "https://sales.gromo.in/gp-website/g/O8p6lft3uNYNfc8DSTq9h",
    loan: "https://sales.gromo.in/gp-website/g/O8p6lft3uNYNfc8DSTq9h",
    default: "https://sales.gromo.in/gp-website/g/O8p6lft3uNYNfc8DSTq9h"
};

const PRODUCT_LABELS = {
    credit_card: "Credit Card",
    bank_account: "Bank Account (Savings/Salary)",
    demat: "Demat / Investing",
    loan: "Loan (Personal/Business)"
};

// Global variables
let currentStep = 1;
let formData = {};

// Update sidebar step indicators
function updateSidebarSteps() {
    document.querySelectorAll('.step-item').forEach((item, index) => {
        item.classList.toggle('active', index + 1 === currentStep);
    });
}

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showFinder() {
    showPage('finder-page');
    trackEvent('finder_started');
}

// Form step navigation
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const stepIndicator = document.getElementById('current-step');
    
    progressFill.style.width = `${(currentStep / 3) * 100}%`;
    stepIndicator.textContent = currentStep;
}

function showStep(step) {
    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    if (step === 'loading') {
        document.getElementById('loading-step').classList.add('active');
        currentStep = 3;
    } else if (step === 'results') {
        document.getElementById('results-step').classList.add('active');
        currentStep = 3;
    } else if (step === 'age-restriction') {
        document.getElementById('age-restriction-step').classList.add('active');
        // Don't update currentStep for age restriction
    } else {
        document.getElementById(`step-${step}`).classList.add('active');
        currentStep = step;
    }
    
    updateSidebarSteps();
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep === 1) {
            // Update user name in step 2
            document.getElementById('user-name').textContent = formData.name;
            showStep(2);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const name = document.getElementById('name').value.trim();
        const age = document.getElementById('age').value;
        
        if (!name) {
            alert('Please enter your name');
            return false;
        }
        if (!age) {
            alert('Please enter your age');
            return false;
        }
        if (age < 18) {
            formData.name = name;
            formData.age = parseInt(age);
            showStep('age-restriction');
            return false;
        }
        
        formData.name = name;
        formData.age = parseInt(age);
        return true;
    }
    
    if (currentStep === 2) {
        const product = document.querySelector('input[name="product"]:checked');
        if (!product) {
            alert('Please select a product');
            return false;
        }
        
        formData.product = product.value;
        return true;
    }
    
    return true;
}

// Form submission
document.getElementById('finder-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const product = document.querySelector('input[name="product"]:checked');
    if (!product) {
        alert('Please select a product');
        return;
    }
    
    formData.product = product.value;
    
    // Show loading step
    showStep('loading');
    trackEvent('form_submitted', formData);
    
    // Simulate processing delay
    setTimeout(() => {
        showResults();
    }, 1500);
});

function showResults() {
    const recommendation = getRecommendation();
    
    document.getElementById('result-title').textContent = recommendation.title;
    document.getElementById('result-button').textContent = recommendation.buttonText;
    
    showStep('results');
    trackEvent('results_shown', formData);
}

function getRecommendation() {
    const { name, age, product } = formData;
    
    // Age gating logic for credit cards
    if (product === 'credit_card' && age < 18) {
        return {
            title: `${name}, we found a better option for you`,
            buttonText: "View Student Accounts",
            url: REDIRECT_MAP.bank_account
        };
    }
    
    const productTitles = {
        credit_card: "Best Credit Card",
        bank_account: "Best Savings Account", 
        demat: "Best Investment Account",
        loan: "Best Personal Loan"
    };
    
    return {
        title: `${productTitles[product]} for You`,
        buttonText: "Apply Now",
        url: REDIRECT_MAP[product]
    };
}

function redirectToAffiliate() {
    const recommendation = getRecommendation();
    trackEvent('affiliate_click', { product: formData.product, url: recommendation.url });
    window.open(recommendation.url, '_blank');
}

// Analytics tracking (mock)
function trackEvent(event, data) {
    console.log('Event:', event, data);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    showPage('landing-page');
    updateSidebarSteps();
});