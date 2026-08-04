/* ==========================================================================
   DASHBOARDS (User + Admin) - dashboard.js
   Load AFTER script.js. Self-contained for both dashboard pages.
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------------- Logged-in user (from signin) ---------------- */
    let storedUser = null;
    try {
      const raw = localStorage.getItem('rs_user');
      storedUser = raw ? JSON.parse(raw) : null;
    } catch (err) { storedUser = null; }

    const email = storedUser && storedUser.email ? storedUser.email : null;
    const userName = (function () {
      if (storedUser && storedUser.name) return storedUser.name;
      if (email) {
        return email.split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, function (c) { return c.toUpperCase(); })
          .trim();
      }
      return null;
    })();

    if (email) {
      const miniStrong = document.querySelector('.dash-mini-user strong');
      const miniSpan = document.querySelector('.dash-mini-user span');
      if (miniStrong) miniStrong.textContent = userName || email;
      if (miniSpan) miniSpan.textContent = email;

      const topbarSubEl = document.getElementById('topbarSub');
      if (topbarSubEl && topbarSubEl.textContent.indexOf('Welcome back') !== -1) {
        topbarSubEl.textContent = 'Welcome back, ' + (userName || email);
      }

      const greetH1 = document.querySelector('#view-overview .dash-greet h1');
      if (greetH1 && userName) {
        const first = userName.split(' ')[0];
        greetH1.innerHTML = greetH1.innerHTML
          .replace('Control Room', first)
          .replace(/>Priya<\/span>/, '>' + first + '</span>');
      }

      const pfEmail = document.getElementById('pfEmail');
      if (pfEmail) pfEmail.value = email;
      const profileEmail = document.querySelector('.profile-row p i.fa-envelope');
      if (profileEmail) {
        const parent = profileEmail.parentElement;
        parent.innerHTML = '<i class="fa-solid fa-envelope"></i> ' + email;
      }

      document.querySelectorAll('.dash-avatar').forEach(function (img) {
        img.setAttribute('title', email);
      });
    }

    /* ---------------- View switching ---------------- */
    const links = document.querySelectorAll('.dash-link[data-view]');
    const views = document.querySelectorAll('.view');
    const topbarTitle = document.getElementById('topbarTitle');
    const topbarSub = document.getElementById('topbarSub');
    const viewMeta = {
      overview: ['Dashboard', 'Welcome back'],
      bookings: ['Bookings', 'Your train tickets and PNR status'],
      book: ['Book Ticket', 'Plan your next journey'],
      profile: ['My Profile', 'Account & travel preferences'],
      support: ['Help & Support', '24x7 assistance'],
      trains: ['Manage Trains', 'Network services & scheduling'],
      users: ['Manage Users', 'Accounts, roles & activity'],
      analytics: ['Analytics', 'Live network performance']
    };

    function setActiveLink(name) {
      links.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-view') === name);
      });
    }

    function switchView(name) {
      views.forEach(function (view) {
        view.classList.toggle('active', view.id === 'view-' + name);
      });
      setActiveLink(name);
      if (topbarTitle) {
        const meta = viewMeta[name] || ['', ''];
        topbarTitle.textContent = meta[0];
        topbarSub.textContent = meta[1];
      }
      closeSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        switchView(link.getAttribute('data-view'));
      });
    });

    /* data-goto quick cards (overview) */
    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        switchView(el.getAttribute('data-goto'));
      });
    });

    /* ---------------- Sidebar toggle (mobile) ---------------- */
    const sidebar = document.getElementById('dashSidebar');
    const overlay = document.getElementById('dashOverlay');
    const menuBtn = document.getElementById('dashMenu');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    if (menuBtn) menuBtn.addEventListener('click', function () {
      const isOpen = sidebar && sidebar.classList.contains('open');
      if (isOpen) closeSidebar(); else openSidebar();
    });
    if (overlay) overlay.addEventListener('click', closeSidebar);

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) {
        closeSidebar();
      }
    });

    /* ---------------- Notification dropdown ---------------- */
    const notifToggle = document.getElementById('notifToggle');
    const notifPanel = document.getElementById('notifPanel');
    if (notifToggle && notifPanel) {
      notifToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        notifPanel.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!notifPanel.contains(e.target) && e.target !== notifToggle) {
          notifPanel.classList.remove('open');
        }
      });
    }

    /* ---------------- Toast notifications ---------------- */
    const toastWrap = document.getElementById('dashToasts');
    function toast(msg) {
      if (!toastWrap) return;
      const el = document.createElement('div');
      el.className = 'dash-toast';
      el.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>' + msg + '</span>';
      toastWrap.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('show'); });
      setTimeout(function () {
        el.classList.remove('show');
        setTimeout(function () { el.remove(); }, 400);
      }, 3200);
    }

    /* ---------------- Countdown to next journey ---------------- */
    const cdWrap = document.getElementById('tripCountdown');
    if (cdWrap) {
      const target = new Date('2026-08-06T16:55:00').getTime();
      const cdDays = document.getElementById('cdDays');
      const cdHours = document.getElementById('cdHours');
      const cdMins = document.getElementById('cdMins');
      const cdSecs = document.getElementById('cdSecs');

      function tickCountdown() {
        const diff = target - Date.now();
        if (diff <= 0) {
          cdDays.textContent = '0';
          cdHours.textContent = '0';
          cdMins.textContent = '0';
          cdSecs.textContent = '0';
          return;
        }
        const s = Math.floor(diff / 1000);
        cdDays.textContent = String(Math.floor(s / 86400)).padStart(2, '0');
        cdHours.textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
        cdMins.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        cdSecs.textContent = String(s % 60).padStart(2, '0');
      }
      tickCountdown();
      setInterval(tickCountdown, 1000);
    }

    /* ---------------- Progress bars ---------------- */
    const fillEls = document.querySelectorAll('.progress-fill[data-progress]');
    function animateFills() {
      fillEls.forEach(function (el) {
        el.style.width = el.getAttribute('data-progress') + '%';
      });
    }
    if (fillEls.length) {
      const fillObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateFills();
            fillObserver.disconnect();
          }
        });
      }, { threshold: 0.2 });
      fillObserver.observe(document.querySelector('.dash-content') || document.body);
    }

    /* ---------------- Chart bars ---------------- */
    const bars = document.querySelectorAll('.chart-bars .bar[data-h]');
    bars.forEach(function (bar) {
      bar.style.height = '0%';
      bar.setAttribute('data-h', bar.getAttribute('data-h'));
    });
    if (bars.length) {
      const chartObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.bar').forEach(function (bar) {
              bar.style.height = bar.getAttribute('data-h') + '%';
            });
            chartObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      document.querySelectorAll('.chart-bars').forEach(function (chart) {
        chartObserver.observe(chart);
      });
    }

    /* ---------------- Filter chips ---------------- */
    document.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const wrap = chip.closest('.panel-head');
        wrap.querySelectorAll('.filter-chip').forEach(function (c) {
          c.classList.remove('active');
        });
        chip.classList.add('active');
        const table = chip.closest('.panel').querySelector('table');
        if (!table) return;
        const filter = chip.getAttribute('data-filter');
        table.querySelectorAll('tbody tr').forEach(function (row) {
          const showAll = filter === 'all';
          const matches = row.getAttribute('data-status') === filter;
          row.style.display = showAll || matches ? '' : 'none';
        });
      });
    });

    /* ---------------- Search boxes ---------------- */
    document.querySelectorAll('.search-box input').forEach(function (input) {
      input.addEventListener('input', function () {
        const panel = input.closest('.panel');
        if (!panel) return;
        const table = panel.querySelector('table');
        if (!table) return;
        const q = input.value.trim().toLowerCase();
        table.querySelectorAll('tbody tr').forEach(function (row) {
          if (!q) {
            row.style.display = '';
            return;
          }
          const match = Array.prototype.some.call(row.cells, function (cell) {
            return cell.textContent.toLowerCase().indexOf(q) !== -1;
          });
          row.style.display = match ? '' : 'none';
        });
      });
    });

    /* ---------------- User: cancel booking ---------------- */
    document.querySelectorAll('.cancel-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const row = btn.closest('tr');
        const pnr = row.querySelector('.pnr').textContent;
        row.querySelector('td:nth-child(8)').innerHTML =
          '<span class="dash-badge badge-red">Cancelled</span>';
        btn.textContent = 'Refunded';
        btn.disabled = true;
        btn.style.opacity = '0.6';
        toast('Booking ' + pnr + ' cancelled. Refund initiated.');
      });
    });

    /* ---------------- Admin: edit / delete train ---------------- */
    document.querySelectorAll('.edit-train').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const row = btn.closest('tr');
        toast('Opening editor for ' + row.querySelector('.train-name').textContent + '...');
      });
    });

    document.querySelectorAll('.del-train').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const row = btn.closest('tr');
        const name = row.querySelector('.train-name').textContent;
        row.style.transition = 'opacity 0.4s ease';
        row.style.opacity = '0';
        setTimeout(function () {
          row.remove();
          toast(name + ' removed from the network.');
        }, 400);
      });
    });

    /* ---------------- Admin: view booking ---------------- */
    document.querySelectorAll('.view-booking').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const pnr = btn.closest('tr').querySelector('.pnr').textContent;
        toast('Opening PNR ' + pnr + ' detail view...');
      });
    });

    /* ---------------- Admin: block / restore user ---------------- */
    document.querySelectorAll('.block-user').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const row = btn.closest('tr');
        const name = row.querySelector('.train-name').textContent;
        const statusCell = row.querySelector('td:nth-child(6)');
        if (statusCell.querySelector('.badge-red')) {
          statusCell.innerHTML = '<span class="dash-badge badge-green">Active</span>';
          btn.innerHTML = '<i class="fa-solid fa-ban"></i> Block';
          btn.style.color = '#dc2626';
          toast(name + ' restored to active status.');
        } else {
          statusCell.innerHTML = '<span class="dash-badge badge-red">Suspended</span>';
          btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Restore';
          btn.style.color = 'var(--success)';
          toast(name + ' has been suspended.');
        }
      });
    });

    /* ---------------- Admin: add train ---------------- */
    var addTrainHandlers = ['addTrainBtn', 'quickAddTrain'];
    addTrainHandlers.forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', function () {
          toast('Add Train form will open in the full application.');
        });
      }
    });

    /* ---------------- Dashboard forms ---------------- */
    const bookForm = document.getElementById('dashBookForm');
    if (bookForm) {
      bookForm.addEventListener('submit', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      const status = document.getElementById('profileStatus');
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        status.className = 'form-status success';
        status.textContent = 'Profile updated successfully!';
        toast('Your profile has been saved.');
        setTimeout(function () { status.textContent = ''; }, 4000);
      });
    }

    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
      const status = document.getElementById('supportStatus');
      supportForm.addEventListener('submit', function (e) {
        e.preventDefault();
        status.className = 'form-status success';
        status.textContent = 'Ticket raised! Our team will respond within 2 hours.';
        toast('Support ticket raised successfully.');
        supportForm.reset();
        setTimeout(function () { status.textContent = ''; }, 5000);
      });
    }

    /* ---------------- Logout ---------------- */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        try { localStorage.removeItem('rs_user'); } catch (err) {}
        toast('Logging you out...');
        setTimeout(function () { window.location.href = 'signin.html'; }, 1200);
      });
    }

    /* ---------------- Placeholder buttons -> 404 ---------------- */
    document.addEventListener('click', function (e) {
      const btn = e.target.closest ? e.target.closest('.go404') : null;
      if (btn) {
        e.preventDefault();
        window.location.href = '404.html';
      }
    });

  });
})();
