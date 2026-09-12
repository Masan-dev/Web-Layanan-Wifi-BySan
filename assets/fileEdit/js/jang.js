/* =====================================================================
   WI-SAN — SCRIPT.JS
   Semua interaksi: menu, tema, hero slider, statistik animasi,
   carousel produk & promo, modal produk, scroll-to-top.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------------------------------------
     1. TAHUN OTOMATIS DI FOOTER
  ----------------------------------------------------------------*/
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* -------------------------------------------------------------
     2. PANEL PENGATURAN (tombol garis tiga)
  ----------------------------------------------------------------*/
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const settingsClose = document.getElementById("settingsClose");
  const overlay = document.getElementById("overlay");

  function openSettings() {
    settingsPanel.classList.add("is-open");
    hamburgerBtn.classList.add("is-active");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    overlay.classList.add("is-visible");
  }
  function closeSettings() {
    settingsPanel.classList.remove("is-open");
    hamburgerBtn.classList.remove("is-active");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    overlay.classList.remove("is-visible");
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      settingsPanel.classList.contains("is-open") ? closeSettings() : openSettings();
    });
  }
  if (settingsClose) settingsClose.addEventListener("click", closeSettings);
  if (overlay) overlay.addEventListener("click", closeSettings);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSettings();
  });


  /* -------------------------------------------------------------
     3. MODE GELAP / TERANG
     Preferensi disimpan supaya tetap sama saat pindah halaman
  ----------------------------------------------------------------*/
  const themeToggle = document.getElementById("themeToggle");
  const themeToggleText = document.getElementById("themeToggleText");
  const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;

  function applyTheme(isLight) {
    document.body.classList.toggle("light-mode", isLight);
    if (themeToggleText) themeToggleText.textContent = isLight ? "Mode Terang" : "Mode Gelap";
    if (themeIcon) {
      themeIcon.classList.toggle("fa-moon", !isLight);
      themeIcon.classList.toggle("fa-sun", isLight);
    }
  }

  // <----> "wisan-theme" adalah kunci penyimpanan lokal, bisa diganti jika perlu ---->
  const savedTheme = localStorage.getItem("wisan-theme");
  applyTheme(savedTheme === "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLightNow = !document.body.classList.contains("light-mode");
      applyTheme(isLightNow);
      localStorage.setItem("wisan-theme", isLightNow ? "light" : "dark");
    });
  }


  /* -------------------------------------------------------------
     4. HERO SLIDER (maksimal 3 gambar, otomatis geser + kontrol manual)
  ----------------------------------------------------------------*/
  const heroSlider = document.getElementById("heroSlider");
  if (heroSlider) {
    const slides = Array.from(heroSlider.querySelectorAll(".hero-slide"));
    const dotsWrap = document.getElementById("heroDots");
    const prevBtn = document.getElementById("heroPrev");
    const nextBtn = document.getElementById("heroNext");

    let current = 0;
    let autoTimer = null;
    const AUTO_DELAY = 5500; // <----> Ubah durasi (ms) pergantian slide otomatis di sini ---->

    // Buat titik navigasi (dots) sejumlah slide yang ada
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Ke slide " + (i + 1));
      dot.addEventListener("click", () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.querySelectorAll(".hero-dot"));

    function goToSlide(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
      restartAuto();
    }

    function nextSlide() { goToSlide(current + 1); }
    function prevSlide() { goToSlide(current - 1); }

    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, AUTO_DELAY);
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    // Jeda otomatis saat kursor berada di atas hero, lanjut lagi saat menjauh
    heroSlider.addEventListener("mouseenter", () => clearInterval(autoTimer));
    heroSlider.addEventListener("mouseleave", restartAuto);

    // Geser (swipe) dengan jari untuk ganti gambar — dipakai terutama di HP,
    // menggantikan tombol panah yang disembunyikan di layar sempit
    let touchStartX = 0;
    const SWIPE_THRESHOLD = 40; // <----> Ubah jarak minimal (px) supaya dianggap swipe ---->

    heroSlider.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    heroSlider.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        delta < 0 ? nextSlide() : prevSlide();
      }
    });

    restartAuto();
  }


  /* -------------------------------------------------------------
     5. STATISTIK — ANGKA BERJALAN SAAT MASUK LAYAR
  ----------------------------------------------------------------*/
  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute("data-count"), 10);
      const duration = 1600; // <----> Ubah durasi animasi hitungan (ms) di sini ---->
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic supaya animasi melambat di akhir, terasa lebih halus
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString("id-ID");
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString("id-ID");
      }
      requestAnimationFrame(tick);
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    statNumbers.forEach((el) => statsObserver.observe(el));
  }


  /* -------------------------------------------------------------
     6. CAROUSEL PRODUK & PROMO
     Mendukung: geser dengan jari/mouse (drag) + tombol panah "<" ">"
  ----------------------------------------------------------------*/
    function initCarousel(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;

    const track = root.querySelector(".carousel-track");
    const arrowLeft = root.querySelector(".carousel-arrow-left");
    const arrowRight = root.querySelector(".carousel-arrow-right");

    function scrollByCard(direction) {
      const card = track.querySelector(":scope > *");
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width + 24;
      track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    }

    if (arrowLeft) arrowLeft.addEventListener("click", () => scrollByCard(-1));
    if (arrowRight) arrowRight.addEventListener("click", () => scrollByCard(1));

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let didDrag = false;
    let rafId = null;

    function dragStart(x) {
      isDown = true;
      didDrag = false;
      startX = x;
      scrollStart = track.scrollLeft;
      track.classList.add("is-dragging");
    }

    function dragMove(x) {
      if (!isDown) return;
      const delta = x - startX;
      if (Math.abs(delta) > 4) didDrag = true;
      
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        track.scrollLeft = scrollStart - delta;
      });
    }

    function dragEnd() {
      isDown = false;
      track.classList.remove("is-dragging");
    }

    track.addEventListener("mousedown", (e) => dragStart(e.pageX));
    window.addEventListener("mousemove", (e) => dragMove(e.pageX));
    window.addEventListener("mouseup", dragEnd);

    track.addEventListener("touchstart", (e) => dragStart(e.touches[0].pageX), { passive: true });
    track.addEventListener("touchmove", (e) => dragMove(e.touches[0].pageX), { passive: true });
    track.addEventListener("touchend", dragEnd);

    return { didDragCheck: () => didDrag };
  }


  const productCarousel = initCarousel("productCarousel");
  initCarousel("promoCarousel");


  /* -------------------------------------------------------------
     7. MODAL DETAIL PRODUK (muncul saat kartu produk ditekan/klik)
  ----------------------------------------------------------------*/
  const productModal = document.getElementById("productModal");
  if (productModal) {
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalPrice = document.getElementById("modalPrice");
    const modalClose = document.getElementById("productModalClose");

    const productCards = document.querySelectorAll(".product-card");

    function openModal(card) {
      modalImg.src = card.getAttribute("data-modal-img");
      modalImg.alt = card.getAttribute("data-modal-title") || "Produk Wi-San";
      modalTitle.textContent = card.getAttribute("data-modal-title");
      modalDesc.textContent = card.getAttribute("data-modal-desc");
      modalPrice.textContent = card.getAttribute("data-modal-price");
      productModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      productModal.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    productCards.forEach((card) => {
      card.addEventListener("click", () => {
        // Jangan buka modal kalau kartu baru saja di-drag/geser
        if (productCarousel && productCarousel.didDragCheck && productCarousel.didDragCheck()) return;
        openModal(card);
      });
      // Aksesibilitas: bisa dibuka dengan tombol Enter juga
      card.setAttribute("tabindex", "0");
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter") openModal(card);
      });
    });

    if (modalClose) modalClose.addEventListener("click", closeModal);
    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }


  /* -------------------------------------------------------------
     8. TOMBOL "KEMBALI KE ATAS"
  ----------------------------------------------------------------*/
  const scrollTopBtn = document.getElementById("scrollTop");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.classList.toggle("is-visible", window.scrollY > 480);
    });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }


  /* -------------------------------------------------------------
     9. MENU NAVIGASI MOBILE (opsional, jika lebar layar kecil)
     Membuka/menutup daftar menu utama pada layar sempit.
  ----------------------------------------------------------------*/
  const mainNav = document.getElementById("mainNav");
  if (mainNav) {
    mainNav.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => mainNav.classList.remove("is-open"));
    });
  }
  
    /* -------------------------------------------------------------
     MODAL KEBIJAKAN PRIVASI & SYARAT KETENTUAN
  ----------------------------------------------------------------*/
  const legalModal = document.getElementById("legalModal");
  const linkPrivacy = document.getElementById("linkPrivacy");
  const linkTerms = document.getElementById("linkTerms");
  const legalModalClose = document.getElementById("legalModalClose");
  const legalModalTitle = document.getElementById("legalModalTitle");
  const legalModalContent = document.getElementById("legalModalContent");

  const legalTexts = {
    privacy: {
      title: "Kebijakan Privasi",
      content: `
        <p>Selamat datang di Kebijakan Privasi Wi-San. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi yang Anda bagikan kepada kami.</p>
        <h4>1. Informasi yang Kami Kumpulkan</h4>
        <p>Kami mengumpulkan informasi kontak seperti nama, alamat email, nomor telepon, dan lokasi pemasangan saat Anda mendaftar atau menghubungi kami.</p>
        <h4>2. Penggunaan Informasi</h4>
        <p>Informasi Anda digunakan untuk memasang layanan internet, memproses pembayaran, mengelola akun, dan memberikan dukungan teknis 24/7.</p>
        <h4>3. Keamanan Data</h4>
        <p>Kami menerapkan langkah-langkah keamanan digital terbaik untuk memastikan data pribadi Anda tidak diakses oleh pihak yang tidak berwenang.</p>
        <h4>4. Hak Anda</h4>
        <p>Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda kapan saja melalui tim dukungan kami.</p>
      `
    },
    terms: {
      title: "Syarat & Ketentuan",
      content: `
        <p>Dengan menggunakan layanan Wi-San, Anda menyetujui syarat dan ketentuan yang berlaku di bawah ini:</p>
        <h4>1. Layanan & Pembayaran</h4>
        <p>Tagihan bulanan harus dibayar sesuai tanggal jatuh tempo yang tertera pada aplikasi Wi-San atau invoice resmi.</p>
        <h4>2. Penggunaan yang Wajar</h4>
        <p>Layanan internet tidak boleh digunakan untuk aktivitas ilegal, pelanggaran hak cipta, atau tindakan yang merugikan pengguna lain.</p>
        <h4>3. Perangkat & Pemasangan</h4>
        <p>Router dan peralatan modem yang disediakan tetap menjadi milik Wi-San selama masa berlangganan aktif.</p>
        <h4>4. Batas Tanggung Jawab</h4>
        <p>Wi-San berusaha memberikan uptime 99.9%, namun tidak bertanggung jawab atas gangguan yang disebabkan oleh bencana alam atau faktor di luar kendali teknis.</p>
      `
    }
  };

  function openLegalModal(type) {
    if (!legalModal || !legalTexts[type]) return;
    legalModalTitle.textContent = legalTexts[type].title;
    legalModalContent.innerHTML = legalTexts[type].content;
    legalModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLegalModal() {
    if (!legalModal) return;
    legalModal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (linkPrivacy) {
    linkPrivacy.addEventListener("click", (e) => {
      e.preventDefault(); // MENCEGAH LINK REFRESH / MELOMPAT
      openLegalModal("privacy");
    });
  }

  if (linkTerms) {
    linkTerms.addEventListener("click", (e) => {
      e.preventDefault(); // MENCEGAH LINK REFRESH / MELOMPAT
      openLegalModal("terms");
    });
  }

  if (legalModalClose) {
    legalModalClose.addEventListener("click", closeLegalModal);
  }

  if (legalModal) {
    legalModal.addEventListener("click", (e) => {
      if (e.target === legalModal) closeLegalModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && legalModal && legalModal.classList.contains("is-open")) {
      closeLegalModal();
    }
  });
  

});


