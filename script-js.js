/**
 * =============================================================================
 * PORTFOLIO JAVASCRIPT
 * Interactive functionality for Mehmet Aydin's Product Designer Portfolio
 * =============================================================================
 */

// =============================================================================
// INITIALIZATION
// =============================================================================

// Set initial dark mode
if (!document.documentElement.classList.contains('dark')) {
  document.documentElement.classList.add('dark');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Initialize app if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// =============================================================================
// MAIN INITIALIZATION FUNCTION
// =============================================================================

function initializeApp() {
  console.log('🎨 Portfolio initialized');
  
  // Initialize all components
  initializeSelectionHighlight();
  initialize3DCardEffects();
  initializeFocusTrap();
  initializeEscapeKeyHandler();
  initializeProjectDrawers();
  initializeBioDrawer();
  initializeCarousel();
  initializeSkillModals();
  initializeThemeToggle();
  initializePerformanceOptimizations();
}

// =============================================================================
// SELECTION HIGHLIGHT SYSTEM
// =============================================================================

function initializeSelectionHighlight() {
  let currentSelectionColor = getRandomColor();
  
  document.addEventListener('mousedown', () => {
    currentSelectionColor = getRandomColor();
    updateSelectionStyle();
  });

  function updateSelectionStyle() {
    let styleTag = document.getElementById('dynamic-selection-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-selection-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      ::selection {
        background: ${currentSelectionColor};
        color: black;
      }
      html.dark ::selection {
        background: ${currentSelectionColor};
        color: black;
      }
    `;
  }

  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 80%)`;
  }
  
  // Initial update
  updateSelectionStyle();
}

// =============================================================================
// 3D CARD TILT EFFECTS
// =============================================================================

function initialize3DCardEffects() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      // Gentler rotation (reduced intensity)
      const rotateX = (mouseY / (rect.height / 2)) * -8;
      const rotateY = (mouseX / (rect.width / 2)) * 8;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// =============================================================================
// FOCUS TRAP IMPLEMENTATION
// =============================================================================

let currentFocusTrap = null;
const openModals = new Set();

function initializeFocusTrap() {
  // Focus trap utility is initialized but createFocusTrap function is defined globally
}

function createFocusTrap(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function trapFocus(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }

  container.addEventListener('keydown', trapFocus);
  if (firstElement) firstElement.focus();

  return () => container.removeEventListener('keydown', trapFocus);
}

// =============================================================================
// ESCAPE KEY HANDLER
// =============================================================================

function initializeEscapeKeyHandler() {
  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      // Close skill modals
      const openSkillModal = document.querySelector('[id$="Modal"]:not(.hidden)');
      if (openSkillModal && openSkillModal.id.includes('Modal')) {
        closeSkillModal(openSkillModal);
        return;
      }

      // Close project drawers
      const openProjectDrawer = document.querySelector('[id$="DrawerOverlay"]:not(.hidden)');
      if (openProjectDrawer) {
        const drawerId = openProjectDrawer.id.replace('Overlay', '');
        const drawer = document.getElementById(drawerId);
        if (drawer) {
          closeProjectDrawer(openProjectDrawer, drawer);
          return;
        }
      }

      // Close bio drawer
      const bioOverlay = document.getElementById('bioDrawerOverlay');
      if (bioOverlay && !bioOverlay.classList.contains('hidden')) {
        closeBioDrawer();
        return;
      }
    }
  }

  document.addEventListener('keydown', handleEscapeKey);
}

// =============================================================================
// MODAL AND DRAWER UTILITIES
// =============================================================================

function closeSkillModal(modal) {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  openModals.delete(modal.id);
  if (currentFocusTrap) {
    currentFocusTrap();
    currentFocusTrap = null;
  }
}

function closeProjectDrawer(overlay, drawer) {
  overlay.classList.add('hidden');
  drawer.classList.add('translate-y-full');
  document.body.style.overflow = '';
  openModals.delete(overlay.id);
  if (currentFocusTrap) {
    currentFocusTrap();
    currentFocusTrap = null;
  }
}

// =============================================================================
// PROJECT DRAWER FUNCTIONALITY
// =============================================================================

