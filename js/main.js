(function () {
    'use strict';

    const storageKey = 'theme';
    const docEl = document.documentElement;
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-toggle__sun') : null;
    const moonIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-toggle__moon') : null;

    // ---- Apply theme from localStorage or prefers-color-scheme ----
    function applyTheme() {
        let savedTheme = localStorage.getItem(storageKey);
        let theme = savedTheme;

        if (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = 'dark';
        } else if (!theme) {
            theme = 'light'; // Default to light if no preference found
        }

        docEl.setAttribute('data-theme', theme);

        // Update icon visibility
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.classList.add('theme-toggle__icon--hidden');
                moonIcon.classList.remove('theme-toggle__icon--hidden');
            } else {
                moonIcon.classList.add('theme-toggle__icon--hidden');
                sunIcon.classList.remove('theme-toggle__icon--hidden');
            }
        }
    }

    // ---- Toggle Theme ----
    function toggleTheme() {
        const currentTheme = docEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem(storageKey, newTheme);
        applyTheme(); // Re-apply theme to update icons and attributes
    }

    // ---- Initialize Theme ----
    applyTheme(); // Apply theme on load

    // ---- Event Listeners ----
    if (navToggle && nav) {
        // Create overlay element
        var navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        navOverlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(navOverlay);

        function closeNav() {
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navOverlay.classList.remove('active');
        }

        navToggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
            if (isOpen) {
                navOverlay.classList.add('active');
            } else {
                navOverlay.classList.remove('active');
            }
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                closeNav();
            });
        });

        // Click outside closes the menu
        navOverlay.addEventListener('click', function () {
            closeNav();
        });

        // Escape key closes the menu
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                closeNav();
            }
        });
    }

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // ---- Scroll Reveal (IntersectionObserver) ----
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });

        document.querySelectorAll('.reveal').forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    // ---- Animated Counter for Hero Stats ----
    if ('IntersectionObserver' in window) {
        const statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number[data-count]');
                    statNumbers.forEach(function (el) {
                        const target = parseInt(el.getAttribute('data-count'), 10);
                        const suffix = el.getAttribute('data-suffix') || '';
                        animateCounter(el, target, suffix, 1500);
                    });
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            statObserver.observe(heroStats);
        }
    }

    function animateCounter(el, target, suffix, duration) {
        const startTime = performance.now();
        const isFloat = target % 1 !== 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = target * eased;

            el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    // ---- FAQ Accordion ----
    document.querySelectorAll('.faq-item').forEach(function (item) {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        // Ensure answer is hidden from screen readers by default
        if (answer && !item.classList.contains('active')) {
            answer.setAttribute('aria-hidden', 'true');
        }

        question.addEventListener('click', function () {
            const isActive = item.classList.contains('active');

            // Close all FAQs first
            document.querySelectorAll('.faq-item').forEach(function (otherItem) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                var otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) otherAnswer.setAttribute('aria-hidden', 'true');
            });

            // Toggle current FAQ if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                if (answer) answer.removeAttribute('aria-hidden');
            } else {
                if (answer) answer.setAttribute('aria-hidden', 'true');
            }
        });

        // Keyboard: Enter and Space already trigger click on <button>, but ensure focus ring
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active nav link
    if (nav) {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = nav.querySelectorAll('a[href^="#"]');

        if (sections.length && navLinks.length) {
            const observerOptions = {
                root: null,
                rootMargin: '-80px 0px -60% 0px',
                threshold: 0
            };

            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(function (link) {
                            link.style.color = ''; // Reset color
                            if (link.getAttribute('href') === '#' + id) {
                                link.style.color = '#FFC107'; // Accent color for active link (can be overridden by theme vars)
                            }
                        });
                    }
                });
            }, observerOptions);

            sections.forEach(function (section) {
                observer.observe(section);
            });
        }
    }

    // Form submission handler (visual simulation) — contacto page
    const contactoForm = document.querySelector('.contacto-form');
    if (contactoForm) {
        contactoForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'A enviar...';
            submitBtn.disabled = true;

            setTimeout(function () {
                submitBtn.textContent = '✓ Mensagem Enviada!';
                submitBtn.style.background = '#28a745';
                submitBtn.style.borderColor = '#28a745';

                setTimeout(function () {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.disabled = false;
                    contactoForm.reset();
                }, 3000);
            }, 1500);
        });
    }

    // Accessible form validation — contacto.html (class="contact-form")
    const contactFormEl = document.querySelector('form[action*="mailto:geral@trioeletrico.pt"]');
    if (contactFormEl) {
        contactFormEl.addEventListener('submit', function (e) {
            var isValid = true;
            var firstInvalid = null;

            // Validate each required field
            this.querySelectorAll('[required]').forEach(function (field) {
                var errorSpan = document.getElementById(field.getAttribute('aria-describedby'));
                var value = field.type === 'select-one' ? field.value : field.value.trim();

                if (!value) {
                    isValid = false;
                    field.setAttribute('aria-invalid', 'true');
                    if (errorSpan) {
                        errorSpan.style.display = 'block';
                        errorSpan.hidden = false;
                    }
                    if (!firstInvalid) firstInvalid = field;
                } else {
                    field.removeAttribute('aria-invalid');
                    if (errorSpan) {
                        errorSpan.style.display = 'none';
                        errorSpan.hidden = true;
                    }
                }
            });

            if (!isValid) {
                e.preventDefault();
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // If valid, show success feedback
            e.preventDefault(); // prevent actual mailto for demo
            var submitBtn = this.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.textContent = '✓ Mensagem Enviada!';
            submitBtn.style.background = '#28a745';
            submitBtn.style.borderColor = '#28a745';
            submitBtn.disabled = true;

            setTimeout(function () {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
                submitBtn.disabled = false;
                contactFormEl.reset();
                contactFormEl.querySelectorAll('[aria-invalid]').forEach(function (f) {
                    f.removeAttribute('aria-invalid');
                });
                contactFormEl.querySelectorAll('.validation-message').forEach(function (msg) {
                    msg.style.display = 'none';
                    msg.hidden = true;
                });
            }, 3000);
        });

        // Clear error on input
        contactFormEl.querySelectorAll('[required]').forEach(function (field) {
            field.addEventListener('input', function () {
                var errorSpan = document.getElementById(field.getAttribute('aria-describedby'));
                var value = field.type === 'select-one' ? field.value : field.value.trim();
                if (value) {
                    field.removeAttribute('aria-invalid');
                    if (errorSpan) {
                        errorSpan.style.display = 'none';
                        errorSpan.hidden = true;
                    }
                }
            });
        });
    }

    // ---- Theme Toggle Event Listener ----
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

})();