(() => {
  'use strict';

  document.documentElement.classList.add('motion-ready');

  // 1. Mobile Nav Drawer
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a, button').forEach((item) =>
      item.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // 2. Sticky Header Shrink on Scroll & Scroll Progress Fallback
  const header = document.querySelector('.site-header');
  const progressBar = document.getElementById('readingProgressBar');
  const supportsScrollTimeline = CSS.supports && CSS.supports('animation-timeline', 'scroll()');

  const onScroll = () => {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (progressBar && !supportsScrollTimeline) {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, y / scrollable));
      progressBar.style.transform = `scaleX(${ratio})`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3. Scroll Reveal & Animated Numeric Counters
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const start = performance.now();
    const dur = 950;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (target * eased).toFixed(decimals);
      el.textContent = `${prefix}${val}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // 3. Scroll Reveal (GSAP 3.12.5 + ScrollTrigger with IntersectionObserver Fallback), 3D Mouse Tilt & Counters
  const revealEls = document.querySelectorAll('.reveal, .stats, .band');
  const counterEls = document.querySelectorAll('[data-count]');
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.style.transitionDelay = '0ms';
      });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const rx = (((e.clientY - r.top) / r.height) - 0.5) * -5;
        const ry = (((e.clientX - r.left) / r.width) - 0.5) * 6;
        card.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  if (hasGsap) {
    document.documentElement.classList.add('gsap-ready');
    window.gsap.registerPlugin(window.ScrollTrigger);

    // Hero timeline
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      const heroTl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo('.hero-pill', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo('.hero h1', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.38')
        .fromTo('.hero .lead', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.55')
        .fromTo('.hero .actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.5')
        .fromTo('.hero-kpis .hero-kpi', { y: 24, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, stagger: 0.09, duration: 0.65, ease: 'back.out(1.4)', clearProps: 'transform' }, '-=0.45')
        .fromTo('.hero-visual-card, .hero-telemetry', { y: 32, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.9, clearProps: 'transform' }, '-=0.75');
    }

    // Section headers & split blocks (reversible scroll choreography)
    document.querySelectorAll('.section-head, .band .wrap').forEach((el) => {
      window.gsap.fromTo(
        el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    });

    document.querySelectorAll('.split').forEach((splitEl) => {
      const cols = splitEl.querySelectorAll(':scope > *');
      if (!cols.length) return;
      window.gsap.fromTo(
        cols,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: splitEl,
            start: 'top 88%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    });

    // Staggered card/list groups
    const groupSelectors = [
      '.cards',
      '.matrix-grid',
      '.flip-grid',
      '.logos',
      '.stats-grid',
      '.stacked-visuals'
    ];
    groupSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((group) => {
        const items = group.querySelectorAll(':scope > *');
        if (!items.length) return;
        window.gsap.fromTo(
          items,
          { y: 30, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: group,
              start: 'top 88%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      });
    });

    // Single rich blocks (projects, resources, simulator, video, blueprint, compare, contact, tables)
    document.querySelectorAll('.compare-box, .video-card, .sim-box, .contact-box, .data-table-wrap, .blueprint-wrap, .project, .resource, .parallax-breather .breather-inner').forEach((el) => {
      window.gsap.fromTo(
        el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    });

    counterEls.forEach((el) => {
      window.ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => animateCounter(el)
      });
    });
  } else {
    revealEls.forEach((sec) => {
      sec
        .querySelectorAll(
          '.section-head, .split > *, .compare-box, .video-card, .sim-box, .contact-box, .data-table-wrap, .blueprint-wrap, .card, .matrix-card, .flip-card, .project, .resource, .logo-tile, .stat'
        )
        .forEach((child, idx) => {
          child.style.transitionDelay = `${Math.min(idx, 6) * 75}ms`;
        });
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            } else if (entry.boundingClientRect.top > window.innerHeight) {
              entry.target.classList.remove('is-visible');
            }
          });
        },
        { threshold: 0.08 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.2 }
      );
      counterEls.forEach((el) => counterObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      counterEls.forEach((el) => animateCounter(el));
    }
  }

  // 3b. Parallax Breather Fallback for Browsers Without Scroll-Driven View-Timeline
  const supportsViewTimeline = CSS.supports && CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  const breathers = document.querySelectorAll('.parallax-breather');
  if (!supportsViewTimeline && breathers.length) {
    const activeBreathers = new Set();
    const updateBreathers = () => {
      const winH = window.innerHeight || 800;
      activeBreathers.forEach((sec) => {
        const layer = sec.querySelector('.parallax-layer');
        if (!layer) return;
        const rect = sec.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (winH - rect.top) / (winH + rect.height)));
        const offset = (ratio - 0.5) * 80;
        layer.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };

    if ('IntersectionObserver' in window) {
      const bObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) activeBreathers.add(entry.target);
            else activeBreathers.delete(entry.target);
          });
        },
        { threshold: 0 }
      );
      breathers.forEach((b) => bObs.observe(b));
      window.addEventListener('scroll', updateBreathers, { passive: true });
      updateBreathers();
    }
  }

  // 3c. 3D Flip Cards Deck Interaction (Click + Keyboard)
  document.querySelectorAll('.flip-card').forEach((card) => {
    const toggleFlip = () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    };
    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });
  });

  // 4. Native <dialog> Modals (Brief + Diagram Lightbox) with closedBy fallback
  document.querySelectorAll('[data-open-dialog]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dlg = document.getElementById(btn.dataset.openDialog);
      if (dlg && typeof dlg.showModal === 'function') {
        if (btn.dataset.imgSrc && dlg.id === 'lightboxDialog') {
          const img = dlg.querySelector('#lightboxImg');
          const cap = dlg.querySelector('#lightboxCaption');
          if (img) {
            img.src = btn.dataset.imgSrc;
            img.alt = btn.dataset.imgAlt || 'Technical Diagram';
          }
          if (cap) cap.textContent = btn.dataset.imgAlt || '';
        }
        dlg.showModal();
      }
    });
  });

  document.querySelectorAll('dialog[closedby="any"]').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const outside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e)) dialog.close();
      });
    }
  });

  // 5. Exclusive <details name="..."> fallback for older browsers
  if (!Object.hasOwn(HTMLDetailsElement.prototype, 'name')) {
    document.addEventListener(
      'toggle',
      (event) => {
        const details = event.target;
        if (!(details instanceof HTMLDetailsElement) || !details.open || !details.hasAttribute('name')) return;
        const name = CSS.escape(details.getAttribute('name'));
        document.querySelectorAll(`details[name="${name}"]`).forEach((other) => {
          if (other !== details) other.open = false;
        });
      },
      { capture: true }
    );
  }

  // 6. Accessible Tabs + SVG Blueprint Hotspots
  document.querySelectorAll('.tabs-container').forEach((container) => {
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    const panels = [...container.querySelectorAll('[role="tabpanel"]')];
    const hotspots = [...container.querySelectorAll('.hotspot-node')];

    const activateTab = (tab, moveFocus = false) => {
      const targetId = tab.dataset.panel;
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((p) => {
        const match = p.id === targetId;
        if (match) {
          p.removeAttribute('hidden');
          p.tabIndex = 0;
        } else {
          p.setAttribute('hidden', 'until-found');
          p.removeAttribute('tabindex');
        }
      });
      hotspots.forEach((hs) => hs.classList.toggle('active', hs.dataset.tabId === tab.id));
      if (moveFocus) tab.focus();
    };

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => activateTab(tab, false));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          activateTab(tabs[(idx + 1) % tabs.length], true);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          activateTab(tabs[(idx - 1 + tabs.length) % tabs.length], true);
        } else if (e.key === 'Home') {
          e.preventDefault();
          activateTab(tabs[0], true);
        } else if (e.key === 'End') {
          e.preventDefault();
          activateTab(tabs[tabs.length - 1], true);
        }
      });
    });

    hotspots.forEach((hs) => {
      const linkTab = () => {
        const t = document.getElementById(hs.dataset.tabId);
        if (t) activateTab(t, false);
      };
      hs.addEventListener('click', linkTab);
      hs.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          linkTab();
        }
      });
    });

    panels.forEach((panel) => {
      panel.addEventListener('beforematch', () => {
        const owner = tabs.find((t) => t.dataset.panel === panel.id);
        if (owner) activateTab(owner, false);
      });
    });
  });

  // 7. Before vs After Comparator Slider (index.html)
  const compareRange = document.getElementById('compareRange');
  if (compareRange) {
    const beforeCard = document.getElementById('compareBefore');
    const afterCard = document.getElementById('compareAfter');
    const stageText = document.getElementById('compareStageLabel');
    const updateCompare = () => {
      const v = parseInt(compareRange.value, 10);
      if (beforeCard) beforeCard.style.opacity = String((0.45 + ((100 - v) / 100) * 0.55).toFixed(2));
      if (afterCard) afterCard.style.opacity = String((0.45 + (v / 100) * 0.55).toFixed(2));
      if (afterCard) afterCard.style.borderWidth = v >= 50 ? '2px' : '1px';
      if (beforeCard) beforeCard.style.borderWidth = v < 50 ? '2px' : '1px';
      if (stageText) {
        stageText.textContent = v >= 60 ? 'Future State: Connected TrazaCore Platform' : v <= 40 ? 'Legacy State: Manual Spreadsheets' : 'Balanced Comparison View';
      }
    };
    compareRange.addEventListener('input', updateCompare);
    updateCompare();
  }

  // 8. Sector / Industry Filters (projects.html & industries.html)
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const btns = [...group.querySelectorAll('.filter-btn')];
    const targetSelector = group.dataset.filterGroup;
    const items = [...document.querySelectorAll(targetSelector)];

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        btns.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        items.forEach((item) => {
          const match = filter === 'all' || (item.dataset.category || '').split(' ').includes(filter);
          if (match) item.removeAttribute('hidden');
          else item.setAttribute('hidden', '');
        });
      });
    });
  });

  // 9. Industrial ROI & Efficiency Simulator (projects.html — client-agnostic B2B model)
  const roiForm = document.getElementById('roiCalculator');
  if (roiForm) {
    const opsIn = document.getElementById('roiOperators');
    const pickIn = document.getElementById('roiPicking');
    const linesIn = document.getElementById('roiLines');
    const sitesIn = document.getElementById('roiSites');

    const updateRoi = () => {
      const operators = parseFloat(opsIn.value);
      const picking = parseFloat(pickIn.value);
      const monthlyLines = parseFloat(linesIn.value);
      const sites = parseFloat(sitesIn.value);

      document.getElementById('roiOperatorsVal').textContent = `${operators} staff`;
      document.getElementById('roiPickingVal').textContent = `${picking.toFixed(1)} min`;
      document.getElementById('roiLinesVal').textContent = `${monthlyLines.toLocaleString('en-US')} / mo`;
      document.getElementById('roiSitesVal').textContent = `${sites} ${sites === 1 ? 'site' : 'sites'}`;

      // Agnostic operational efficiency formula:
      // Picking hours saved per year + reduced rush air freight & stock discrepancies
      const targetPick = 5.8;
      const minutesSavedPerLine = Math.max(0, picking - targetPick);
      const hoursSavedYr = Math.round((minutesSavedPerLine * monthlyLines * 12) / 60);
      const laborAndReworkSaved = hoursSavedYr * 32 + sites * 14500 + (operators * 1850);
      const estSavingsPen = Math.round(laborAndReworkSaved);

      // Typical enterprise deployment complexity scales with sites and operator count
      const scopeFactor = 1.0 + (sites - 1) * 0.14 + (operators / 40);
      const estPaybackLow = Math.max(8, Math.round((11 * scopeFactor) / Math.max(0.7, (estSavingsPen / 320000))));
      const clampedPayback = Math.min(20, Math.max(9, estPaybackLow));
      const targetOt = Math.min(94.0, Math.max(84.0, 92.0 - sites * 0.25));

      document.getElementById('outHours').textContent = `${hoursSavedYr.toLocaleString('en-US')} hrs/yr`;
      document.getElementById('outSavings').textContent = `S/ ${estSavingsPen.toLocaleString('en-US')}/yr`;
      document.getElementById('outPayback').textContent = `${clampedPayback}–${clampedPayback + 3} months`;
      document.getElementById('outOnTime').textContent = `${targetOt.toFixed(1)}%`;

      document.getElementById('barPayback').style.width = `${Math.min(100, Math.round((24 / clampedPayback) * 44))}%`;
      document.getElementById('barOnTime').style.width = `${Math.round(targetOt)}%`;
    };

    [opsIn, pickIn, linesIn, sitesIn].forEach((inp) => inp.addEventListener('input', updateRoi));
    updateRoi();
  }

  // 10. 5-Area Supply Chain Solution Finder (resources.html)
  const assessBox = document.getElementById('readinessAssessment');
  if (assessBox) {
    const questions = [
      {
        area: 'Sales Quoting & Purchasing',
        q: '1. Where do delays or blind spots hurt your Sales & Purchasing workflow?',
        opts: [
          {
            label: 'Sales wait too long to confirm real branch stock, or purchasing runs on manual Excel / emails',
            service: 'Odoo Enterprise & Automated Purchasing',
            problem: 'Slow Quotes & Manual Supplier Orders',
            solution: 'Real-time branch stock checks plus automatic multi-currency supplier order drafting and margin visibility.',
            impact: 'Supplier order turnaround cut from 8–12 days to ≤ 3 days'
          },
          {
            label: 'Purchase approvals lack clear spend limits or happen informally via chat/email',
            service: 'Role-Based Approval Governance',
            problem: 'Uncontrolled Purchasing Approvals',
            solution: 'Digital multi-level authorization rules separating requesters, approvers, and finance release.',
            impact: 'Zero unauthorized spend & faster director sign-offs'
          },
          {
            label: 'No bottleneck here — quoting and supplier purchasing already run smoothly',
            service: null
          }
        ]
      },
      {
        area: 'Warehouse Picking & Inventory Floor',
        q: '2. What slows down your warehouse floor and inventory accuracy today?',
        opts: [
          {
            label: 'Staff spend too long searching aisles, or physical counts rarely match accounting records',
            service: 'Warehouse Re-Engineering & Barcode Scanning',
            problem: 'Slow Picking & Stock Discrepancies',
            solution: 'Velocity-based shelf reorganization paired with guided mobile picking and blind cycle counts.',
            impact: 'Up to 60% faster order picking & ≥ 95% stock accuracy'
          },
          {
            label: 'Remote or regional depots lose Wi-Fi/internet and fall back to paper tracking',
            service: 'Offline-Ready Rugged Mobile Scanning',
            problem: 'Connectivity Gaps at Remote Sites',
            solution: 'Industrial handhelds store scans locally during network drops and sync cleanly when back online.',
            impact: 'Zero lost floor transactions across all sites'
          },
          {
            label: 'No bottleneck here — shelves, barcode scanning, and inventory counts work well',
            service: null
          }
        ]
      },
      {
        area: 'Quality Control & Dispatch Compliance',
        q: '3. Do documentation or labeling gaps ever delay deliveries or create client penalties?',
        opts: [
          {
            label: 'Items risk shipping before quality test certificates or safety sheets are verified',
            service: 'Automated Quality Release Locks & Document Vault',
            problem: 'Uncertified Shipments & Missing Certificates',
            solution: 'System locks new stock automatically until quality certificates are uploaded, verified, and released.',
            impact: '100% batch traceability & zero uncertified dispatches'
          },
          {
            label: 'Grease, solvents, or outdoor storage ruin ordinary paper shelf and product labels',
            service: 'Durable Barcode Labeling & Callao Staging',
            problem: 'Unreadable Damaged Labels in the Field',
            solution: 'Oil- and solvent-resistant synthetic barcode labels pre-tested in our Callao hardware hub.',
            impact: 'Instant, accurate scanning in harsh plant environments'
          },
          {
            label: 'No bottleneck here — quality release controls and labels are already reliable',
            service: null
          }
        ]
      },
      {
        area: 'Cloud Reliability & Business Security',
        q: '4. What operational or IT risks worry leadership across your systems?',
        opts: [
          {
            label: 'Local office servers, weak backups, or lack of clear boundaries on who edits stock & prices',
            service: 'Client-Owned Cloud & ISO 27001 Governance',
            problem: 'Downtime Exposure & Weak Access Controls',
            solution: 'Always-on hosting inside your own AWS account, automated backups, strict permissions, and security monitoring.',
            impact: '99.9% availability SLA & full corporate data ownership'
          },
          {
            label: 'No bottleneck here — cloud continuity and access permissions are already covered',
            service: null
          }
        ]
      },
      {
        area: 'SUNAT Billing, Accounting & Multi-System Sync',
        q: '5. How much manual re-typing happens between dispatch, SUNAT, and finance?',
        opts: [
          {
            label: 'Teams re-enter invoices, Guías de Remisión, or currency conversions across disconnected portals',
            service: 'Native SUNAT E-Billing & Accounting Integration',
            problem: 'Double Data Entry & Billing Delays',
            solution: 'Seamless synchronization issuing SUNAT e-invoices and dispatch guides automatically at shipment.',
            impact: 'Zero duplicate typing & real-time month-end financial close'
          },
          {
            label: 'No bottleneck here — SUNAT billing and accounting already sync automatically',
            service: null
          }
        ]
      }
    ];

    let step = 0;
    const answers = new Array(questions.length).fill(null);

    const qText = document.getElementById('assessQuestion');
    const optsWrap = document.getElementById('assessOptions');
    const progFill = document.getElementById('assessProgress');
    const stepLbl = document.getElementById('assessStepLabel');
    const prevBtn = document.getElementById('assessPrev');
    const nextBtn = document.getElementById('assessNext');
    const resultPane = document.getElementById('assessResult');
    const quizPane = document.getElementById('assessQuizBody');
    const matchesWrap = document.getElementById('assessMatches');

    const renderStep = (animate = false) => {
      const cur = questions[step];
      stepLbl.textContent = `Area ${step + 1} of ${questions.length} · ${cur.area}`;
      progFill.style.width = `${Math.round(((step + 1) / questions.length) * 100)}%`;
      qText.textContent = cur.q;
      optsWrap.innerHTML = '';

      cur.opts.forEach((opt, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'filter-btn';
        b.style.cssText = 'text-align:left; border-radius:8px; padding:13px 16px; width:100%; line-height:1.45;';
        b.setAttribute('aria-pressed', answers[step] === idx ? 'true' : 'false');
        b.textContent = opt.label;
        b.addEventListener('click', () => {
          answers[step] = idx;
          renderStep(false);
        });
        optsWrap.appendChild(b);
      });

      if (animate && quizPane) {
        quizPane.classList.remove('step-animate');
        void quizPane.offsetWidth;
        quizPane.classList.add('step-animate');
      }

      prevBtn.disabled = step === 0;
      nextBtn.innerHTML = step === questions.length - 1
        ? 'See How TrazaCore Helps <i class="bi bi-arrow-right"></i>'
        : 'Next Area <i class="bi bi-arrow-right"></i>';
    };

    prevBtn.addEventListener('click', () => {
      if (step > 0) {
        step--;
        renderStep(true);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (answers[step] === null) answers[step] = 0;
      if (step < questions.length - 1) {
        step++;
        renderStep(true);
      } else {
        const selectedMatches = answers
          .map((aIdx, qIdx) => questions[qIdx].opts[aIdx])
          .filter((o) => o && o.service);

        const count = selectedMatches.length;
        if (count > 0) {
          document.getElementById('assessScoreText').textContent = `${count} Priority Opportunity Area${count > 1 ? 's' : ''} Matched`;
          document.getElementById('assessTierText').textContent = 'Here is exactly how TrazaCore solves your identified bottlenecks:';
          document.getElementById('assessRecText').textContent = 'Because our modular approach targets high-impact areas first, you can implement these capabilities together or in phases without halting daily operations.';
        } else {
          document.getElementById('assessScoreText').textContent = 'Strong Baseline — Ready for Continuous Scale';
          document.getElementById('assessTierText').textContent = 'Where TrazaCore adds incremental value to high-performing teams:';
          document.getElementById('assessRecText').textContent = 'Even well-run supply chains benefit from predictive vendor delay alerts, automated ISO 27001 security monitoring, and client self-service portals.';
        }

        if (matchesWrap) {
          matchesWrap.innerHTML = '';
          const cardsToShow = count > 0
            ? selectedMatches
            : [
              {
                problem: 'Next-Level Margin & Scalability',
                service: 'Client-Owned Cloud & Proactive Analytics',
                solution: 'Automate supplier delay alerts, launch B2B self-service client tracking portals, and safeguard uptime with 24/7 local SLA support.',
                impact: 'Faster ROI expansion without extra IT overhead'
              },
              {
                problem: 'Security & Long-Term Independence',
                service: 'ISO 27001 Governance & Zero Lock-In',
                solution: 'Strengthen internal audit trails and retain full ownership of your cloud environment, code, and operational data.',
                impact: 'Audit-ready peace of mind'
              }
            ];

          cardsToShow.forEach((m) => {
            const card = document.createElement('div');
            card.className = 'solution-match-card';
            card.innerHTML = `<small>Bottleneck: ${m.problem}</small><h4>${m.service}</h4><p>${m.solution}</p><span class="impact-pill"><i class="bi bi-check-circle-fill"></i> ${m.impact}</span>`;
            matchesWrap.appendChild(card);
          });
        }

        const serviceList = selectedMatches.map((m) => m.service).join(', ') || 'Executive Operations Review';
        const contactCta = document.getElementById('assessToContact');
        if (contactCta) {
          contactCta.href = `contact.html?solutions=${encodeURIComponent(serviceList)}`;
        }
        quizPane.hidden = true;
        resultPane.hidden = false;
      }
    });

    document.getElementById('assessRetake')?.addEventListener('click', () => {
      step = 0;
      answers.fill(null);
      resultPane.hidden = true;
      quizPane.hidden = false;
      renderStep(true);
    });

    renderStep(false);
  }

  // 11. Contact Form Validation After Interaction + Pre-fill from Solution Finder + Dual-Site Map
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('solutions')) {
      const msg = document.getElementById('cfMessage');
      if (msg && !msg.value) {
        msg.value = `We used the TrazaCore Solution Finder and are interested in solving bottlenecks via: ${params.get('solutions')}. We would like to schedule a discovery session.`;
      }
    } else if (params.has('maturity')) {
      const msg = document.getElementById('cfMessage');
      if (msg && !msg.value) {
        msg.value = `We completed the diagnostic (${params.get('maturity')}% — ${params.get('tier') || ''}) and would like to schedule a discovery session.`;
      }
    }

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'visually-hidden';
    document.body.append(announcer);

    const linkError = (el, shown) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    };

    const supportsUserInvalid = CSS.supports && CSS.supports('selector(:user-invalid)');
    const touched = new WeakSet();

    const syncFieldAria = (el, announce = false) => {
      if (!el.matches?.('input, select, textarea')) return;
      const isInvalid = supportsUserInvalid
        ? el.matches(':user-invalid')
        : touched.has(el) && !el.validity.valid;
      if (!supportsUserInvalid && touched.has(el)) {
        el.classList.toggle('user-invalid-fallback', !el.validity.valid);
        el.classList.toggle('user-valid-fallback', el.validity.valid);
      }
      el.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
      linkError(el, isInvalid);
      if (announce && isInvalid && el.dataset.error) {
        const errEl = document.getElementById(el.dataset.error);
        if (errEl) announcer.textContent = errEl.textContent.trim();
      }
    };

    contactForm.querySelectorAll('input, select, textarea').forEach((el) => el.setAttribute('aria-invalid', 'false'));
    contactForm.addEventListener('blur', (e) => { touched.add(e.target); syncFieldAria(e.target, true); }, true);
    contactForm.addEventListener('input', (e) => syncFieldAria(e.target, false));
    contactForm.addEventListener('change', (e) => { touched.add(e.target); syncFieldAria(e.target, true); }, true);

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...contactForm.querySelectorAll('input, select, textarea')];
      let firstInvalid = null;
      fields.forEach((f) => {
        touched.add(f);
        if (!f.validity.valid && !firstInvalid) firstInvalid = f;
        syncFieldAria(f, false);
      });
      if (firstInvalid) {
        firstInvalid.focus();
        syncFieldAria(firstInvalid, true);
        return;
      }
      const out = document.getElementById('contactSuccess');
      const nameVal = document.getElementById('cfName').value.trim();
      const companyVal = document.getElementById('cfCompany').value.trim();
      if (out) {
        out.hidden = false;
        out.innerHTML = `<strong>Consultation Request Logged</strong><br>Thank you, <strong>${nameVal}</strong> (${companyVal}). Your technical inquiry has been queued for our Lima &amp; Callao engineering desk (<code>sales@trazacore.pe</code>). Expect a response within 4 business hours.`;
      }
      announcer.textContent = 'Consultation request submitted successfully.';
      contactForm.reset();
      fields.forEach((f) => {
        touched.delete(f);
        f.classList.remove('user-invalid-fallback', 'user-valid-fallback');
        f.setAttribute('aria-invalid', 'false');
        linkError(f, false);
      });
    });
  }

  // Dual-site OpenStreetMap switcher (contact.html)
  const mapFrame = document.getElementById('locationMapFrame');
  if (mapFrame) {
    const mapBtns = document.querySelectorAll('[data-map-src]');
    mapBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        mapBtns.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        mapFrame.src = btn.dataset.mapSrc;
        const lbl = document.getElementById('mapCaptionLabel');
        if (lbl) lbl.textContent = btn.dataset.mapLabel || '';
      });
    });
  }
})();