function initializeProjectDrawers() {
  const projects = ['pfizer', 'aiInitiative', 'verizon', 'bcg', 'pwc', 'coleHaan'];

  projects.forEach(project => {
    const openBtn = document.getElementById(`open${project.charAt(0).toUpperCase() + project.slice(1)}DrawerBtn`);
    const closeBtn = document.getElementById(`close${project.charAt(0).toUpperCase() + project.slice(1)}DrawerBtn`);
    const overlay = document.getElementById(`${project}DrawerOverlay`);
    const drawer = document.getElementById(`${project}Drawer`);

    if (openBtn && closeBtn && overlay && drawer) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.remove('hidden');
        drawer.classList.remove('translate-y-full');
        document.body.style.overflow = 'hidden';
        openModals.add(overlay.id);
        currentFocusTrap = createFocusTrap(drawer);
      });

      function closeDrawer() {
        closeProjectDrawer(overlay, drawer);
      }

      closeBtn.addEventListener('click', closeDrawer);
      overlay.addEventListener('click', closeDrawer);
    }
  });
}

// =============================================================================
// BIO DRAWER
// =============================================================================

function initializeBioDrawer() {
  const openBioDrawerBtn = document.getElementById('openBioDrawerBtn');
  const closeBioDrawerBtn = document.getElementById('closeBioDrawerBtn');
  const bioDrawerOverlay = document.getElementById('bioDrawerOverlay');
  const bioDrawer = document.getElementById('bioDrawer');

  if (openBioDrawerBtn && closeBioDrawerBtn && bioDrawerOverlay && bioDrawer) {
    openBioDrawerBtn.addEventListener('click', () => {
      bioDrawerOverlay.classList.remove('hidden');
      bioDrawer.classList.remove('translate-y-full');
      document.body.style.overflow = 'hidden';
      openModals.add('bioDrawerOverlay');
      currentFocusTrap = createFocusTrap(bioDrawer);
    });

    function closeBioDrawer() {
      bioDrawerOverlay.classList.add('hidden');
      bioDrawer.classList.add('translate-y-full');
      document.body.style.overflow = '';
      openModals.delete('bioDrawerOverlay');
      if (currentFocusTrap) {
        currentFocusTrap();
        currentFocusTrap = null;
      }
    }
    
    // Make closeBioDrawer available globally for escape key handler
    window.closeBioDrawer = closeBioDrawer;
    
    closeBioDrawerBtn.addEventListener('click', closeBioDrawer);
    bioDrawerOverlay.addEventListener('click', closeBioDrawer);
  }
}

// =============================================================================
// CAROUSEL LOGIC (DESKTOP ONLY)
// =============================================================================

function initializeCarousel() {
  const carousel = document.getElementById('projectCarousel');
  const leftBtn = document.getElementById('carouselLeft');
  const rightBtn = document.getElementById('carouselRight');
  
  if (carousel && leftBtn && rightBtn) {
    let isScrolling = false;

    function updateArrows() {
      // Only run carousel logic on desktop
      if (window.innerWidth < 1024) {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
        return;
      }

      if (isScrolling) return;
      
      const scrollLeft = carousel.scrollLeft;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const threshold = 10;
      
      // Show/hide left arrow
      if (scrollLeft > threshold) {
        leftBtn.classList.remove('hidden');
      } else {
        leftBtn.classList.add('hidden');
      }
      
      // Show/hide right arrow
      if (maxScroll > threshold) {
        if (scrollLeft >= maxScroll - threshold) {
          rightBtn.classList.add('hidden');
        } else {
          rightBtn.classList.remove('hidden');
        }
      } else {
        rightBtn.classList.add('hidden');
      }
    }
    
    carousel.addEventListener('scroll', () => {
      if (window.innerWidth >= 1024 && !isScrolling) {
        requestAnimationFrame(updateArrows);
      }
    });
    
    rightBtn.addEventListener('click', () => {
      if (window.innerWidth < 1024) return;
      isScrolling = true;
      carousel.scrollBy({ left: carousel.clientWidth * 0.8, behavior: 'smooth' });
      setTimeout(() => {
        isScrolling = false;
        updateArrows();
      }, 500);
    });
    
    leftBtn.addEventListener('click', () => {
      if (window.innerWidth < 1024) return;
      isScrolling = true;
      carousel.scrollBy({ left: -carousel.clientWidth * 0.8, behavior: 'smooth' });
      setTimeout(() => {
        isScrolling = false;
        updateArrows();
      }, 500);
    });
    
    // Initial state and resize handling
    const updateArrowsDebounced = debounce(updateArrows, 100);
    updateArrows();
    window.addEventListener('resize', updateArrowsDebounced);
  }
}

