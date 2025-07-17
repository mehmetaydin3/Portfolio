// Set initial theme based on localStorage or default to dark
try {
  if (typeof Storage !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Default to dark mode if no preference saved
      document.documentElement.classList.add('dark');
    }
  } else {
    // Default to dark mode if localStorage not available
    document.documentElement.classList.add('dark');
  }
} catch (e) {
  console.warn('Could not load theme from localStorage:', e);
  document.documentElement.classList.add('dark');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Global authentication state
let isAuthenticated = false;

function initializeApp() {
  // === Selection Highlight ===
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
  updateSelectionStyle();

  // === Initialize Smart Scrollbars ===
  initializeSmartScrollbars();
  
  // === Initialize TOC Scroll Highlighting (delayed to ensure drawers are set up) ===
  setTimeout(initializeTocScrollHighlighting, 100);
  
  // === 3D Card Tilt Effect (Ultra Smooth) ===
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    let isHovering = false;
    let animationFrameId = null;
    let cardRect = null;
    
    function updateCardRect() {
      if (card && card.getBoundingClientRect) {
        cardRect = card.getBoundingClientRect();
      }
    }
    
    function resetCardTransform() {
      card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.willChange = 'auto';
    }
    
    function applyTiltTransform(mouseX, mouseY) {
      if (!cardRect) return;
      
      // Calculate relative position within the card (0 to 1)
      const relativeX = (mouseX - cardRect.left) / cardRect.width;
      const relativeY = (mouseY - cardRect.top) / cardRect.height;
      
      // Clamp values to prevent extreme transforms
      const clampedX = Math.max(0, Math.min(1, relativeX));
      const clampedY = Math.max(0, Math.min(1, relativeY));
      
      // Calculate rotation with reduced intensity
      const rotateY = (clampedX - 0.5) * 12; // Max 6 degrees in each direction
      const rotateX = (clampedY - 0.5) * -12; // Max 6 degrees in each direction
      
      // Apply transform with hardware acceleration
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    }
    
    card.addEventListener('mouseenter', (e) => {
      isHovering = true;
      updateCardRect();
      card.style.transition = 'none';
      card.style.willChange = 'transform';
      card.classList.add('hover-active');
    });

    card.addEventListener('mousemove', (e) => {
      if (!isHovering || !cardRect) return;
      
      // Cancel previous animation frame to prevent stacking
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Use requestAnimationFrame for smooth 60fps updates
      animationFrameId = requestAnimationFrame(() => {
        // Check if still hovering (prevents race conditions)
        if (!isHovering) return;
        
        applyTiltTransform(e.clientX, e.clientY);
      });
    });
    
    card.addEventListener('mouseleave', (e) => {
      isHovering = false;
      cardRect = null;
      
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Reset card to original state
      resetCardTransform();
      card.classList.remove('hover-active');
    });
    
    // Handle window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        if (isHovering) {
          updateCardRect();
        }
      }, 100);
    });
  });

  // === Focus Trap Implementation ===
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

  // === Scroll Lock Functions ===
  let scrollPosition = 0;

  function lockBodyScroll() {
    scrollPosition = window.pageYOffset;
    console.log('Locking body scroll at position:', scrollPosition);
    // Store the scroll position in a CSS custom property
    document.body.style.setProperty('--scroll-position', `-${scrollPosition}px`);
    document.body.classList.add('drawer-open');
    // Disable scroll on html and body
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockBodyScroll() {
    console.log('Unlocking body scroll, returning to position:', scrollPosition);
    document.body.classList.remove('drawer-open');
    document.body.style.removeProperty('--scroll-position');
    // Re-enable scroll
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollPosition);
  }

  // === Consolidated Escape Key Handler ===
  let currentFocusTrap = null;
  const openModals = new Set();
  
  // Define hidePasswordModal function early so it can be used in escape handler
  function hidePasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
      passwordModal.classList.add('hidden');
      unlockBodyScroll();
    }
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      // Close password modal
      const passwordModal = document.getElementById('passwordModal');
      if (passwordModal && !passwordModal.classList.contains('hidden')) {
        hidePasswordModal();
        return;
      }

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

  function closeSkillModal(modal) {
    modal.classList.add('hidden');
    unlockBodyScroll();
    openModals.delete(modal.id);
    if (currentFocusTrap) {
      currentFocusTrap();
      currentFocusTrap = null;
    }
  }

  function closeProjectDrawer(overlay, drawer) {
    // Reset the transform to slide drawer down
    drawer.style.transform = 'translateX(-50%) translateY(100%)';
    
    // Hide elements after animation
    setTimeout(() => {
      overlay.classList.add('hidden');
      drawer.classList.add('hidden');
    }, 500);
    
    unlockBodyScroll();
    openModals.delete(overlay.id);
    if (currentFocusTrap) {
      currentFocusTrap();
      currentFocusTrap = null;
    }
  }

  // === Project Drawer Functionality ===
  const projects = ['pfizer', 'aiInitiative', 'verizon', 'bcg', 'pwc', 'coleHaan'];
  const protectedProjects = ['pfizer', 'aiInitiative', 'verizon'];
  const correctPassword = 'pw2025';
  let pendingProject = null;

  // Password modal elements
  const passwordModal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('passwordInput');
  const passwordError = document.getElementById('passwordError');
  const submitPasswordBtn = document.getElementById('submitPassword');
  const cancelPasswordBtn = document.getElementById('cancelPassword');
  const closePasswordModalBtn = document.getElementById('closePasswordModal');

  function showPasswordModal(project) {
    pendingProject = project;
    passwordModal.classList.remove('hidden');
    passwordInput.value = '';
    passwordError.classList.add('hidden');
    lockBodyScroll();
    setTimeout(() => passwordInput.focus(), 100);
  }

  // Update the hidePasswordModal function to include all cleanup
  hidePasswordModal = function() {
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    
    if (passwordModal) {
      passwordModal.classList.add('hidden');
    }
    unlockBodyScroll();
    pendingProject = null;
    if (passwordInput) {
      passwordInput.value = '';
    }
    if (passwordError) {
      passwordError.classList.add('hidden');
    }
  };

  function validatePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    
    if (!passwordInput) {
      console.error('Password input not found');
      return;
    }
    
    const enteredPassword = passwordInput.value;
    console.log('Validating password. Entered:', enteredPassword, 'Expected:', correctPassword);
    console.log('Pending project:', pendingProject);
    
    if (enteredPassword === correctPassword) {
      console.log('Password correct, hiding modal and opening project');
      isAuthenticated = true;
      removeLockIcons();
      const projectToOpen = pendingProject;
      hidePasswordModal();
      openProject(projectToOpen);
    } else {
      console.log('Password incorrect');
      if (passwordError) {
        passwordError.classList.remove('hidden');
      }
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  function openProject(project) {
    const overlay = document.getElementById(`${project}DrawerOverlay`);
    const drawer = document.getElementById(`${project}Drawer`);
    
    if (overlay && drawer) {
      // Show overlay and drawer
      overlay.classList.remove('hidden');
      drawer.classList.remove('hidden');
      
      // Force a reflow to ensure the initial state is applied
      drawer.offsetHeight;
      
      // Slide the drawer up by setting transform directly
      drawer.style.transform = 'translateX(-50%) translateY(0)';
      
      lockBodyScroll();
      openModals.add(overlay.id);
      currentFocusTrap = createFocusTrap(drawer);
    }
  }

  function removeLockIcons() {
    // Remove lock icons from all protected project cards
    const pfizerCard = document.getElementById('openPfizerDrawerBtn');
    const publicisCard = document.getElementById('openAiInitiativeDrawerBtn');
    const verizonCard = document.getElementById('openVerizonDrawerBtn');
    
    [pfizerCard, publicisCard, verizonCard].forEach(card => {
      if (card) {
        const lockIcon = card.querySelector('.absolute.top-4.left-6');
        if (lockIcon) {
          lockIcon.remove();
        }
      }
    });
  }

  function restoreLockIcons() {
    // Ensure lock icons are present on protected project cards
    const pfizerCard = document.getElementById('openPfizerDrawerBtn');
    const publicisCard = document.getElementById('openAiInitiativeDrawerBtn');
    const verizonCard = document.getElementById('openVerizonDrawerBtn');
    
    [pfizerCard, publicisCard, verizonCard].forEach(card => {
      if (card) {
        // Check if lock icon already exists
        const existingLock = card.querySelector('.absolute.top-4.left-6');
        if (!existingLock) {
          // Create and add lock icon
          const lockIcon = document.createElement('div');
          lockIcon.className = 'absolute top-4 left-6 text-lg z-10';
          lockIcon.textContent = '🔐';
          card.appendChild(lockIcon);
        }
      }
    });
  }

  // Password modal event listeners
  if (submitPasswordBtn) {
    submitPasswordBtn.addEventListener('click', validatePassword);
  }

  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        validatePassword();
      }
    });
  }

  if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener('click', hidePasswordModal);
  }

  if (closePasswordModalBtn) {
    closePasswordModalBtn.addEventListener('click', hidePasswordModal);
  }

  if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) {
        hidePasswordModal();
      }
    });
  }

  projects.forEach(project => {
    const openBtn = document.getElementById(`open${project.charAt(0).toUpperCase() + project.slice(1)}DrawerBtn`);
    const closeBtn = document.getElementById(`close${project.charAt(0).toUpperCase() + project.slice(1)}DrawerBtn`);
    const overlay = document.getElementById(`${project}DrawerOverlay`);
    const drawer = document.getElementById(`${project}Drawer`);
    
    if (openBtn && closeBtn && overlay && drawer) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if this project requires password protection
        if (protectedProjects.includes(project) && !isAuthenticated) {
          showPasswordModal(project);
        } else {
          openProject(project);
        }
      });

      function closeDrawer() {
        closeProjectDrawer(overlay, drawer);
      }

      closeBtn.addEventListener('click', closeDrawer);
      overlay.addEventListener('click', closeDrawer);
    }
  });

  // === Bio Drawer ===
  const openBioDrawerBtn = document.getElementById('openBioDrawerBtn');
  const closeBioDrawerBtn = document.getElementById('closeBioDrawerBtn');
  const bioDrawerOverlay = document.getElementById('bioDrawerOverlay');
  const bioDrawer = document.getElementById('bioDrawer');

  if (openBioDrawerBtn && closeBioDrawerBtn && bioDrawerOverlay && bioDrawer) {
    openBioDrawerBtn.addEventListener('click', () => {
      bioDrawerOverlay.classList.remove('hidden');
      bioDrawer.classList.remove('translate-y-full');
      lockBodyScroll();
      openModals.add('bioDrawerOverlay');
      currentFocusTrap = createFocusTrap(bioDrawer);
    });

    function closeBioDrawer() {
      bioDrawerOverlay.classList.add('hidden');
      bioDrawer.classList.add('translate-y-full');
      unlockBodyScroll();
      openModals.delete('bioDrawerOverlay');
      if (currentFocusTrap) {
        currentFocusTrap();
        currentFocusTrap = null;
      }
    }
    
    closeBioDrawerBtn.addEventListener('click', closeBioDrawer);
    bioDrawerOverlay.addEventListener('click', closeBioDrawer);
  }


  // === Project Carousel Logic ===
  const carousel = document.getElementById('projectCarousel');
  const leftBtn = document.getElementById('projectLeftBtn');
  const rightBtn = document.getElementById('projectRightBtn');
  
  if (carousel && leftBtn && rightBtn) {
    let isScrolling = false;
    let hasUserScrolledRight = false;

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
      
      // Show right arrow (remove display none)
      rightBtn.style.display = 'flex';
      
      // Left arrow logic: only show if user has scrolled right before
      if (hasUserScrolledRight) {
        leftBtn.style.display = 'flex';
        // Hide/show based on position when user has scrolled before
        if (scrollLeft <= threshold) {
          leftBtn.classList.add('hidden');
        } else {
          leftBtn.classList.remove('hidden');
        }
      } else {
        // Never show left arrow until user has scrolled right
        leftBtn.style.display = 'none';
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
      hasUserScrolledRight = true; // Mark that user has scrolled right
      isScrolling = true;
      const scrollAmount = carousel.clientWidth * 0.8;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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

  // === Testimonials Carousel Logic ===
  const testimonialsCarousel = document.getElementById('testimonialsCarousel');
  const testimonialsLeftBtn = document.getElementById('testimonialsLeftBtn');
  const testimonialsRightBtn = document.getElementById('testimonialsRightBtn');
  
  if (testimonialsCarousel && testimonialsLeftBtn && testimonialsRightBtn) {
    let isTestimonialsScrolling = false;
    let hasUserScrolledTestimonialsRight = false;

    function updateTestimonialsArrows() {
      // Only run carousel logic on desktop
      if (window.innerWidth < 768) {
        testimonialsLeftBtn.style.display = 'none';
        testimonialsRightBtn.style.display = 'none';
        return;
      }

      if (isTestimonialsScrolling) return;
      
      const scrollLeft = testimonialsCarousel.scrollLeft;
      const maxScroll = testimonialsCarousel.scrollWidth - testimonialsCarousel.clientWidth;
      const threshold = 10;
      
      // Show right arrow (remove display none)
      testimonialsRightBtn.style.display = 'flex';
      
      // Only show left arrow if user has scrolled right before
      if (hasUserScrolledTestimonialsRight) {
        testimonialsLeftBtn.style.display = 'flex';
      } else {
        testimonialsLeftBtn.style.display = 'none';
      }
      
      // Show/hide left arrow (only if user has scrolled right)
      if (hasUserScrolledTestimonialsRight && scrollLeft > threshold) {
        testimonialsLeftBtn.classList.remove('hidden');
      } else {
        testimonialsLeftBtn.classList.add('hidden');
      }
      
      // Show/hide right arrow
      if (maxScroll > threshold) {
        if (scrollLeft >= maxScroll - threshold) {
          testimonialsRightBtn.classList.add('hidden');
        } else {
          testimonialsRightBtn.classList.remove('hidden');
        }
      } else {
        testimonialsRightBtn.classList.add('hidden');
      }
    }
    
    testimonialsCarousel.addEventListener('scroll', () => {
      if (window.innerWidth >= 768 && !isTestimonialsScrolling) {
        requestAnimationFrame(updateTestimonialsArrows);
      }
    });
    
    testimonialsRightBtn.addEventListener('click', () => {
      if (window.innerWidth < 768) return;
      hasUserScrolledTestimonialsRight = true; // Mark that user has scrolled right
      isTestimonialsScrolling = true;
      testimonialsCarousel.scrollBy({ left: 400, behavior: 'smooth' });
      setTimeout(() => {
        isTestimonialsScrolling = false;
        updateTestimonialsArrows();
      }, 500);
    });
    
    testimonialsLeftBtn.addEventListener('click', () => {
      if (window.innerWidth < 768) return;
      isTestimonialsScrolling = true;
      testimonialsCarousel.scrollBy({ left: -400, behavior: 'smooth' });
      setTimeout(() => {
        isTestimonialsScrolling = false;
        updateTestimonialsArrows();
      }, 500);
    });
    
    // Initial state and resize handling
    const updateTestimonialsArrowsDebounced = debounce(updateTestimonialsArrows, 100);
    updateTestimonialsArrows();
    window.addEventListener('resize', updateTestimonialsArrowsDebounced);
  }

  // === Skill Modals ===
  const skillModals = {
    'conceptDevelopmentSkill': 'conceptDevelopmentModal',
    'interactionDesignSkill': 'interactionDesignModal',
    'serviceDesignSkill': 'serviceDesignModal',
    'dataDrivenDesignSkill': 'dataDrivenDesignModal',
    'accessibilitySkill': 'accessibilityModal',
    'agileSkill': 'agileModal',
    'crossTeamCollaborationSkill': 'crossTeamCollaborationModal',
    'userResearchSkill': 'userResearchModal',
    'usabilityTestingSkill': 'usabilityTestingModal',
    'heuristicEvaluationSkill': 'heuristicEvaluationModal',
    'journeyMappingSkill': 'journeyMappingModal',
    'competitiveAnalysisSkill': 'competitiveAnalysisModal',
    'artificialIntelligenceSkill': 'artificialIntelligenceModal',
    'figmaSkill': 'figmaModal',
    'adobeCsSkill': 'adobeCsModal',
    'htmlSkill': 'htmlCssModal',
    'cssSkill': 'htmlCssModal',
    'javascriptSkill': 'javascriptModal',
    'vscodeSkill': 'vscodeModal',
    'cursorAiSkill': 'cursorAiModal',
    'claudeCodeSkill': 'claudeCodeModal',
    'githubSkill': 'githubModal'
  };

  // Add click event listeners to skill tags
  Object.keys(skillModals).forEach(skillId => {
    const skillElement = document.getElementById(skillId);
    const modalElement = document.getElementById(skillModals[skillId]);
    
    if (skillElement && modalElement) {
      skillElement.addEventListener('click', () => {
        modalElement.classList.remove('hidden');
        lockBodyScroll();
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

  // === Dual Toggle Theme Switch ===
  const toggleSlider = document.getElementById('toggleSlider');
  const lightModeBtn = document.getElementById('lightModeBtn');
  const darkModeBtn = document.getElementById('darkModeBtn');
  
  // Global functions for theme switching
  window.setLightMode = function() {
    document.documentElement.classList.remove('dark');
    updateTogglePosition();
    saveTheme('light');
  };
  
  window.setDarkMode = function() {
    document.documentElement.classList.add('dark');
    updateTogglePosition();
    saveTheme('dark');
  };
  
  function updateTogglePosition() {
    const isDark = document.documentElement.classList.contains('dark');
    if (toggleSlider) {
      if (isDark) {
        toggleSlider.style.transform = 'translateX(32px)'; // Move to cover light mode button
      } else {
        toggleSlider.style.transform = 'translateX(0)'; // Move to cover dark mode button
      }
    }
  }
  
  function saveTheme(theme) {
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
  
  // Initialize theme on load
  if (toggleSlider) {
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
    
    // Set initial toggle position
    updateTogglePosition();
  }

  // === Performance optimization: Intersection Observer ===
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

  // Ensure lock icons are present on page load
  restoreLockIcons();

  // === Parallax Scroll Effect ===
  const parallaxImage = document.getElementById('parallaxImage');
  const parallaxContainer = document.getElementById('parallaxContainer');
  
  if (parallaxImage && parallaxContainer) {
    function updateParallaxEffect() {
      const scrolled = window.pageYOffset;
      const parallaxSection = parallaxContainer.closest('section');
      
      if (parallaxSection) {
        const sectionTop = parallaxSection.offsetTop;
        const sectionBottom = sectionTop + parallaxSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Check if section is in viewport
        if (scrolled + windowHeight > sectionTop && scrolled < sectionBottom) {
          // Calculate parallax offset - image moves slower than scroll (0.5x speed)
          const parallaxSpeed = 0.5;
          const yPos = (scrolled - sectionTop) * parallaxSpeed;
          
          // Apply transform
          parallaxImage.style.transform = `translateY(${yPos}px)`;
        }
      }
    }
    
    // Throttled scroll event for better performance
    let ticking = false;
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateParallaxEffect);
        ticking = true;
        setTimeout(() => { ticking = false; }, 16); // ~60fps
      }
    }
    
    window.addEventListener('scroll', requestTick);
    updateParallaxEffect(); // Initial call
  }
}

// === Smart Drawer Scrollbar ===
function initializeSmartScrollbars() {
  const drawers = document.querySelectorAll('.drawer-container');
  
  drawers.forEach(drawer => {
    // Function to check scroll position and toggle scrollbar
    function toggleScrollbar() {
      const scrollTop = drawer.scrollTop;
      const scrollThreshold = 50; // Hide scrollbar when within 50px of top
      
      if (scrollTop > scrollThreshold) {
        drawer.classList.add('show-scrollbar');
      } else {
        drawer.classList.remove('show-scrollbar');
      }
    }
    
    // Add scroll event listener
    drawer.addEventListener('scroll', debounce(toggleScrollbar, 10));
    
    // Initial check
    toggleScrollbar();
  });
}

// === Table of Contents Smooth Scrolling ===
function scrollToSection(sectionId) {
  try {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.warn(`Section with ID "${sectionId}" not found`);
      return;
    }

  // Find the active drawer container
  const activeDrawer = document.querySelector('.drawer-container:not(.hidden)');
  if (!activeDrawer) {
    console.warn('No active drawer found');
    return;
  }

  // Calculate the section's position relative to the drawer container
  const drawerRect = activeDrawer.getBoundingClientRect();
  const sectionRect = section.getBoundingClientRect();
  
  // Calculate the scroll position considering the sticky TOC header (approximately 80px)
  const tocHeaderHeight = 80;
  const targetScrollTop = activeDrawer.scrollTop + (sectionRect.top - drawerRect.top) - tocHeaderHeight;

  // Smooth scroll to the target section
  activeDrawer.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  });

    // Update active TOC button
    updateActiveTocButton(sectionId, activeDrawer);
  } catch (error) {
    console.error('Error in scrollToSection:', error);
  }
}

function updateActiveTocButton(sectionId, activeDrawer) {
  // Remove active state from all TOC buttons in this drawer
  const tocButtons = activeDrawer.querySelectorAll('.toc-btn');
  tocButtons.forEach(btn => {
    btn.classList.remove('bg-blue-100', 'dark:bg-blue-900', 'text-blue-700', 'dark:text-blue-300',
                          'bg-purple-100', 'dark:bg-purple-900', 'text-purple-700', 'dark:text-purple-300',
                          'bg-red-100', 'dark:bg-red-900', 'text-red-700', 'dark:text-red-300',
                          'bg-emerald-100', 'dark:bg-emerald-900', 'text-emerald-700', 'dark:text-emerald-300',
                          'bg-orange-100', 'dark:bg-orange-900', 'text-orange-700', 'dark:text-orange-300');
    btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  });

  // Add active state to the current button
  const activeButton = activeDrawer.querySelector(`[onclick="scrollToSection('${sectionId}')"]`);
  if (activeButton) {
    activeButton.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
    
    // Apply appropriate active colors based on drawer type
    if (sectionId.startsWith('pfizer-')) {
      activeButton.classList.add('bg-blue-100', 'dark:bg-blue-900', 'text-blue-700', 'dark:text-blue-300');
    } else if (sectionId.startsWith('ai-')) {
      activeButton.classList.add('bg-purple-100', 'dark:bg-purple-900', 'text-purple-700', 'dark:text-purple-300');
    } else if (sectionId.startsWith('verizon-')) {
      activeButton.classList.add('bg-red-100', 'dark:bg-red-900', 'text-red-700', 'dark:text-red-300');
    } else if (sectionId.startsWith('bcg-')) {
      activeButton.classList.add('bg-emerald-100', 'dark:bg-emerald-900', 'text-emerald-700', 'dark:text-emerald-300');
    } else if (sectionId.startsWith('pwc-')) {
      activeButton.classList.add('bg-orange-100', 'dark:bg-orange-900', 'text-orange-700', 'dark:text-orange-300');
    }
  }
}

// Initialize scroll-based TOC highlighting when drawers are opened
function initializeTocScrollHighlighting() {
  try {
    const drawers = document.querySelectorAll('.drawer-container');
    
    drawers.forEach(drawer => {
    const tocButtons = drawer.querySelectorAll('.toc-btn');
    if (tocButtons.length === 0) return;

    // Create intersection observer for this drawer's sections
    const sections = Array.from(tocButtons).map(btn => {
      const sectionId = btn.getAttribute('onclick')?.match(/scrollToSection\('([^']+)'\)/)?.[1];
      return sectionId ? document.getElementById(sectionId) : null;
    }).filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Only update if this drawer is visible
        if (drawer.classList.contains('hidden')) return;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateActiveTocButton(entry.target.id, drawer);
          }
        });
      },
      {
        root: drawer,
        rootMargin: '-100px 0px -50% 0px', // Trigger when section is well into view
        threshold: 0.1
      }
    );

    sections.forEach(section => observer.observe(section));
    });
  } catch (error) {
    console.warn('Error initializing TOC scroll highlighting:', error);
  }
}

// === Utility Functions ===
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