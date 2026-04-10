document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // SCROLL PROGRESS BAR
  // =====================
  const scrollProg = document.getElementById('scroll-progress');
  if (scrollProg) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollProg.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
    });
  }

  // =====================
  // PAGE TRANSITIONS
  // =====================
  const skin = document.getElementById('page-skin');

  if (skin) {
    skin.classList.add('entering');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      skin.style.transition = 'transform 0.8s cubic-bezier(0.77,0,0.175,1)';
      skin.classList.remove('entering');
      skin.classList.add('leaving');
      setTimeout(() => skin.classList.remove('leaving'), 900);
    }));
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || link.target === '_blank') return;
      e.preventDefault();
      if (skin) {
        skin.classList.remove('leaving');
        skin.style.transition = 'transform 0.6s cubic-bezier(0.77,0,0.175,1)';
        skin.classList.add('entering');
        setTimeout(() => window.location.href = href, 650);
      } else {
        window.location.href = href;
      }
    });
  });

  // Animate hero image on load
  const hero = document.querySelector('.hero');
  if (hero) setTimeout(() => hero.classList.add('loaded'), 100);

  // =====================
  // STICKY HEADER
  // =====================
  const header = document.getElementById('header');
  if (header && header.classList.contains('transparent')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.remove('transparent');
        header.classList.add('solid');
      } else {
        header.classList.remove('solid');
        header.classList.add('transparent');
      }
    });
  }

  // =====================
  // CURSOR + TRAIL
  // =====================
  const cursor = document.getElementById('cursor');
  const trailCount = 8;
  const trails = [];

  if (window.matchMedia('(pointer: fine)').matches) {
    for (let i = 0; i < trailCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('trail-dot');
      document.body.appendChild(dot);
      trails.push({ el: dot, x: 0, y: 0 });
    }

    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top  = mouseY + 'px';
      }
    });

    const animTrail = () => {
      let x = mouseX, y = mouseY;
      trails.forEach((trail, i) => {
        const prevX = parseFloat(trail.el.style.left) || x;
        const prevY = parseFloat(trail.el.style.top)  || y;
        const lag = 0.35 + i * 0.05;
        const nx = prevX + (x - prevX) * lag;
        const ny = prevY + (y - prevY) * lag;
        trail.el.style.left = nx + 'px';
        trail.el.style.top  = ny + 'px';
        trail.el.style.opacity = (1 - i / trailCount) * 0.5;
        trail.el.style.width  = Math.max(3, 8 - i) + 'px';
        trail.el.style.height = Math.max(3, 8 - i) + 'px';
        x = nx; y = ny;
      });
      requestAnimationFrame(animTrail);
    };
    animTrail();

    // Cursor enlarge on interactables
    document.querySelectorAll('a, button, .filter-btn, .masonry-item, .bento-item, .price-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cursor && cursor.classList.add('enlarged'));
      el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('enlarged'));
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // =====================
  // HERO TITLE CHAR SPLIT ANIMATION
  // =====================
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const lines = heroTitle.innerHTML.split('<br>');
    heroTitle.innerHTML = lines.map((line, lineIdx) => {
      const chars = line.replace(/<[^>]*>/g, c => `\0${c}\0`).split('\0');
      let charCount = 0;
      return chars.map(piece => {
        if (piece.startsWith('<')) return piece;
        return piece.split('').map(ch => {
          if (ch === ' ') return ' ';
          const delay = (lineIdx * 0.15 + charCount++ * 0.03).toFixed(2);
          return `<span class="char" style="animation-delay:${delay}s">${ch}</span>`;
        }).join('');
      }).join('');
    }).join('<br>');
  }

  // =====================
  // PARALLAX — HERO IMAGE
  // =====================
  const heroRight = document.querySelector('.hero-right img');
  if (heroRight) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroRight.style.transform = `scale(1.06) translateY(${scrolled * 0.12}px)`;
    });
  }

  // =====================
  // SCROLL REVEAL
  // =====================
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealEls.forEach(el => observer.observe(el));

  // =====================
  // GALLERY FILTERS
  // =====================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');
  const badge = document.getElementById('gallery-badge');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      let visibleCount = 0;

      masonryItems.forEach((item, i) => {
        const cat = item.dataset.category;
        const matches = filter === 'all' || cat === filter;
        if (matches) {
          visibleCount++;
          item.style.display = 'block';
          item.style.animation = 'none';
          item.offsetHeight; // reflow
          item.style.animationDelay = `${i * 0.04}s`;
          item.style.animation = 'itemFlyIn 0.6s cubic-bezier(0.16,1,0.3,1) both';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.92)';
          setTimeout(() => { item.style.display = 'none'; }, 350);
        }
      });

      if (badge) {
        badge.textContent = `${visibleCount} Work${visibleCount !== 1 ? 's' : ''}`;
        badge.classList.add('show');
        setTimeout(() => badge.classList.remove('show'), 2500);
      }
    });
  });

  // Show badge on scroll into gallery section
  const galleryMasonry = document.getElementById('gallery-masonry');
  if (galleryMasonry && badge) {
    const galleryObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          badge.classList.add('show');
        } else {
          badge.classList.remove('show');
        }
      });
    }, { threshold: 0.1 });
    galleryObserver.observe(galleryMasonry);
  }

  // =====================
  // GALLERY SPOTLIGHT EFFECT
  // =====================
  if (galleryMasonry) {
    galleryMasonry.addEventListener('mousemove', e => {
      galleryMasonry.style.setProperty('--spot-x', e.clientX + 'px');
      galleryMasonry.style.setProperty('--spot-y', e.clientY + 'px');
      galleryMasonry.classList.add('spotlit');
    });
    galleryMasonry.addEventListener('mouseleave', () => {
      galleryMasonry.classList.remove('spotlit');
    });
  }

  // =====================
  // ART CARD PANEL
  // =====================
  const artPanel    = document.getElementById('art-card-panel');
  const artOverlay  = document.getElementById('art-card-overlay');
  const artClose    = document.getElementById('art-card-close');

  const descriptions = {
    'Divine Harmony':     'A devotional duet — Krishna and Radha face each other in an intimate moment of divine love. Bold outlines, warm reds, and fluid forms make this one of Aayushi\'s most expressive spiritual works.',
    'Cubist Echoes':      'Three abstracted faces layer over each other in a Picasso-inspired cubist composition. Each plane of color tells a different story of emotion and identity.',
    'Melodies of Folk':   'Two traditional Indian dancers in vibrant attire, embodying the rhythm of classical folk music. The sapphire and crimson against gold create a visual song on the canvas.',
    'Sunset Rhythm':      'An African folk figure seated against a blazing sunset, cloaked in geometric patterns and vivid tribal dress. Bold, rhythmic, and deeply warm.',
    'Fire Mandala':       'An intricate mandala created through dot painting on a circular plate. Deep reds, fiery oranges and bright yellows spiral outward in a mesmerizing pattern of sacred geometry.',
    'Spirit of the Earth':'Inspired by the wandering spirit — a folk figure resting under a golden sky, adorned with earthy geometrics that pulse with life and motion.',
    'Devotion':           'A canvas exploring pure spiritual devotion, rendered in Aayushi\'s signature bold-outline style. The composition radiates reverence and quiet intensity.',
    "Radha's Reverie":    "Radha lost in thought — her expression serene, her colors luminous. One of the most emotionally resonant works in the collection.",
    'Warm Horizon':       'An earthy landscape of folk figures against a terracotta horizon. The palette glows warmly as the figures reach toward light and sky.',
    'Golden Hour':        'The magic of the golden hour captured in paint — light rippling across figures and form in shimmering hues of amber, ochre, and cream.',
    'Inner Light':        'A quiet introspective figure painting exploring the inner world — soft, contemplative, and deeply personal.',
    'Folk Dancer':        'A traditional dancer caught mid-motion, rendered in flowing lines and jewel-toned costume detail. Celebrates the vibrancy of Indian performing arts.',
    'Abstract Flow':      'Pure abstraction — fluid forms bleed into each other across the canvas, creating an energetic composition driven by color temperature and movement.',
    'Sacred Bond':        'Two figures connected through a sacred thread of devotion. The painting speaks of spiritual bonds that transcend the physical.',
    'Village Song':       'Women gathered in watercolour warmth, singing a village song passed through generations. Soft, nostalgic, and full of quiet joy.',
    'Earth Mandala':      'A nature-rooted mandala with earthy greens, sienna, and cream. Precision dot-work creates mesmerizing symmetry that rewards close looking.',
    'Whispers of Blue':   'Figures draped in deep indigo and midnight blue whisper stories across the canvas. Peaceful, cool, and hauntingly beautiful.',
    'Tribal Bloom':       'A celebration of tribal pride — bold geometric outlines, ceremonial dress, and a blooming spirit that leaps off the canvas.',
    'Calm Before Storm':  'Stillness before chaos. Light is balanced on a knife\'s edge in this mixed-media composition of shifting tones and quiet tension.',
    'Serenade':           'A musician serenades the sky — the composition captures sound itself, translating music into color, gesture, and grace.',
    'Star Mandala':       'A celestial mandala of dots arranged in radiant stellar patterns. Meditative to create, mesmerizing to observe.',
    'Color Theory':       'An exercise in pure chromatic emotion. No subject, only color — placed deliberately to produce tension, harmony, and visual delight.',
    'Desert Queen':       'A regal folk figure rules the desert in this commanding canvas. Patterned garments, proud posture, and a blazing sky behind.',
    'Inward Gaze':        'A figure turned within — eyes closed, presence complete. One of the most intimate and minimalist works in the collection.',
  };

  function openArtCard(item) {
    if (!artPanel || !artOverlay) return;
    const img   = item.querySelector('img');
    const title = item.dataset.title  || 'Untitled';
    const med   = item.dataset.medium || 'Original Artwork';
    const price = item.dataset.price  || 'Price on Request';
    const desc  = item.dataset.desc   || descriptions[title] || 'An original hand-painted artwork by Aayushi Rajsinha. Each piece is unique and signed by the artist.';

    document.getElementById('art-card-img').src              = img ? img.src : '';
    document.getElementById('art-card-title').textContent    = title;
    document.getElementById('art-card-medium').textContent   = med;
    document.getElementById('art-card-price').textContent    = price;
    document.getElementById('art-card-desc').textContent     = desc;
    document.getElementById('art-card-badge').textContent    = med.split('·')[0].trim() || 'Original';

    artPanel.classList.add('open');
    artOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeArtCard() {
    if (!artPanel || !artOverlay) return;
    artPanel.classList.remove('open');
    artOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Attach to bento items (index.html)
  document.querySelectorAll('.bento-item').forEach(item => {
    item.style.cursor = 'none';
    item.addEventListener('click', () => openArtCard(item));
  });

  // Attach to masonry items (gallery.html)
  document.querySelectorAll('.masonry-item').forEach(item => {
    item.style.cursor = 'none';
    item.addEventListener('click', e => {
      if (e.target.closest('.price-btn')) return;
      openArtCard(item);
    });
  });

  // Price buttons also open the card
  document.querySelectorAll('.price-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openArtCard(btn.closest('.masonry-item'));
    });
  });

  if (artClose)   artClose.addEventListener('click', closeArtCard);
  if (artOverlay) artOverlay.addEventListener('click', closeArtCard);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeArtCard(); });

  // =====================
  // BENTO ITEM 3D TILT
  // =====================
  document.querySelectorAll('.bento-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      item.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(8px)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });

  // =====================
  // AMBIENT ORB PARALLAX (subtle mouse follow)
  // =====================
  const orbs = document.querySelectorAll('.glow-orb');
  if (orbs.length && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 12;
        orb.style.transform = `translate(${cx * factor}px, ${cy * factor}px)`;
      });
    });
  }

});
