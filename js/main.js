// Main JavaScript entry point
import { initAnimations } from './animations.js';
import { initFilters } from './filters.js';
import { initForm } from './form.js';

document.addEventListener('DOMContentLoaded', () => {
    // initCursor();
    initNavbar();
    
    // Initialize modules
    initAnimations();
    initFilters();
    initForm();
    initMobileMenu();
});

// Custom Cursor Implementation
function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .project-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    
    // Hide cursor when it leaves the window
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
        }
    });
    
    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
    });
}

// Navbar Scroll Effect
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');
    
    if (!toggle || !navLinks) return;
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    // Close menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
}
