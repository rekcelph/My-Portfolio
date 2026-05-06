// ── Run everything after the DOM is fully loaded ──
document.addEventListener('DOMContentLoaded', () => {

    // ── Image Modal ──────────────────────────────────────────────────────────
    const imageModal = document.getElementById('imageModal');

    window.openFullImage = function(imagePath, isProfile = false) {
        if (!imageModal) return;
        const modalImg = document.getElementById('fullImg');

        imageModal.style.display = 'flex';
        modalImg.src = imagePath;

        if (isProfile) {
            modalImg.style.borderRadius  = '50%';
            modalImg.style.width         = '350px';
            modalImg.style.height        = '350px';
            modalImg.style.objectFit     = 'cover';
            modalImg.style.maxWidth      = '80vw';
            modalImg.style.maxHeight     = '80vw';
        } else {
            modalImg.style.borderRadius  = '10px';
            modalImg.style.width         = '';
            modalImg.style.height        = '';
            modalImg.style.objectFit     = '';
            modalImg.style.maxWidth      = '80%';
            modalImg.style.maxHeight     = '80%';
        }
    };

    // Close image modal when clicking outside the image or on the x button
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target.classList.contains('close-modal')) {
                imageModal.style.display = 'none';
            }
        });
    }

    // ── Cat Eyes Cursor Tracking (desktop only) ──────────────────────────────
    if (window.matchMedia('(pointer: fine)').matches) {
        const pupilInitialPositions = new Map();

        document.querySelectorAll('.pupil').forEach(pupil => {
            pupilInitialPositions.set(pupil, {
                cx: parseFloat(pupil.getAttribute('cx')),
                cy: parseFloat(pupil.getAttribute('cy'))
            });
        });

        document.addEventListener('mousemove', (e) => {
            document.querySelectorAll('.pupil').forEach(pupil => {
                const svg     = pupil.closest('svg');
                const svgRect = svg.getBoundingClientRect();

                const pupilCx = parseFloat(pupil.getAttribute('cx'));
                const pupilCy = parseFloat(pupil.getAttribute('cy'));

                const pupilScreenX = svgRect.left + (pupilCx / 100) * svgRect.width;
                const pupilScreenY = svgRect.top  + (pupilCy / 100) * svgRect.height;

                const angle     = Math.atan2(e.clientY - pupilScreenY, e.clientX - pupilScreenX);
                const maxOffset = 3;
                const offsetX   = Math.cos(angle) * maxOffset;
                const offsetY   = Math.sin(angle) * maxOffset;

                const initialPos = pupilInitialPositions.get(pupil);
                const offsetXSvg = (offsetX / svgRect.width)  * 100;
                const offsetYSvg = (offsetY / svgRect.height) * 100;

                pupil.setAttribute('cx', initialPos.cx + offsetXSvg);
                pupil.setAttribute('cy', initialPos.cy + offsetYSvg);
            });
        });
    }

    // ── Dark Mode Toggle ──────────────────────────────────────────────────────
    const darkModeIcon = document.getElementById('darkMode-icon');

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        if (darkModeIcon) {
            const i = darkModeIcon.querySelector('i');
            if (i) i.className = 'bx bx-sun';
        }
    }

    if (darkModeIcon) {
        darkModeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            document.body.classList.toggle('dark-mode');

            const icon = darkModeIcon.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
                if (icon) icon.className = 'bx bx-sun';
            } else {
                localStorage.setItem('darkMode', 'disabled');
                if (icon) icon.className = 'bx bx-moon';
            }
        });
    }

    // ── Mobile Burger Menu ────────────────────────────────────────────────────
    const burger  = document.getElementById('navBurger');
    const navMenu = document.getElementById('navMenu');

    function closeMobileMenu() {
        if (!burger || !navMenu) return;
        burger.classList.remove('is-active');
        navMenu.classList.remove('is-active');
        document.body.classList.remove('stop-scrolling');
    }

    if (burger && navMenu) {
        burger.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('is-active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                burger.classList.add('is-active');
                navMenu.classList.add('is-active');
                document.body.classList.add('stop-scrolling');
            }
        });
    }

    // ── Navbar: active link + smooth scroll + close mobile menu on click ──────
    const navLinks = document.querySelectorAll('.navbar a.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href && href.startsWith('#')) {
                e.preventDefault();
                closeMobileMenu();
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                }, 50);
            }

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ── Scroll Observer: reveal sections + update active nav link ─────────────
    // Reveal observer — fires once per section, just adds is-visible
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold:   0.05,
        rootMargin: '0px 0px -5% 0px'
    });

    document.querySelectorAll('section[id]').forEach(s => revealObserver.observe(s));

    // Nav highlight — uses scroll position directly so it never skips a section
    // when scrolling up or when sections are short
    function updateActiveNav() {
        const scrollY    = window.scrollY + 80; // offset for navbar height
        const sections   = Array.from(document.querySelectorAll('section[id]'));
        let current      = sections[0];

        sections.forEach(section => {
            if (section.offsetTop <= scrollY) current = section;
        });

        if (current) {
            navLinks.forEach(l => l.classList.remove('active'));
            const activeLink = document.querySelector(`.navbar a[href="#${current.id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav(); // set correct highlight on initial load

    // ── Certification cards: staggered reveal ─────────────────────────────────
    const certObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.certification-card').forEach((card, i) => {
                    setTimeout(() => card.classList.add('is-visible'), i * 100);
                });
                certObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const certSection = document.querySelector('.certifications');
    if (certSection) certObserver.observe(certSection);

    // ── Button ripple effect ──────────────────────────────────────────────────
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (e.target.classList.contains('project-btn')) return;

            const ripple = document.createElement('span');
            const rect   = this.getBoundingClientRect();
            const size   = Math.max(rect.width, rect.height);
            const x      = e.clientX - rect.left - size / 2;
            const y      = e.clientY - rect.top  - size / 2;

            ripple.style.width  = ripple.style.height = size + 'px';
            ripple.style.left   = x + 'px';
            ripple.style.top    = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ── Contact Form Modal (optional — only runs if elements exist) ───────────
    window.openContactForm = function(e) {
        if (e) e.preventDefault();
        const modal = document.getElementById('contactModal');
        if (modal) modal.style.display = 'flex';
    };

    window.closeContactForm = function() {
        const modal = document.getElementById('contactModal');
        if (modal) modal.style.display = 'none';
    };

    window.handleFormSubmit = function(e) {
        e.preventDefault();
        alert('Thank you for reaching out! Rekcel will get back to you soon.');
        e.target.reset();
        window.closeContactForm();
    };

    // Single unified backdrop-click handler for any modal
    document.addEventListener('click', (e) => {
        const contactModal = document.getElementById('contactModal');
        if (contactModal && e.target === contactModal) {
            contactModal.style.display = 'none';
        }
    });

}); // end DOMContentLoaded

    // ════════════════════════════════════════════════
    // IMPRESSIVE ANIMATIONS
    // ════════════════════════════════════════════════

    // ── 1. Scroll Progress Bar ────────────────────────────────────────────────
    const progressBar = document.getElementById('scrollProgress');
    function updateProgress() {
        const scrollTop    = window.scrollY;
        const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
        const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });

    // ── 2. Typed + Glitch Intro ───────────────────────────────────────────────
    const glitchEl   = document.querySelector('.glitch-text');
    const fullText   = glitchEl ? glitchEl.getAttribute('data-text') : '';

    if (glitchEl && fullText) {
        glitchEl.textContent  = '';
        glitchEl.classList.add('typing');

        let i = 0;
        const typeSpeed = 60; // ms per character

        function typeChar() {
            if (i < fullText.length) {
                glitchEl.textContent += fullText[i];
                i++;
                setTimeout(typeChar, typeSpeed);
            } else {
                // Done typing — remove cursor, start glitch loop
                glitchEl.classList.remove('typing');
            }
        }
        // Small delay before typing starts so page has settled
        setTimeout(typeChar, 600);
    }

    // ── 3. 3D Tilt Cards ─────────────────────────────────────────────────────
    // Only on pointer: fine devices (mouse), not touch
    if (window.matchMedia('(pointer: fine)').matches) {

        document.querySelectorAll('.tilt-card').forEach(card => {
            // Inject shine div if not already there
            if (!card.querySelector('.tilt-shine')) {
                const shine = document.createElement('div');
                shine.className = 'tilt-shine';
                card.appendChild(shine);
            }

            card.addEventListener('mousemove', (e) => {
                const rect    = card.getBoundingClientRect();
                const cx      = rect.left + rect.width  / 2;
                const cy      = rect.top  + rect.height / 2;
                const dx      = e.clientX - cx;
                const dy      = e.clientY - cy;
                const maxTilt = 12; // degrees

                const rotY =  (dx / (rect.width  / 2)) * maxTilt;
                const rotX = -(dy / (rect.height / 2)) * maxTilt;

                card.style.transform =
                    `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;

                // Shine position
                const shineX = ((e.clientX - rect.left) / rect.width)  * 100;
                const shineY = ((e.clientY - rect.top)  / rect.height) * 100;
                card.style.setProperty('--shine-x', shineX + '%');
                card.style.setProperty('--shine-y', shineY + '%');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform =
                    'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }

    // ── 4. Magnetic Buttons ───────────────────────────────────────────────────
    if (window.matchMedia('(pointer: fine)').matches) {

        document.querySelectorAll('.magnetic').forEach(btn => {
            const strength = 0.35; // 0 = no pull, 1 = full cursor follow

            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const cx   = rect.left + rect.width  / 2;
                const cy   = rect.top  + rect.height / 2;
                const dx   = (e.clientX - cx) * strength;
                const dy   = (e.clientY - cy) * strength;
                btn.style.transform = `translate(${dx}px, ${dy}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });
    }
