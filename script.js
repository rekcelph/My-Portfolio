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

                // Jump animation on the clicked link
                link.classList.remove('jumping');
                void link.offsetWidth; // force reflow to restart animation
                link.classList.add('jumping');
                link.addEventListener('animationend', () => link.classList.remove('jumping'), { once: true });

                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Wait for the next two frames to ensure the menu closure
                // is fully painted before scrolling (fixes double‑click issue)
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                });
            }
        });
    });

    // ── Scroll Observer: reveal sections + update active nav link ─────────────
    // Reveal observer — fires once per section, just adds is-visible
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Small stagger so back-to-back sections don't snap simultaneously
                const delay = entry.target.dataset.revealDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold:   0.08,
        rootMargin: '0px 0px -4% 0px'
    });

    document.querySelectorAll('section[id]').forEach((s, i) => {
        s.dataset.revealDelay = i === 0 ? 0 : 60; // hero instant, rest slight stagger
        revealObserver.observe(s);
    });

    // Nav highlight — uses scroll position directly so it never skips a section
    function updateActiveNav() {
        // Match CSS scroll-margin-top (72px) + small buffer so the active link
        // switches at the exact moment the section title clears the navbar.
        const scrollY  = window.scrollY + 80;
        const sections = Array.from(document.querySelectorAll('section[id]'));
        let current    = sections[0];

        sections.forEach(section => {
            // offsetTop is the section's natural top — same reference scrollIntoView uses
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

    // ── Profile Music + Beat Animation ──────────────────────────────────────
    const profilePic   = document.querySelector('.profile-pic');
    const profileAudio = document.getElementById('profileMusic');
    const canvas       = document.getElementById('beatCanvas');
    const ctx          = canvas ? canvas.getContext('2d') : null;

    let audioCtx, analyser, source, dataArray, animFrame;
    let audioReady = false;

    function setupAudio() {
        if (audioReady) return;
        audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
        analyser  = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source    = audioCtx.createMediaElementSource(profileAudio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioReady = true;
    }

    function beatLoop() {
        animFrame = requestAnimationFrame(beatLoop);
        analyser.getByteFrequencyData(dataArray);

        // ── Draw circular visualizer ──
        const W  = canvas.width;
        const H  = canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const innerRadius = 88;   // just outside the profile pic edge (80px radius)
        const bars        = 80;
        const angleStep   = (Math.PI * 2) / bars;

        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < bars; i++) {
            const freqIndex = Math.floor(i * dataArray.length / bars);
            const value     = dataArray[freqIndex] / 255;
            const barLen    = value * 45 + 3;

            const angle = i * angleStep - Math.PI / 2; // start at top
            const x1 = cx + Math.cos(angle) * innerRadius;
            const y1 = cy + Math.sin(angle) * innerRadius;
            const x2 = cx + Math.cos(angle) * (innerRadius + barLen);
            const y2 = cy + Math.sin(angle) * (innerRadius + barLen);

            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `rgba(102, 126, 234, ${0.6 + value * 0.4})`);
            grad.addColorStop(1, `rgba(118, 75, 162,  ${value * 0.5})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth   = 2.5;
            ctx.lineCap     = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // ── Profile pic pulse ──
        let bass = 0;
        for (let i = 0; i < 12; i++) bass += dataArray[i];
        bass = bass / 12;

        const intensity = bass / 255;
        const scale     = 1 + intensity * 0.08;
        const glow      = Math.round(intensity * 35);
        const opacity   = 0.3 + intensity * 0.7;

        profilePic.style.transform = `scale(${scale})`;
        profilePic.style.boxShadow =
            `0 0 ${glow}px rgba(102, 126, 234, ${opacity}),
             0 0 ${glow * 2}px rgba(118, 75, 162, ${opacity * 0.5})`;
    }

    if (profilePic && profileAudio && canvas) {
        profilePic.addEventListener('mouseenter', () => {
            setupAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            profileAudio.play();
            canvas.classList.add('is-playing');
            beatLoop();
        });

        profilePic.addEventListener('mouseleave', () => {
            profileAudio.pause();
            profileAudio.currentTime = 0;
            cancelAnimationFrame(animFrame);
            canvas.classList.remove('is-playing');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            profilePic.style.transform = 'scale(1)';
            profilePic.style.boxShadow = '';
        });
    }

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