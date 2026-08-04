/* ==========================================================================
   RAILWAY SERVICES - script.js
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------------- Navbar scroll effect ---------------- */
    const navbar = document.getElementById('navbar');
    const toTopBtn = document.getElementById('toTop');

    function onScroll() {
      const y = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', y > 40);
      if (toTopBtn) toTopBtn.classList.toggle('show', y > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------------- Mobile drawer menu ---------------- */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const drawerClose = document.querySelector('.drawer-close');

    if (hamburger && navLinks) {
      function setMenu(open) {
        hamburger.classList.toggle('open', open);
        navLinks.classList.toggle('open', open);
        if (menuBackdrop) menuBackdrop.classList.toggle('show', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.documentElement.style.overflow = open ? 'hidden' : '';
        if (open) {
          const firstLink = navLinks.querySelector('a:not(.drawer-brand)');
          if (firstLink) firstLink.focus({ preventScroll: true });
        } else if (document.activeElement && navLinks.contains(document.activeElement)) {
          hamburger.focus();
        }
      }
      function toggleMenu(force) {
        setMenu(typeof force === 'boolean' ? force : !navLinks.classList.contains('open'));
      }

      hamburger.addEventListener('click', function () {
        toggleMenu();
      });
      if (drawerClose) drawerClose.addEventListener('click', function () {
        toggleMenu(false);
      });
      if (menuBackdrop) menuBackdrop.addEventListener('click', function () {
        toggleMenu(false);
      });
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          toggleMenu(false);
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
          toggleMenu(false);
        }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
          setMenu(false);
        }
      });
    }

    /* ---------------- Back to top ---------------- */
    if (toTopBtn) {
      toTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---------------- Scroll reveal ---------------- */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const delay = parseFloat(entry.target.style.transitionDelay) || 0;
          setTimeout(function () {
            entry.target.style.transitionDelay = '';
          }, (delay + 0.9) * 1000);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.prototype.slice.call(parent.children).filter(function (c) {
          return c.classList && c.classList.contains('reveal');
        });
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(idx * 0.12, 0.6) + 's';
      }
      revealObserver.observe(el);
    });

    /* ---------------- Animated counters ---------------- */
    function animateCount(el) {
      const target = parseFloat(el.getAttribute('data-count')) || 0;
      const decimals = String(el.getAttribute('data-count')).includes('.') ? 1 : 0;
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const countEls = document.querySelectorAll('[data-count]');
    const countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { countObserver.observe(el); });

    /* ---------------- FAQ accordion ---------------- */
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('active');

        document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
          openItem.classList.remove('active');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    /* ---------------- Gallery lightbox ---------------- */
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    if (galleryItems.length && lightbox) {
      const lightboxImg = document.getElementById('lightboxImg');
      let currentIndex = 0;

      function openLightbox(i) {
        currentIndex = i;
        const img = galleryItems[i].querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }

      function navigate(dir) {
        openLightbox((currentIndex + dir + galleryItems.length) % galleryItems.length);
      }

      galleryItems.forEach(function (item, i) {
        item.addEventListener('click', function () { openLightbox(i); });
      });

      document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
      document.getElementById('lightboxPrev').addEventListener('click', function () { navigate(-1); });
      document.getElementById('lightboxNext').addEventListener('click', function () { navigate(1); });
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
      });
    }

    /* ---------------- Ticket search form ---------------- */
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
      const dateInput = document.getElementById('date');
      if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
      }
      ticketForm.addEventListener('submit', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }

    /* ---------------- Newsletter forms ---------------- */
    document.querySelectorAll('#newsletterForm').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (!input || !GMAIL_REGEX.test(input.value.trim())) {
          alert('Please enter a valid Gmail address (must end with @gmail.com).');
          return;
        }
        window.location.href = '404.html';
      });
    });

    /* ---------------- Contact form ---------------- */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      const status = document.getElementById('formStatus');
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const emailInput = contactForm.querySelector('#cemail');
        if (!emailInput || !GMAIL_REGEX.test(emailInput.value.trim())) {
          status.style.color = 'var(--danger, #e74c3c)';
          status.textContent = 'Please enter a valid Gmail address (must end with @gmail.com).';
          return;
        }
        window.location.href = '404.html';
      });
    }

    /* ---------------- Dynamic schedule refresh demo ---------------- */
    const scheduleTable = document.getElementById('scheduleTable');
    if (scheduleTable) {
      const rows = scheduleTable.querySelectorAll('tbody tr');
      let blinkTimer;
      function refreshStatuses() {
        clearTimeout(blinkTimer);
        rows.forEach(function (row) {
          const badge = row.querySelector('.status-badge');
          if (!badge) return;
          if (badge.classList.contains('status-on-time')) {
            badge.textContent = 'On Time';
          } else if (badge.classList.contains('status-delayed')) {
            const mins = 5 + Math.floor(Math.random() * 40);
            badge.textContent = 'Delayed ' + mins + 'm';
          }
        });
        blinkTimer = setTimeout(refreshStatuses, 60000);
      }
      refreshStatuses();
    }

    /* ---------------- Password visibility toggle ---------------- */
    document.querySelectorAll('.password-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const input = btn.parentElement.querySelector('input');
        const icon = btn.querySelector('i');
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      });
    });

    /* ---------------- Password strength meter (signup) ---------------- */
    const strengthInput = document.getElementById('spassword');
    if (strengthInput) {
      const meter = document.getElementById('strengthMeter').querySelectorAll('span');
      const label = document.getElementById('strengthLabel');

      strengthInput.addEventListener('input', function () {
        const v = strengthInput.value;
        let score = 0;
        if (v.length >= 8) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;

        meter.forEach(function (bar, i) {
          bar.classList.toggle('active', i < score);
        });

        const messages = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#dc2626', '#ea580c', '#d97706', '#16a34a', '#15803d'];
        label.textContent = v ? messages[score] : 'Use 8+ characters with 1 capital, 1 number & 1 special character';
        label.style.color = v ? colors[score] : '';
      });
    }

    /* ---------------- Sign In form ---------------- */
    const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;
    const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
      const status = document.getElementById('signinStatus');
      signinForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const emailOk = GMAIL_REGEX.test(email);

        if (!emailOk) {
          status.className = 'form-status error';
          status.textContent = 'Please enter a valid Gmail address (must end with @gmail.com).';
          return;
        }
        if (!STRONG_PASSWORD_REGEX.test(password)) {
          status.className = 'form-status error';
          status.textContent = 'Password must be 8+ characters with 1 capital, 1 number & 1 special character.';
          return;
        }
        status.className = 'form-status success';
        status.textContent = 'Sign in successful! Redirecting to your dashboard...';
        const role = document.querySelector('input[name="role"]:checked');
        const roleVal = role ? role.value : 'user';
        try {
          localStorage.setItem('rs_user', JSON.stringify({ email: email, role: roleVal }));
        } catch (err) {}
        const dest = roleVal === 'admin' ? 'admindashboard.html' : 'userdashboard.html';
        setTimeout(function () { window.location.href = dest; }, 1500);
      });
    }

    /* ---------------- Sign Up form ---------------- */
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      const status = document.getElementById('signupStatus');
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('fullname').value.trim();
        const email = document.getElementById('semail').value.trim();
        const password = document.getElementById('spassword').value;
        const confirm = document.getElementById('cpassword').value;
        const emailOk = GMAIL_REGEX.test(email);

        if (name.length < 2) {
          status.className = 'form-status error';
          status.textContent = 'Please enter your full name.';
          return;
        }
        if (!emailOk) {
          status.className = 'form-status error';
          status.textContent = 'Please enter a valid Gmail address (must end with @gmail.com).';
          return;
        }
        if (!STRONG_PASSWORD_REGEX.test(password)) {
          status.className = 'form-status error';
          status.textContent = 'Password must be 8+ characters with 1 capital, 1 number & 1 special character.';
          return;
        }
        if (password !== confirm) {
          status.className = 'form-status error';
          status.textContent = 'Passwords do not match.';
          return;
        }
        status.className = 'form-status success';
        status.textContent = 'Account created! Redirecting to sign in...';
        setTimeout(function () { window.location.href = 'signin.html'; }, 1500);
      });
    }

    /* ---------------- 404 Go Back ---------------- */
    const goBackBtn = document.getElementById('goBackBtn');
    if (goBackBtn) {
      goBackBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = 'index.html';
        }
      });
    }

    /* ---------------- 404 error search ---------------- */
    const errorSearch = document.getElementById('errorSearch');
    if (errorSearch) {
      errorSearch.addEventListener('submit', function (e) {
        e.preventDefault();
        const q = errorSearch.querySelector('input').value.trim();
        if (q) {
          alert('Searching for "' + q + '"...');
          window.location.href = 'services.html';
        } else {
          alert('Please type something to search.');
        }
      });
    }

    /* ==================================================================
       PREMIUM ANIMATIONS & INTERACTIONS
       ================================================================== */

    /* ---------------- Preloader ---------------- */
    function hidePreloader() {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('hide');
        setTimeout(function () { preloader.remove(); }, 700);
      }
    }
    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
      setTimeout(hidePreloader, 4000);
    }

    /* ---------------- Scroll progress bar ---------------- */
    const scrollProgress = document.getElementById('scrollProgress');
    function updateProgress() {
      if (!scrollProgress) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    /* ---------------- Custom cursor glow ---------------- */
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (finePointer.matches) {
      const dot = document.createElement('div');
      dot.className = 'cursor-dot';
      const glow = document.createElement('div');
      glow.className = 'cursor-glow';
      document.body.appendChild(dot);
      document.body.appendChild(glow);

      let mx = 0, my = 0, gx = 0, gy = 0;
      document.addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
      }, { passive: true });

      (function glowLoop() {
        gx += (mx - gx) * 0.16;
        gy += (my - gy) * 0.16;
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';
        requestAnimationFrame(glowLoop);
      })();

      document.querySelectorAll('a, button, input, select, textarea, .gallery-item').forEach(function (el) {
        el.addEventListener('mouseenter', function () { glow.classList.add('cursor-active'); });
        el.addEventListener('mouseleave', function () { glow.classList.remove('cursor-active'); });
      });
    }

    /* ---------------- Typed text effect ---------------- */
    const typedEl = document.querySelector('.typed-text');
    if (typedEl) {
      const words = (typedEl.dataset.words || 'Smarter,Faster,Further').split(',');
      let wi = 0, ci = 0, deleting = false;
      (function type() {
        const word = words[wi];
        typedEl.textContent = word.slice(0, ci);
        if (!deleting) {
          if (ci < word.length) {
            ci++;
            setTimeout(type, 110);
          } else {
            deleting = true;
            setTimeout(type, 1700);
          }
        } else {
          if (ci > 0) {
            ci--;
            setTimeout(type, 50);
          } else {
            deleting = false;
            wi = (wi + 1) % words.length;
            setTimeout(type, 300);
          }
        }
      })();
    }

    /* ---------------- 3D tilt cards ---------------- */
    if (finePointer.matches) {
      document.querySelectorAll(
        '.service-card, .feature-card, .team-card, .blog-card, .price-card, .value-card, .contact-card'
      ).forEach(function (card) {
        card.classList.add('tilt');
        card.addEventListener('mousemove', function (e) {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) ' +
            'rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-8px)';
        });
        card.addEventListener('mouseleave', function () {
          card.style.transform = '';
        });
      });
    }

    /* ---------------- Magnetic buttons ---------------- */
    if (finePointer.matches) {
      document.querySelectorAll('.btn-primary, .btn-navy').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          btn.style.transform = 'translate(' + (x * 0.14).toFixed(1) + 'px, ' + (y * 0.14).toFixed(1) + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
          btn.style.transform = '';
        });
      });
    }

    /* ---------------- Ripple effect on buttons ---------------- */
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const r = btn.getBoundingClientRect();
        const d = Math.max(r.width, r.height);
        const span = document.createElement('span');
        span.className = 'ripple';
        span.style.width = span.style.height = d + 'px';
        span.style.left = (e.clientX - r.left - d / 2) + 'px';
        span.style.top = (e.clientY - r.top - d / 2) + 'px';
        btn.appendChild(span);
        setTimeout(function () { span.remove(); }, 650);
      });
    });

    /* ---------------- Subtle parallax on split images ---------------- */
    if (finePointer.matches) {
      const parallaxImgs = document.querySelectorAll('.split .media img');
      if (parallaxImgs.length) {
        parallaxImgs.forEach(function (img) {
          img.style.willChange = 'transform';
        });
        let ticking = false;
        window.addEventListener('scroll', function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () {
            parallaxImgs.forEach(function (img) {
              const r = img.getBoundingClientRect();
              if (r.bottom < 0 || r.top > window.innerHeight) return;
              const offset = (window.innerHeight / 2 - (r.top + r.height / 2)) * 0.045;
              img.style.transform = 'translateY(' + offset.toFixed(1) + 'px) scale(1.1)';
            });
            ticking = false;
          });
        }, { passive: true });
      }
    }

  });
})();