/* ===== Pop-up Form Pemasangan ===== */
document.addEventListener("DOMContentLoaded", () => {
  const orderModal = document.getElementById("orderModal");
  if (!orderModal) return;

  const orderModalClose = document.getElementById("orderModalClose");
  const modalCtaBtn = document.getElementById("modalCtaBtn");
  const productModal = document.getElementById("productModal");

  const orderStepForm = document.getElementById("orderStepForm");
  const orderStepThanks = document.getElementById("orderStepThanks");
  const orderForm = document.getElementById("orderForm");
  const orderPackageName = document.getElementById("orderPackageName");
  const orderThanksName = document.getElementById("orderThanksName");
  const orderThanksPackage = document.getElementById("orderThanksPackage");

  const disclaimerBadgeBtn = document.getElementById("disclaimerBadgeBtn");
  const disclaimerTooltip = document.getElementById("disclaimerTooltip");

  const provinsiInput = document.getElementById("orderProvinsi");
  const namaInput = document.getElementById("orderNama");
  const emailInput = document.getElementById("orderEmail");
  const kontakCode = document.getElementById("orderKontakCode");
  const kontakNumber = document.getElementById("orderKontakNumber");

  /* --- Daftar kode negara (kode telepon) --- */
  const countryDialCodes = [
    { name: "Indonesia", dial: "+62" },
    { name: "Malaysia", dial: "+60" }, { name: "Singapura", dial: "+65" },
    { name: "Thailand", dial: "+66" }, { name: "Filipina", dial: "+63" },
    { name: "Vietnam", dial: "+84" }, { name: "Brunei", dial: "+673" },
    { name: "Kamboja", dial: "+855" }, { name: "Laos", dial: "+856" },
    { name: "Myanmar", dial: "+95" }, { name: "Timor Leste", dial: "+670" },
    { name: "India", dial: "+91" }, { name: "Pakistan", dial: "+92" },
    { name: "Bangladesh", dial: "+880" }, { name: "Sri Lanka", dial: "+94" },
    { name: "Nepal", dial: "+977" }, { name: "Bhutan", dial: "+975" },
    { name: "Maladewa", dial: "+960" }, { name: "Afghanistan", dial: "+93" },
    { name: "China", dial: "+86" }, { name: "Jepang", dial: "+81" },
    { name: "Korea Selatan", dial: "+82" }, { name: "Korea Utara", dial: "+850" },
    { name: "Taiwan", dial: "+886" }, { name: "Hong Kong", dial: "+852" },
    { name: "Makau", dial: "+853" }, { name: "Mongolia", dial: "+976" },
    { name: "Arab Saudi", dial: "+966" }, { name: "Uni Emirat Arab", dial: "+971" },
    { name: "Qatar", dial: "+974" }, { name: "Kuwait", dial: "+965" },
    { name: "Bahrain", dial: "+973" }, { name: "Oman", dial: "+968" },
    { name: "Yordania", dial: "+962" }, { name: "Lebanon", dial: "+961" },
    { name: "Suriah", dial: "+963" }, { name: "Irak", dial: "+964" },
    { name: "Iran", dial: "+98" }, { name: "Israel", dial: "+972" },
    { name: "Palestina", dial: "+970" }, { name: "Yaman", dial: "+967" },
    { name: "Turki", dial: "+90" },
    { name: "Rusia", dial: "+7" }, { name: "Kazakhstan", dial: "+7" },
    { name: "Ukraina", dial: "+380" }, { name: "Belarus", dial: "+375" },
    { name: "Polandia", dial: "+48" }, { name: "Ceko", dial: "+420" },
    { name: "Slowakia", dial: "+421" }, { name: "Hongaria", dial: "+36" },
    { name: "Rumania", dial: "+40" }, { name: "Bulgaria", dial: "+359" },
    { name: "Serbia", dial: "+381" }, { name: "Kroasia", dial: "+385" },
    { name: "Slovenia", dial: "+386" }, { name: "Bosnia dan Herzegovina", dial: "+387" },
    { name: "Montenegro", dial: "+382" }, { name: "Makedonia Utara", dial: "+389" },
    { name: "Albania", dial: "+355" }, { name: "Yunani", dial: "+30" },
    { name: "Italia", dial: "+39" }, { name: "Spanyol", dial: "+34" },
    { name: "Portugal", dial: "+351" }, { name: "Prancis", dial: "+33" },
    { name: "Jerman", dial: "+49" }, { name: "Belanda", dial: "+31" },
    { name: "Belgia", dial: "+32" }, { name: "Luksemburg", dial: "+352" },
    { name: "Swiss", dial: "+41" }, { name: "Austria", dial: "+43" },
    { name: "Inggris (UK)", dial: "+44" }, { name: "Irlandia", dial: "+353" },
    { name: "Denmark", dial: "+45" }, { name: "Swedia", dial: "+46" },
    { name: "Norwegia", dial: "+47" }, { name: "Finlandia", dial: "+358" },
    { name: "Islandia", dial: "+354" }, { name: "Estonia", dial: "+372" },
    { name: "Latvia", dial: "+371" }, { name: "Lithuania", dial: "+370" },
    { name: "Moldova", dial: "+373" }, { name: "Georgia", dial: "+995" },
    { name: "Armenia", dial: "+374" }, { name: "Azerbaijan", dial: "+994" },
    { name: "Amerika Serikat", dial: "+1" }, { name: "Kanada", dial: "+1" },
    { name: "Meksiko", dial: "+52" }, { name: "Brasil", dial: "+55" },
    { name: "Argentina", dial: "+54" }, { name: "Chili", dial: "+56" },
    { name: "Kolombia", dial: "+57" }, { name: "Peru", dial: "+51" },
    { name: "Venezuela", dial: "+58" }, { name: "Ekuador", dial: "+593" },
    { name: "Bolivia", dial: "+591" }, { name: "Paraguay", dial: "+595" },
    { name: "Uruguay", dial: "+598" }, { name: "Guyana", dial: "+592" },
    { name: "Suriname", dial: "+597" }, { name: "Kuba", dial: "+53" },
    { name: "Republik Dominika", dial: "+1" }, { name: "Haiti", dial: "+509" },
    { name: "Jamaika", dial: "+1" }, { name: "Panama", dial: "+507" },
    { name: "Kosta Rika", dial: "+506" }, { name: "Nikaragua", dial: "+505" },
    { name: "Honduras", dial: "+504" }, { name: "El Salvador", dial: "+503" },
    { name: "Guatemala", dial: "+502" }, { name: "Belize", dial: "+501" },
    { name: "Australia", dial: "+61" }, { name: "Selandia Baru", dial: "+64" },
    { name: "Papua Nugini", dial: "+675" }, { name: "Fiji", dial: "+679" },
    { name: "Mesir", dial: "+20" }, { name: "Libya", dial: "+218" },
    { name: "Tunisia", dial: "+216" }, { name: "Aljazair", dial: "+213" },
    { name: "Maroko", dial: "+212" }, { name: "Sudan", dial: "+249" },
    { name: "Sudan Selatan", dial: "+211" }, { name: "Ethiopia", dial: "+251" },
    { name: "Eritrea", dial: "+291" }, { name: "Djibouti", dial: "+253" },
    { name: "Somalia", dial: "+252" }, { name: "Kenya", dial: "+254" },
    { name: "Uganda", dial: "+256" }, { name: "Tanzania", dial: "+255" },
    { name: "Rwanda", dial: "+250" }, { name: "Burundi", dial: "+257" },
    { name: "Republik Demokratik Kongo", dial: "+243" }, { name: "Republik Kongo", dial: "+242" },
    { name: "Gabon", dial: "+241" }, { name: "Kamerun", dial: "+237" },
    { name: "Nigeria", dial: "+234" }, { name: "Ghana", dial: "+233" },
    { name: "Pantai Gading", dial: "+225" }, { name: "Senegal", dial: "+221" },
    { name: "Mali", dial: "+223" }, { name: "Burkina Faso", dial: "+226" },
    { name: "Niger", dial: "+227" }, { name: "Chad", dial: "+235" },
    { name: "Republik Afrika Tengah", dial: "+236" }, { name: "Benin", dial: "+229" },
    { name: "Togo", dial: "+228" }, { name: "Guinea", dial: "+224" },
    { name: "Guinea-Bissau", dial: "+245" }, { name: "Sierra Leone", dial: "+232" },
    { name: "Liberia", dial: "+231" }, { name: "Gambia", dial: "+220" },
    { name: "Mauritania", dial: "+222" }, { name: "Tanjung Verde", dial: "+238" },
    { name: "Angola", dial: "+244" }, { name: "Zambia", dial: "+260" },
    { name: "Zimbabwe", dial: "+263" }, { name: "Mozambik", dial: "+258" },
    { name: "Malawi", dial: "+265" }, { name: "Namibia", dial: "+264" },
    { name: "Botswana", dial: "+267" }, { name: "Afrika Selatan", dial: "+27" },
    { name: "Lesotho", dial: "+266" }, { name: "Eswatini", dial: "+268" },
    { name: "Madagaskar", dial: "+261" }, { name: "Mauritius", dial: "+230" },
    { name: "Seychelles", dial: "+248" }, { name: "Komoro", dial: "+269" }
  ];

  function populateCountryCodes() {
    if (!kontakCode) return;
    countryDialCodes.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.dial;
      opt.textContent = c.name + " (" + c.dial + ")";
      kontakCode.appendChild(opt);
    });
  }
  populateCountryCodes();

  // Deteksi kode negara otomatis dari angka yang diketik di kolom nomor
  function detectCountryFromNumber(raw) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return null;

    // Diawali 0 dianggap format lokal Indonesia (contoh: 0812...)
    if (digits.startsWith("0")) return "+62";

    // Cari kode negara (tanpa "+") yang paling panjang cocok di awal angka
    let best = "";
    countryDialCodes.forEach((c) => {
      const codeDigits = c.dial.replace("+", "");
      if (digits.startsWith(codeDigits) && codeDigits.length > best.length) {
        best = codeDigits;
      }
    });
    return best ? "+" + best : null;
  }

  if (kontakNumber && kontakCode) {
    kontakNumber.addEventListener("input", () => {
      const value = kontakNumber.value.trim();
      if (!value) {
        kontakCode.value = ""; // dikosongkan lagi -> kode negara ikut kosong
        return;
      }
      const detected = detectCountryFromNumber(value);
      if (detected) kontakCode.value = detected;
    });
  }

  function openOrderModal(packageName) {
    orderPackageName.textContent = packageName ? "— " + packageName : "";
    orderModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function resetOrderForm() {
    orderStepThanks.classList.remove("is-active");
    orderStepForm.classList.add("is-active");
    orderForm.reset();
    disclaimerTooltip.classList.remove("is-open");
    [provinsiInput, namaInput, emailInput, kontakNumber].forEach((el) => el.classList.remove("invalid"));
    document.querySelectorAll(".field-error").forEach((el) => el.classList.remove("is-visible"));
  }

  function closeOrderModal() {
    orderModal.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(resetOrderForm, 300);
  }

  if (modalCtaBtn) {
    modalCtaBtn.addEventListener("click", () => {
      const modalTitle = document.getElementById("modalTitle");
      const packageName = modalTitle ? modalTitle.textContent : "";
      if (productModal) productModal.classList.remove("is-open");
      window.setTimeout(() => openOrderModal(packageName), 200);
    });
  }

  if (orderModalClose) orderModalClose.addEventListener("click", closeOrderModal);
  const orderThanksCloseBtn = document.getElementById("orderThanksClose");
  if (orderThanksCloseBtn) orderThanksCloseBtn.addEventListener("click", closeOrderModal);

  orderModal.addEventListener("click", (e) => {
    if (e.target === orderModal) closeOrderModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && orderModal.classList.contains("is-open")) closeOrderModal();
  });

  if (disclaimerBadgeBtn) {
    disclaimerBadgeBtn.addEventListener("click", () => {
      disclaimerTooltip.classList.toggle("is-open");
    });
    document.addEventListener("click", (e) => {
      if (!disclaimerBadgeBtn.contains(e.target) && !disclaimerTooltip.contains(e.target)) {
        disclaimerTooltip.classList.remove("is-open");
      }
    });
  }

  /* --- Validasi form sebelum terkirim --- */
  function showFieldError(inputEl, errEl, message) {
    if (inputEl) inputEl.classList.add("invalid");
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add("is-visible");
    }
  }

  function clearFieldError(inputEl, errEl) {
    if (inputEl) inputEl.classList.remove("invalid");
    if (errEl) errEl.classList.remove("is-visible");
  }

  // Hapus error otomatis begitu user mulai mengetik ulang
  [
    [provinsiInput, "errProvinsi"],
    [namaInput, "errNama"],
    [emailInput, "errEmail"],
    [kontakNumber, "errKontak"]
  ].forEach(([inputEl, errId]) => {
    if (!inputEl) return;
    inputEl.addEventListener("input", () => clearFieldError(inputEl, document.getElementById(errId)));
  });
  if (kontakCode) {
    kontakCode.addEventListener("change", () => clearFieldError(kontakNumber, document.getElementById("errKontak")));
  }

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      const errProvinsi = document.getElementById("errProvinsi");
      const errNama = document.getElementById("errNama");
      const errEmail = document.getElementById("errEmail");
      const errKontak = document.getElementById("errKontak");

      clearFieldError(provinsiInput, errProvinsi);
      clearFieldError(namaInput, errNama);
      clearFieldError(emailInput, errEmail);
      clearFieldError(kontakNumber, errKontak);

      if (!provinsiInput.value.trim()) {
        showFieldError(provinsiInput, errProvinsi, "Provinsi / alamat wajib diisi.");
        isValid = false;
      }

      if (!namaInput.value.trim()) {
        showFieldError(namaInput, errNama, "Nama lengkap wajib diisi.");
        isValid = false;
      }

      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        showFieldError(emailInput, errEmail, "Gmail wajib diisi.");
        isValid = false;
      } else if (!emailVal.includes("@")) {
        showFieldError(emailInput, errEmail, "Gmail harus mengandung tanda '@'.");
        isValid = false;
      }

      if (!kontakCode.value) {
        showFieldError(kontakNumber, errKontak, "Pilih kode negara dulu (ketik nomornya juga bisa, kode akan terisi otomatis).");
        isValid = false;
      } else if (!kontakNumber.value.trim()) {
        showFieldError(kontakNumber, errKontak, "Nomor kontak wajib diisi.");
        isValid = false;
      }

      if (!isValid) {
        orderForm.classList.add("shake");
        window.setTimeout(() => orderForm.classList.remove("shake"), 450);
        return;
      }

      const nama = namaInput.value.trim();
      orderThanksName.textContent = nama || "Kak";
      orderThanksPackage.textContent = orderPackageName.textContent.replace("— ", "");
      orderStepForm.classList.remove("is-active");
      orderStepThanks.classList.add("is-active");
    });
  }
});

/* ===== Animasi muncul saat discroll (scroll reveal), berlaku di semua halaman ===== */
document.addEventListener("DOMContentLoaded", () => {
  const revealSelector = [
    ".section-head", ".stat-card", ".product-card", ".promo-card",
    ".sponsor-logo", ".footer-col", ".about-card", ".timeline-item",
    ".team-card", ".about-cta"
  ].join(", ");

  const revealEls = document.querySelectorAll(revealSelector);
  if (!revealEls.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  revealEls.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", (i % 6) * 0.08 + "s");
  });

  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
});
