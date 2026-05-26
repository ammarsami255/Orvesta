// R237 Project Details Interactivity and Image Lightbox

document.addEventListener('DOMContentLoaded', () => {
    initFloorTabs();
    initLightbox();
    initInquiryModal();
});

/**
 * Floor Navigation Tabs
 */
function initFloorTabs() {
    const tabs = document.querySelectorAll('.floor-tab');
    const panels = document.querySelectorAll('.floor-panel');
    const indicator = document.querySelector('.tab-indicator');

    if (!tabs.length || !indicator) return;

    // Helper to update the sliding line indicator position
    function updateIndicator(activeTab) {
        indicator.style.width = `${activeTab.offsetWidth}px`;
        indicator.style.left = `${activeTab.offsetLeft}px`;
    }

    // Set initial position of indicator
    const initialActive = document.querySelector('.floor-tab.active');
    if (initialActive) {
        // Wait briefly for layout styles to load completely
        setTimeout(() => updateIndicator(initialActive), 100);
    }

    // Tab click handler
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;

            // Update tab states
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateIndicator(tab);

            // Get target floor
            const targetFloor = tab.getAttribute('data-floor');
            const targetPanel = document.getElementById(`panel-${targetFloor}`);

            // Fade out current active panel
            const currentActivePanel = document.querySelector('.floor-panel.active');
            if (currentActivePanel) {
                currentActivePanel.style.opacity = '0';
                currentActivePanel.style.transform = 'translateY(15px)';
                
                setTimeout(() => {
                    currentActivePanel.classList.remove('active');
                    
                    // Show new panel
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                        // Force reflow
                        targetPanel.offsetHeight;
                        targetPanel.style.opacity = '1';
                        targetPanel.style.transform = 'translateY(0)';
                    }
                }, 300); // matches transition time
            } else {
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.opacity = '1';
                    targetPanel.style.transform = 'translateY(0)';
                }
            }
        });
    });

    // Recalculate indicator position on window resize
    window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.floor-tab.active');
        if (activeTab) {
            updateIndicator(activeTab);
        }
    });
}

/**
 * Fullscreen Lightbox with Pinch, Zoom, and Pan
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxWrapper = document.getElementById('lightbox-wrapper');
    
    // Zoom controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');

    // Trigger buttons from floor plans
    const triggers = document.querySelectorAll('.unit-overlay');

    if (!lightbox || !lightboxImg || !lightboxCaption || !lightboxClose) return;

    // Lightbox zoom and pan state variables
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // Touch gesture state variables
    let initialTouchDistance = 0;
    let initialTouchScale = 1;

    // Reset zoom & translation transforms
    function resetImageTransforms() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransforms();
    }

    // Apply scale & pan styles to lightbox image
    function applyTransforms() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        if (scale > 1) {
            lightboxImg.style.cursor = 'grab';
        } else {
            lightboxImg.style.cursor = 'default';
        }
    }

    // Open lightbox
    triggers.forEach(trigger => {
        // Skip opening lightbox if card is sold out
        if (trigger.closest('.sold-out-card')) return;

        trigger.addEventListener('click', (e) => {
            const card = trigger.closest('.unit-card');
            const originalImg = card.querySelector('.unit-image') || trigger.previousElementSibling;
            const title = card.querySelector('.unit-title')?.textContent || 'Floor Plan';

            if (!originalImg) return;

            // Set images and captions
            lightboxImg.src = originalImg.src;
            lightboxCaption.textContent = title;

            // Show lightbox
            lightbox.classList.add('active');
            document.body.classList.add('no-scroll');

            resetImageTransforms();
        });
    });

    // Close lightbox functions
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300); // clear image after transition
    }

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on clicking backdrop
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxWrapper) {
            closeLightbox();
        }
    });

    // Close on ESC keypress
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Mouse Wheel Zoom
    lightboxWrapper.addEventListener('wheel', (e) => {
        if (!lightbox.classList.contains('active')) return;
        e.preventDefault();

        const zoomIntensity = 0.05;
        const previousScale = scale;

        // Calculate zoom direction
        if (e.deltaY < 0) {
            scale += zoomIntensity * scale;
        } else {
            scale -= zoomIntensity * scale;
        }

        // Clamp scale [1, 5]
        scale = Math.min(Math.max(scale, 1), 5);

        // If zoom is reset to 1, center offsets
        if (scale === 1) {
            translateX = 0;
            translateY = 0;
        } else {
            // Adjust offsets slightly relative to mouse cursor to zoom where cursor is
            const rect = lightboxImg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            const scaleRatio = scale / previousScale - 1;

            translateX -= mouseX * scaleRatio;
            translateY -= mouseY * scaleRatio;
        }

        applyTransforms();
    }, { passive: false });

    // Drag Panning
    lightboxImg.addEventListener('mousedown', (e) => {
        if (scale <= 1) return;
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lightboxImg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || scale <= 1) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyTransforms();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            lightboxImg.style.cursor = scale > 1 ? 'grab' : 'default';
        }
    });

    // Zoom Buttons
    zoomInBtn.addEventListener('click', () => {
        scale = Math.min(scale + 0.5, 5);
        applyTransforms();
    });

    zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(scale - 0.5, 1);
        if (scale === 1) {
            translateX = 0;
            translateY = 0;
        }
        applyTransforms();
    });

    zoomResetBtn.addEventListener('click', () => {
        resetImageTransforms();
    });

    // Touch Support: Mobile Swipe & Pinch to Zoom
    lightboxWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Pinch zoom setup
            initialTouchDistance = getTouchDistance(e.touches[0], e.touches[1]);
            initialTouchScale = scale;
        } else if (e.touches.length === 1 && scale > 1) {
            // Drag pan setup
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    });

    lightboxWrapper.addEventListener('touchmove', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            if (initialTouchDistance > 0) {
                const touchRatio = currentDistance / initialTouchDistance;
                scale = Math.min(Math.max(initialTouchScale * touchRatio, 1), 5);
                applyTransforms();
            }
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            applyTransforms();
        }
    });

    lightboxWrapper.addEventListener('touchend', (e) => {
        isDragging = false;
        if (e.touches.length < 2) {
            initialTouchDistance = 0;
        }
    });

    // Distance calculator helper
    function getTouchDistance(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * Unit Inquiry Modal Prefill and Submit
 */
