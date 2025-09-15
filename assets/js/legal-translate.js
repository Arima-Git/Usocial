// Initialize Google Translate
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,zh-CN,hi,ja,es,fr,pt,ko',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
    }, 'google_translate_element');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing legal translation system');
    const langButtons = document.querySelectorAll('.lang-btn');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    console.log(`Found ${langButtons.length} language buttons`);

    // Language mapping for display text
    const languageDisplayMap = {
        'en': 'English',
        'zh-CN': '普通话',
        'hi': 'हिंदी',
        'ja': '日本語',
        'es': 'Español',
        'fr': 'Français',
        'pt': 'Português',
        'ko': '한국인'
    };

    // Get the stored language from localStorage
    const storedLang = localStorage.getItem('selectedLanguage') || 'en';
    
    // Set the initial active state based on stored language
    langButtons.forEach(button => {
        if (button.getAttribute('data-lang') === storedLang) {
            button.classList.add('active');
        }
    });

    function updateButtonUI(lang) {
        console.log(`Updating button UI for language: ${lang}`);
        
        // Update all language buttons
        langButtons.forEach(btn => {
            const isActive = btn.dataset.lang === lang;
            btn.classList.toggle('active', isActive);
            console.log(`Button ${btn.dataset.lang}: ${isActive ? 'active' : 'inactive'}`);
        });

        // Update dropdown toggle text and icon
        if (dropdownToggle) {
            const textCell = dropdownToggle.querySelector('.text-cell span');
            const iconCell = dropdownToggle.querySelector('.icon-cell img');
            
            if (textCell) {
                textCell.textContent = languageDisplayMap[lang] || 'English';
            }
            
            if (iconCell) {
                // Update icon based on language
                const flagMap = {
                    'en': 'assets/images/flags/globe-dropdown.png',
                    'zh-CN': 'assets/images/flags/Chinese.png',
                    'hi': 'assets/images/flags/Hindi.png',
                    'ja': 'assets/images/flags/Japanese.png',
                    'es': 'assets/images/flags/Spanish.png',
                    'fr': 'assets/images/flags/French.png',
                    'pt': 'assets/images/flags/portugues.png',
                    'ko': 'assets/images/flags/koriean.png'
                };
                
                if (flagMap[lang]) {
                    iconCell.src = flagMap[lang];
                    iconCell.alt = languageDisplayMap[lang] || 'Language';
                }
            }
        }
        
        localStorage.setItem('selectedLanguage', lang);
    }

    // Translation function using a combination of cookies and URL parameters
    function translateWithGoogleParams(lang) {
        console.log(`Translating page to: ${lang}`);
        
        // Update UI first
        updateButtonUI(lang);

        // Clear all existing translation cookies
        const domains = [
            window.location.hostname,
            `.${window.location.hostname}`,
            window.location.hostname.split('.')[0],
            `.${window.location.hostname.split('.')[0]}`
        ];

        domains.forEach(domain => {
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain}; path=/`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain}; path=/;`;
        });

        // Set new translation cookies
        const cookieValue = `/auto/${lang}`;
        domains.forEach(domain => {
            document.cookie = `googtrans=${cookieValue}; domain=${domain}; path=/`;
        });

        // Force Google Translate to recognize the change
        if (window.google && window.google.translate) {
            const select = document.querySelector('.goog-te-combo');
            if (select) {
                select.value = lang;
                select.dispatchEvent(new Event('change'));
            }
        }

        // Reload the page with the translation parameter
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('#')[0].split('?')[0];
        const newUrl = `${baseUrl}?googtrans=/auto/${lang}#googtrans(auto|${lang})`;
        
        // Only reload if the URL is different
        if (currentUrl !== newUrl) {
            window.location.href = newUrl;
        }
    }

    // Add click handlers to language buttons
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            console.log(`Language button clicked: ${lang}`);
            translateWithGoogleParams(lang);
        });
    });

    // Apply saved language on page load
    window.addEventListener('load', () => {
        console.log('Window loaded - checking saved language');
        
        // Get language from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('googtrans') ? urlParams.get('googtrans').split('/')[2] : null;
        const savedLang = localStorage.getItem('selectedLanguage');
        const currentLang = urlLang || savedLang || 'en';
        
        console.log(`Current language state - URL: ${urlLang}, Saved: ${savedLang}, Using: ${currentLang}`);
        
        // Update UI to match current language
        updateButtonUI(currentLang);
        
        // If no translation is active, apply the saved language
        if (!urlLang && savedLang && savedLang !== 'en') {
            setTimeout(() => {
                translateWithGoogleParams(savedLang);
            }, 500);
        }
    });
}); 