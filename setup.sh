#!/bin/bash

# BuilderSolve Landing Page - Empty Structure Creation Script
echo "🚀 Creating BuilderSolve Landing Page Structure..."

# Create main project directory
mkdir -p buildersolve-landing
cd buildersolve-landing

echo "📁 Creating directories..."

# Assets directories
mkdir -p assets/images/dashboard-screenshots
mkdir -p assets/images/icons
mkdir -p assets/images/backgrounds
mkdir -p assets/fonts
mkdir -p assets/videos

# CSS directory
mkdir -p css

# JS directory
mkdir -p js

# Sections directories
mkdir -p sections/hero
mkdir -p sections/problem-solution
mkdir -p sections/dashboard-showcase
mkdir -p sections/key-features
mkdir -p sections/social-proof
mkdir -p sections/final-cta
mkdir -p sections/contact-form

# Components directories
mkdir -p components/navigation
mkdir -p components/footer
mkdir -p components/buttons

echo "📄 Creating empty files..."

# Main files
touch index.html
touch contact.html

# Global CSS files
touch css/global.css
touch css/animations.css
touch css/responsive.css

# Global JS files
touch js/main.js
touch js/animations.js
touch js/utils.js

# Section files
touch sections/hero/hero.html
touch sections/hero/hero.css
touch sections/hero/hero.js

touch sections/problem-solution/problem-solution.html
touch sections/problem-solution/problem-solution.css
touch sections/problem-solution/problem-solution.js

touch sections/dashboard-showcase/dashboard-showcase.html
touch sections/dashboard-showcase/dashboard-showcase.css
touch sections/dashboard-showcase/dashboard-showcase.js

touch sections/key-features/key-features.html
touch sections/key-features/key-features.css
touch sections/key-features/key-features.js

touch sections/social-proof/social-proof.html
touch sections/social-proof/social-proof.css
touch sections/social-proof/social-proof.js

touch sections/final-cta/final-cta.html
touch sections/final-cta/final-cta.css
touch sections/final-cta/final-cta.js

touch sections/contact-form/contact-form.html
touch sections/contact-form/contact-form.css
touch sections/contact-form/contact-form.js

# Component files
touch components/navigation/nav.html
touch components/navigation/nav.css
touch components/navigation/nav.js

touch components/footer/footer.html
touch components/footer/footer.css
touch components/footer/footer.js

touch components/buttons/cta-buttons.html
touch components/buttons/cta-buttons.css
touch components/buttons/cta-buttons.js

echo "✅ Structure created successfully!"
echo "📂 Project location: $(pwd)"
echo ""
echo "📋 Created folders:"
echo "   - assets/ (images, fonts, videos)"
echo "   - css/ (global styles)"
echo "   - js/ (global scripts)"
echo "   - sections/ (6 sections + contact)"
echo "   - components/ (navigation, footer, buttons)"
echo ""
echo "🎯 Ready to build your insane landing page!"