function initInquiryModal() {
    const modal = document.getElementById('inquiry-modal');
    const modalClose = document.getElementById('inquiry-close');
    const form = document.getElementById('inquiry-form');
    const messageField = document.getElementById('modal-message');
    const submitBtn = document.getElementById('inquiry-submit-btn');
    const statusDiv = document.getElementById('inquiry-form-status');

    if (!modal || !form || !messageField || !submitBtn || !statusDiv) return;

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Google Sheets endpoint URL (same as form.js)
    const URL = "https://script.google.com/macros/s/AKfycbzfZzRY_0sBJ7O-GYioHD5kZwFEoWJzbLsXb0vOVW1s2y4DJIChwxyL54foUMaf9Rchhg/exec";

    // Bind cta-btn clicks on all unit cards
    const ctaBtns = document.querySelectorAll('.cta-btn');
    ctaBtns.forEach(btn => {
        // Skip disabled buttons (like sold out units)
        if (btn.hasAttribute('disabled')) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const card = btn.closest('.unit-card') || btn.closest('.unit-card.duplex-combined');
            if (!card) return;

            const unitTitle = card.querySelector('.unit-title')?.textContent || 'Unit';
            const panel = card.closest('.floor-panel');
            let floorName = 'Ground';
            
            if (panel) {
                const id = panel.id;
                if (id.includes('first')) floorName = 'First';
                if (id.includes('second')) floorName = 'Second';
                if (id.includes('third')) floorName = 'Third';
            }

            // Prefill query message
            messageField.value = `I am interested in requesting details for: ${unitTitle} on the ${floorName} Floor of project R237. Please send me more information.`;

            // Open modal
            modal.classList.add('active');
            document.body.classList.add('no-scroll');
            statusDiv.textContent = ''; // Clear previous statuses
        });
    });

    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    modalClose.addEventListener('click', closeModal);

    // Close on clicking backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('inquiry-modal-content')) {
            // Skip if clicked inside form wrapper
            return;
        }
        if (e.target.closest('.inquiry-modal-content')) return;
        closeModal();
    });

    // Close on ESC keypress
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('modal-name').value;
        const email = document.getElementById('modal-email').value;
        const phone = document.getElementById('modal-phone').value;
        const message = messageField.value;

        if (!name || !email || !message) {
            statusDiv.textContent = 'Please fill out all required fields.';
            statusDiv.style.color = '#ff6b6b';
            return;
        }

        // UI loading
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.style.opacity = '0.7';
        submitBtn.style.pointerEvents = 'none';
        statusDiv.textContent = "Sending...";
        statusDiv.style.color = "var(--color-gold)";

        try {
            await fetch(URL, {
                method: "POST",
                mode: "no-cors",
                body: new URLSearchParams({
                    name,
                    email,
                    phone,
                    message
                })
            });

            statusDiv.textContent = "Sent successfully";
            statusDiv.style.color = "green";

            form.reset();
            
            // Auto close modal after brief delay
            setTimeout(() => {
                closeModal();
                statusDiv.textContent = '';
            }, 2000);

        } catch (err) {
            statusDiv.textContent = "Error sending";
            statusDiv.style.color = "red";
        }

        // Restore UI state
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
    });
}
