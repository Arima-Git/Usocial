// Function to load carousel images
function loadCarouselImages() {
    const carousels = [
        {
            id: 'carousel1',
            folder: 'assets/images/carousel1'
        },
        {
            id: 'carousel2',
            folder: 'assets/images/carousel2'
        }
    ];

    // Update the mobile breakpoint to match CSS media query (992px)
    const isMobile = window.innerWidth < 992;
    
    console.log("Screen width:", window.innerWidth, "isMobile:", isMobile);

    carousels.forEach(carousel => {
        const carouselElement = document.getElementById(carousel.id);
        if (!carouselElement) {
            console.error(`Carousel element with id "${carousel.id}" not found`);
            return; // Skip if element doesn't exist
        }

        console.log(`Found carousel: ${carousel.id}, dimensions:`, 
            carouselElement.offsetWidth, 'x', carouselElement.offsetHeight);

        // Apply basic styling
        carouselElement.style.position = 'relative';
        carouselElement.style.overflow = 'hidden';
        carouselElement.style.borderRadius = '10px';
        carouselElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        carouselElement.style.backgroundColor = '#f8f8f8'; // Light background to ensure visibility

        // Clear existing images
        carouselElement.innerHTML = '';

        if (isMobile) {
            // Mobile approach
            loadMobileCarousel(carouselElement, carousel);
        } else {
            // Desktop approach
            loadDesktopImages(carouselElement, carousel);
        }
    });

    // Original desktop loading method - with fixed transitions
    function loadDesktopImages(carouselElement, carousel) {
        // Use actual filenames for each carousel
        let filenames = [];
        if (carousel.id === 'carousel1') {
            filenames = [
                '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg'
            ];
        } else if (carousel.id === 'carousel2') {
            filenames = [
                '1.jpeg', '2.jpeg', '3.jpeg', '4.jpg', '5.jpg', '6.jpg', '7.jpeg', '8.jpeg', '9.jpeg', '10.jpeg', '11.jpeg'
            ];
        }

        function loadImage(filename) {
            return new Promise(resolve => {
                    const img = document.createElement('img');
                const path = `${carousel.folder}/${filename}`;
                    console.log("Attempting to load desktop image:", path);
                    img.src = path;

                    img.onload = () => {
                        console.log("Successfully loaded:", path);
                    img.alt = `${carousel.id} image ${filename}`;
                        img.style.position = 'absolute';
                        img.style.top = '0';
                        img.style.left = '0';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.5s ease-in-out';
                        resolve(img);
                    };

                    img.onerror = () => {
                        console.log("Failed to load:", path);
                    resolve(null);
                    };
            });
        }

        console.log("Loading desktop carousel images for", carousel.id);
        Promise.all(filenames.map(loadImage)).then(images => {
            const imageElements = images.filter(img => img !== null);
            console.log("Successfully loaded", imageElements.length, "images for", carousel.id);

            imageElements.forEach(img => {
                carouselElement.appendChild(img);
            });

            if (imageElements.length > 0) {
                imageElements[0].style.opacity = '1';
            } else {
                // No images found
                console.warn("No images found for", carousel.id);
                const noImagesDiv = document.createElement('div');
                noImagesDiv.textContent = 'No images found';
                noImagesDiv.style.position = 'absolute';
                noImagesDiv.style.top = '50%';
                noImagesDiv.style.left = '50%';
                noImagesDiv.style.transform = 'translate(-50%, -50%)';
                noImagesDiv.style.color = '#1D40CA';
                noImagesDiv.style.fontWeight = 'bold';
                carouselElement.appendChild(noImagesDiv);
                return;
            }

            if (imageElements.length > 1) {
                let currentIndex = 0;
                setInterval(() => {
                    // Store current and calculate next index
                    const currentImg = imageElements[currentIndex];
                    const nextIndex = (currentIndex + 1) % imageElements.length;
                    const nextImg = imageElements[nextIndex];
                    
                    // Make next image visible
                    nextImg.style.opacity = '1';
                    
                    // Hide current image
                    currentImg.style.opacity = '0';
                    
                    // Update index
                    currentIndex = nextIndex;
                }, 5000);
            }
        });
    }

    // Enhanced mobile carousel with better error handling and file type support
    function loadMobileCarousel(carouselElement, carousel) {
        console.log("Loading mobile carousel for", carousel.id);
        
        // Ensure the carousel element has explicit dimensions and styling
        carouselElement.style.width = '100%';
        carouselElement.style.height = '300px'; // Explicit height for mobile
        carouselElement.style.display = 'block';
        carouselElement.style.minHeight = '200px'; // Ensure minimum height
        
        // Add a loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.id = `${carousel.id}-loading`;
        loadingDiv.textContent = 'Loading...';
        loadingDiv.style.position = 'absolute';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.color = '#1D40CA';
        loadingDiv.style.fontWeight = 'bold';
        loadingDiv.style.fontSize = '16px';
        loadingDiv.style.padding = '10px 20px';
        loadingDiv.style.backgroundColor = 'rgba(255,255,255,0.8)';
        loadingDiv.style.borderRadius = '5px';
        loadingDiv.style.zIndex = '10';
        carouselElement.appendChild(loadingDiv);

        // Track loaded images for this carousel
        const loadedImages = [];
        let currentImageIndex = 0;
        
        // Try to load image 1 first (most important)
        loadMobileImage(1)
            .then(startRotationIfMultipleImages)
            .catch(handleLoadError);

        // Function to load a mobile image with multiple format support
        function loadMobileImage(index) {
            return new Promise((resolve, reject) => {
                const extensions = ['.jpg', '.jpeg', '.png']; // Try jpg/jpeg first as they're typically smaller
                let currentExtension = 0;
                
                function tryNextExtension() {
                    if (currentExtension >= extensions.length) {
                        reject(new Error(`Failed to load image ${index} with any extension`));
                        return;
                    }
                    
                    const extension = extensions[currentExtension];
                    const cacheBuster = `?t=${Date.now()}`;
                    const path = `${carousel.folder}/${index}${extension}${cacheBuster}`;
                    
                    console.log(`Trying to load mobile image: ${path}`);
                    updateLoadingText(`Loading image ${index}...`);
                    
                    const img = new Image();
                    
                    const timeoutId = setTimeout(() => {
                        console.log(`Timeout loading: ${path}`);
                        img.onload = null;
                        img.onerror = null;
                        currentExtension++;
                        tryNextExtension();
                    }, 10000); // 10 second timeout per attempt
                    
                    img.onload = function() {
                        clearTimeout(timeoutId);
                        console.log(`✓ Successfully loaded: ${path}`);
                        
                        img.alt = `${carousel.id} image ${index}`;
                        img.style.position = 'absolute';
                        img.style.top = '0';
                        img.style.left = '0';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.8s ease-in-out';
                        img.style.zIndex = '5';
                        
                        loadedImages.push(img);
                        carouselElement.appendChild(img);
                        
                        resolve(img);
                    };
                    
                    img.onerror = function() {
                        clearTimeout(timeoutId);
                        console.log(`✗ Failed to load: ${path}`);
                        currentExtension++;
                        tryNextExtension();
                    };
                    
                    img.src = path;
                }
                
                tryNextExtension();
            });
        }
        
        // Update loading text
        function updateLoadingText(text) {
            const loadingEl = document.getElementById(`${carousel.id}-loading`);
            if (loadingEl) loadingEl.textContent = text;
        }
        
        // Start loading additional images in sequence
        function startRotationIfMultipleImages(firstImage) {
            // Make the first image visible
            firstImage.style.opacity = '1';
            
            // Hide loading indicator once first image is shown
            const loadingEl = document.getElementById(`${carousel.id}-loading`);
            if (loadingEl && loadingEl.parentNode) {
                loadingEl.parentNode.removeChild(loadingEl);
            }
            
            // Load 1 more image for mobile (2 total)
            loadNextImage(2);
            
            // Start rotation if we have multiple images
            startCheckingForRotation();
        }
        
        // Load the next image in sequence
        function loadNextImage(index) {
            if (index > 11) return; // Limit to 3 images max on mobile
            
            loadMobileImage(index)
                .then(() => {
                    // Load next image with delay
                    setTimeout(() => loadNextImage(index + 1), 1000);
                })
                .catch(() => {
                    console.log(`Could not load image ${index}, trying next one`);
                    setTimeout(() => loadNextImage(index + 1), 500);
                });
        }
        
        // Start rotation when we have at least 2 images
        function startCheckingForRotation() {
            if (loadedImages.length >= 2) {
                startRotation();
            } else {
                // Check again in a second
                setTimeout(startCheckingForRotation, 1000);
            }
        }
        
        // Start rotation between images
        function startRotation() {
            setInterval(() => {
                if (loadedImages.length < 2) return;
                
                // Hide current, show next
                loadedImages[currentImageIndex].style.opacity = '0';
                currentImageIndex = (currentImageIndex + 1) % loadedImages.length;
                loadedImages[currentImageIndex].style.opacity = '1';
                
            }, 4000); // Faster rotation for mobile
        }
        
        // Handle initial load error
        function handleLoadError(error) {
            console.error("Mobile carousel loading error:", error);
            updateLoadingText('Could not load images');
            
            // Try fallback to load image 2 instead
            loadMobileImage(2)
                .then(startRotationIfMultipleImages)
                .catch(() => {
                    // If that fails, try image 3
                    loadMobileImage(3)
                        .then(startRotationIfMultipleImages)
                        .catch(() => {
                            updateLoadingText('No images available');
                        });
                });
        }
    }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousels
    loadCarouselImages();
    
    // Handle window resize for carousel responsiveness
    let lastWidth = window.innerWidth;
    const mobileBreakpoint = 992;
    
    window.addEventListener('resize', () => {
        // Only reload carousel if crossing the mobile breakpoint
        const newWidth = window.innerWidth;
        const wasMobile = lastWidth < mobileBreakpoint;
        const isMobileNow = newWidth < mobileBreakpoint;
        
        if (wasMobile !== isMobileNow) {
            console.log("Breakpoint crossed, reloading carousels");
            loadCarouselImages();
        }
        
        lastWidth = newWidth;
    });

    // Email validation
    const emailInput = document.getElementById('emailInput');
    const submitButton = document.getElementById('submitEmail');
    const termsCheck = document.getElementById('termsCheck');
    const emailError = document.getElementById('emailError');
    const emailSuccess = document.getElementById('emailSuccess');
    const form = document.querySelector('.email-form');

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateForm() {
        const email = emailInput.value.trim();
        emailError.textContent = '';
        emailSuccess.textContent = '';

        if (!termsCheck.checked) {
            emailError.textContent = 'Please agree to ÜLO\s Terms and Conditions and Privacy Policy.';
            return false;
        }

        if (!email) {
            emailError.textContent = 'Please enter your email address.';
            return false;
        }

        if (!isValidEmail(email)) {
            emailError.textContent = 'Please enter a valid email address.';
            return false;
        }

        return true;
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (validateForm()) {
            const email = emailInput.value.trim().toLowerCase();
            
            try {
                // Show loading state
                submitButton.disabled = true;
                emailError.textContent = '';
                emailSuccess.textContent = 'Registering...';
                
                console.log('Submitting email:', email);
                
                // Format the request exactly like the Lambda test event
                const requestBody = {
                    httpMethod: "POST",
                    body: JSON.stringify({ email: email }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
                
                console.log('Request body:', JSON.stringify(requestBody));
                
                try {
                    const response = await fetch('https://itt48a2pwa.execute-api.us-west-1.amazonaws.com/prod/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Origin': 'https://www.ulo.social'
                        },
                        body: JSON.stringify(requestBody)
                    });
                    
                    console.log('Response status:', response.status);
                    
                    const text = await response.text();
                    console.log('Raw response:', text);
                    
                    // Clear the "Registering..." message
                    emailSuccess.textContent = '';
                    
                    try {
                        // First parse
                        const parsed = JSON.parse(text);
                        console.log('First parse:', parsed);
                        
                        // Second parse of the body
                        const result = JSON.parse(parsed.body);
                        console.log('Final parsed result:', result);
                        
                        if (result.success === true) {
                            console.log('Operation successful:', result.message);
                            // Save to localStorage as backup
                            const storedEmails = JSON.parse(localStorage.getItem('subscribedEmails') || '[]');
                            if (!storedEmails.includes(email)) {
                                storedEmails.push(email);
                                localStorage.setItem('subscribedEmails', JSON.stringify(storedEmails));
                            }
                            
                            emailError.textContent = ''; // Clear any error message
                            emailSuccess.textContent = result.message || 'Thank you for registering! We will notify you on app store release!';
                            emailInput.value = '';
                            termsCheck.checked = false;
                        } else {
                            console.log('Operation returned success false:', result.message);
                            emailSuccess.textContent = ''; // Clear any success message
                            emailError.textContent = result.message || 'An error occurred. Please try again.';
                        }
                    } catch (parseError) {
                        console.error('Error parsing response:', parseError);
                        emailSuccess.textContent = ''; // Clear any success message
                        emailError.textContent = 'An error occurred while processing the response. Please try again.';
                    } finally {
                        submitButton.disabled = false;
                    }
                } catch (error) {
                    console.error('Network or other error:', error);
                    emailError.textContent = 'A network error occurred. Please check your connection and try again.';
                }
            } catch (error) {
                console.error('Network or other error:', error);
                emailError.textContent = 'A network error occurred. Please check your connection and try again.';
            }
        }
    });

    submitButton.addEventListener('click', e => {
        e.preventDefault();
        // Trigger the form submission event
        form.dispatchEvent(new Event('submit'));
    });

    emailInput.addEventListener('input', () => {
        emailError.textContent = '';
    });

    emailInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Cookie popup
    if (!document.cookie.includes('cookieConsent=')) {
        document.getElementById('cookieConsentPopup').classList.add('show');
    }

    window.acceptCookies = function () {
        document.cookie = "cookieConsent=accepted; max-age=31536000; path=/";
        document.getElementById('cookieConsentPopup').classList.remove('show');
    };

    window.rejectCookies = function () {
        document.cookie = "cookieConsent=rejected; max-age=31536000; path=/";
        document.getElementById('cookieConsentPopup').classList.remove('show');
    };

    window.hideCookiePopup = function () {
        document.getElementById('cookieConsentPopup').classList.remove('show');
    };

    // Hidden admin feature to view all stored emails
    let keySequence = '';
    document.addEventListener('keydown', function(e) {
        // Update the key sequence (only keep the last 10 keystrokes)
        keySequence += e.key;
        if (keySequence.length > 10) {
            keySequence = keySequence.substring(keySequence.length - 10);
        }
        
        // Check for the secret key combination "viewemails"
        if (keySequence.includes('viewemails')) {
            // Reset the sequence
            keySequence = '';
            
            // Display emails
            showStoredEmails();
        }
    });

    // Function to display stored emails
    function showStoredEmails() {
        try {
            const storedEmails = JSON.parse(localStorage.getItem('subscribedEmails') || '[]');
            
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            overlay.style.zIndex = '1000';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            
            // Create modal container
            const modal = document.createElement('div');
            modal.style.backgroundColor = 'white';
            modal.style.padding = '30px';
            modal.style.borderRadius = '10px';
            modal.style.width = '80%';
            modal.style.maxWidth = '600px';
            modal.style.maxHeight = '80vh';
            modal.style.overflowY = 'auto';
            modal.style.position = 'relative';
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '10px';
            closeBtn.style.right = '15px';
            closeBtn.style.border = 'none';
            closeBtn.style.background = 'none';
            closeBtn.style.fontSize = '24px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
            
            // Create heading
            const heading = document.createElement('h2');
            heading.textContent = 'Stored Emails';
            heading.style.marginTop = '0';
            heading.style.marginBottom = '20px';
            heading.style.color = '#1D40CA';
            
            // Create email count
            const count = document.createElement('p');
            count.textContent = `Total emails: ${storedEmails.length}`;
            count.style.marginBottom = '20px';
            count.style.fontWeight = 'bold';
            
            // Create email list
            const list = document.createElement('ul');
            list.style.listStyleType = 'none';
            list.style.padding = '0';
            list.style.margin = '0';
            
            if (storedEmails.length === 0) {
                const noEmails = document.createElement('p');
                noEmails.textContent = 'No emails stored yet.';
                list.appendChild(noEmails);
            } else {
                storedEmails.forEach((email, index) => {
                    const item = document.createElement('li');
                    item.textContent = `${index + 1}. ${email}`;
                    item.style.padding = '8px 0';
                    item.style.borderBottom = '1px solid #eee';
                    list.appendChild(item);
                });
            }
            
            // Create export button
            const exportBtn = document.createElement('button');
            exportBtn.textContent = 'Export Emails (CSV)';
            exportBtn.style.backgroundColor = '#1D40CA';
            exportBtn.style.color = 'white';
            exportBtn.style.border = 'none';
            exportBtn.style.padding = '10px 15px';
            exportBtn.style.borderRadius = '5px';
            exportBtn.style.marginTop = '20px';
            exportBtn.style.cursor = 'pointer';
            exportBtn.addEventListener('click', () => {
                exportEmailsCSV(storedEmails);
            });
            
            // Assemble modal
            modal.appendChild(closeBtn);
            modal.appendChild(heading);
            modal.appendChild(count);
            modal.appendChild(list);
            modal.appendChild(exportBtn);
            overlay.appendChild(modal);
            
            // Add to document
            document.body.appendChild(overlay);
        } catch (error) {
            console.error('Error displaying stored emails:', error);
            alert('Error displaying stored emails. See console for details.');
        }
    }

    // Function to export emails as CSV
    function exportEmailsCSV(emails) {
        try {
            if (emails.length === 0) {
                alert('No emails to export.');
                return;
            }
            
            // Create CSV content
            const csvContent = 'Email\n' + emails.join('\n');
            
            // Create a blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `ulo_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Error exporting emails:', error);
            alert('Error exporting emails. See console for details.');
        }
    }
});