// =============================================================================
// SKILL MODALS
// =============================================================================

function initializeSkillModals() {
  const skillModals = {
    'figmaSkill': 'figmaModal',
    'sketchSkill': 'sketchModal',
    'adobeXdSkill': 'adobeXdModal',
    'photoshopSkill': 'photoshopModal',
    'illustratorSkill': 'illustratorModal',
    'htmlCssSkill': 'htmlCssModal',
    'javascriptSkill': 'javascriptModal',
    'userResearchSkill': 'userResearchModal',
    'prototypingSkill': 'prototypingModal',
    'designSystemsSkill': 'designSystemsModal',
    'accessibilitySkill': 'accessibilityModal',
    'agileSkill': 'agileModal'
  };

  // Add click event listeners to skill tags
  Object.keys(skillModals).forEach(skillId => {
    const skillElement = document.getElementById(skillId);
    const modalElement = document.getElementById(skillModals[skillId]);
    
    if (skillElement && modalElement) {
      skillElement.addEventListener('click', () => {
        modalElement.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        openModals.add(modalElement.id);
        currentFocusTrap = createFocusTrap(modalElement);
      });
    }
  });

  // Add click event listeners to close buttons
  document.querySelectorAll('.close-skill-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      const modal = e.target.closest('[id$="Modal"]');
      if (modal) {
        closeSkillModal(modal);
      }
    });
  });

  // Close skill modals when clicking on overlay
  document.querySelectorAll('[id$="Modal"]').forEach(modal => {
    if (Object.values(skillModals).includes(modal.id)) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeSkillModal(modal);
        }
      });
    }
  });
}

// =============================================================================
// THEME TOGGLE
// =============================================================================

function initializeThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const toggleCircle = document.getElementById('toggleCircle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  
  if (themeToggle && toggleCircle && sunIcon && moonIcon) {
    function updateThemeToggle() {
      const isDark = document.documentElement.classList.contains('dark');
      
      if (isDark) {
        toggleCircle.style.transform = 'translateX(38px)';
        sunIcon.style.opacity = '0.3';
        moonIcon.style.opacity = '1';
      } else {
        toggleCircle.style.transform = 'translateX(0)';
        sunIcon.style.opacity = '1';
        moonIcon.style.opacity = '0.3';
      }
    }
    
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      document.documentElement.classList.toggle('dark');
      updateThemeToggle();
      
      // Safe localStorage usage
      try {
        const isDark = document.documentElement.classList.contains('dark');
        if (typeof Storage !== 'undefined') {
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
      } catch (e) {
        console.warn('localStorage not available:', e);
      }
    });
    
    // Load saved theme preference safely
    try {
      if (typeof Storage !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
          document.documentElement.classList.remove('dark');
        } else if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (e) {
      console.warn('Could not load theme from localStorage:', e);
    }
    
    // Initial update
    updateThemeToggle();
  }
}

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

function initializePerformanceOptimizations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements for fade-in animation
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// =============================================================================
// CONSOLE STYLING (DEVELOPMENT)
// =============================================================================

if (typeof console !== 'undefined') {
  console.log(
    '%c🎨 Portfolio Loaded Successfully! %c\n' +
    'Built with ❤️ for Mehmet Aydin\n' +
    'Design System: Custom + Tailwind CSS\n' +
    'Interactions: Vanilla JavaScript',
    'color: #3b82f6; font-size: 16px; font-weight: bold;',
    'color: #6b7280; font-size: 12px;'
  );
}

// =============================================================================
// EXPORT FOR TESTING (IF NEEDED)
// =============================================================================

// Uncomment if you need to test functions externally
// window.PortfolioApp = {
//   initializeApp,
//   createFocusTrap,
//   closeSkillModal,
//   closeProjectDrawer
// };