// Cat Eyes Cursor Tracking
const pupilInitialPositions = new Map();

// Store initial pupil positions
document.querySelectorAll('.pupil').forEach(pupil => {
    pupilInitialPositions.set(pupil, {
        cx: parseFloat(pupil.getAttribute('cx')),
        cy: parseFloat(pupil.getAttribute('cy'))
    });
});

document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    document.querySelectorAll('.pupil').forEach(pupil => {
        const svg = pupil.closest('svg');
        const svgRect = svg.getBoundingClientRect();
        
        // Get pupil's SVG coordinates
        const pupilCx = parseFloat(pupil.getAttribute('cx'));
        const pupilCy = parseFloat(pupil.getAttribute('cy'));
        
        // Convert pupil SVG coordinates to screen coordinates
        const pupilScreenX = svgRect.left + (pupilCx / 100) * svgRect.width;
        const pupilScreenY = svgRect.top + (pupilCy / 100) * svgRect.height;

        // Calculate angle between pupil and cursor
        const angle = Math.atan2(mouseY - pupilScreenY, mouseX - pupilScreenX);
        
        // Calculate offset (constrained)
        const maxOffset = 3; // pixels in SVG space
        const offsetX = Math.cos(angle) * maxOffset;
        const offsetY = Math.sin(angle) * maxOffset;

        // Get initial position
        const initialPos = pupilInitialPositions.get(pupil);

        // Convert pixel offset to SVG coordinates
        const offsetXSvg = (offsetX / svgRect.width) * 100;
        const offsetYSvg = (offsetY / svgRect.height) * 100;

        // Update pupil position
        pupil.setAttribute('cx', initialPos.cx + offsetXSvg);
        pupil.setAttribute('cy', initialPos.cy + offsetYSvg);
    });
});

// Dark Mode Toggle
const darkModeIcon = document.getElementById('darkMode-icon');
const body = document.body;

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}

darkModeIcon.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Save preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
});

// Smooth Navigation Active Link
const navLinks = document.querySelectorAll('.navbar a:not(#darkMode-icon)');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Smooth Scroll to sections
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Button ripple effect on click
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        if (e.target.classList.contains('project-btn')) return;
        
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Contact Form Modal
function openContactForm(e) {
    e.preventDefault();
    document.getElementById('contactModal').style.display = 'block';
}

function closeContactForm() {
    document.getElementById('contactModal').style.display = 'none';
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // You can replace this with actual form submission
    alert('Thank you for your message! I\'ll get back to you soon.');
    form.reset();
    closeContactForm();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('contactModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
