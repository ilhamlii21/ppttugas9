// ==========================================================================
// OPTIMA-GA PRESENTATION CONTROLLER (script.js)
// Interactive slide manager, speaker notes, stopwatch timer & keyboard controls
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlide = 1;

  // DOM Elements
  const dockContainer = document.getElementById('dockContainer');
  const btnHideDock = document.getElementById('btnHideDock');
  const btnShowDock = document.getElementById('btnShowDock');
  const currentSlideNum = document.getElementById('currentSlideNum');
  const progressFill = document.getElementById('progressFill');
  const currentTopic = document.getElementById('currentTopic');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnNotesToggle = document.getElementById('btnNotesToggle');
  const notesDrawer = document.getElementById('notesDrawer');
  const btnCloseNotes = document.getElementById('btnCloseNotes');
  const notesContent = document.getElementById('notesContent');
  const notesSlideNum = document.getElementById('notesSlideNum');
  const timerDisplay = document.getElementById('timerDisplay');

  // Speaker notes script dictionary (synced with Binary GA code)
  const speakerNotes = {
    1: {
      topic: "Introduction & Team Identity",
      notes: "Halo semuanya dan selamat datang pada presentasi tugas Case Based Searching mata kuliah Kecerdasan Buatan. Saya Ilham Lii Assidaq bersama rekan saya Berlian Seva Astryana dari kelompok kami. Pada kesempatan ini, kami mempresentasikan perancangan dan implementasi Algoritma Genetika Biner (Binary-Coded GA) yang kami bangun murni dari nol untuk menyelesaikan permasalahan optimasi fungsi non-linear multivariat."
    },
    2: {
      topic: "Definisi Masalah & Fungsi Objektif",
      notes: "Tujuan tugas ini adalah mencari nilai x1 dan x2 pada rentang domain [-10, 10] yang meminimalkan fungsi objektif f(x1, x2). Tantangan paling krusial fungsi ini terletak pada komponen tan(x1 + x2) yang memiliki singularitas atau asimtot tegak ketika cosinusnya mendekati nol. Untuk mencegah program rusak atau overflow, kelompok kami merancang filter singularitas eksplisit dengan ambang batas epsilon 10 pangkat minus 4."
    },
    3: {
      topic: "Arsitektur Sistem & Siklus GA",
      notes: "Sesuai regulasi tugas, seluruh proses GA dibangun murni menggunakan modul standar Python math dan random tanpa bantuan library GA eksternal. Alur kerja algoritma dimulai dari inisialisasi 74 kromosom biner 32-bit, dekode ke desimal, evaluasi fitness invers berproteksi singularitas, seleksi turnamen ukuran 3, one-point crossover, mutasi bit-flip, serta elitisme 2 individu terbaik."
    },
    4: {
      topic: "Representasi Kromosom & Metode Dekode",
      notes: "Kromosom direpresentasikan sebagai untaian biner sepanjang 32 bit, di mana 16 bit pertama mengkodekan variabel x1 dan 16 bit berikutnya untuk x2. Masing-masing gen 16-bit dikonversi ke nilai desimal integer lalu dipetakan secara linear ke domain minus 10 hingga 10. Pendekatan 16-bit ini memberikan resolusi pencarian yang sangat presisi hingga 0,0003 per step bit."
    },
    5: {
      topic: "Inovasi Fitness & Filter Singularitas",
      notes: "Untuk menangani masalah minimasi, kami menggunakan fungsi fitness invers 1 dibagi (1 + selisih nilai f terhadap minimum populasi). Yang terpenting, kandidat yang memiliki nilai cos(x1 + x2) lebih kecil dari 10 pangkat minus 4 langsung didiskualifikasi dan diberi fitness 0,0. Ini menjamin populasi berevolusi di zona aman tanpa pernah memicu ZeroDivisionError."
    },
    6: {
      topic: "Mekanisme Seleksi Orang Tua (Tournament)",
      notes: "Untuk seleksi orang tua, kami menerapkan Tournament Selection dengan ukuran turnamen k = 3. Tiga individu diambil secara acak dari populasi, lalu diadu nilai fitness-nya. Pemenang turnamen langsung terpilih sebagai induk. Metode ini sangat unggul karena kebal terhadap distorsi skala nilai dan memberikan tekanan seleksi yang seimbang."
    },
    7: {
      topic: "Operasi Genetik (Crossover & Mutasi Biner)",
      notes: "Operasi reproduksi genetik menggunakan One-Point Crossover dengan probabilitas 0,85, di mana satu titik potong acak dipilih untuk saling menukar segmen kromosom induk. Sedangkan mutasi menggunakan Bit-Flip Mutation dengan probabilitas 0,02 per bit, di mana setiap bit berpeluang untuk dibalik nilainya guna mencegah algoritma terjebak pada optimum lokal."
    },
    8: {
      topic: "Pergantian Generasi (Elitisme) & Terminasi",
      notes: "Pada pergantian generasi, kami menerapkan elitisme 2 individu terbaik yang langsung disalin ke generasi baru tanpa modifikasi. Sisanya diisi oleh 72 keturunan hasil reproduksi. Proses evolusi dibatasi maksimal 250 generasi dan dilengkapi kriteria henti jika terjadi stagnasi selama 50 generasi berturut-turut, dengan RANDOM_SEED = 42 agar hasil selalu dapat direplikasi."
    },
    9: {
      topic: "Hasil Eksperimen & Analisis Output",
      notes: "Berdasarkan eksekusi program dengan seed 42, evolusi berhenti pada generasi ke-96 karena kondisi stagnasi 50 generasi terpenuhi. Solusi terbaik yang diperoleh menghasilkan kromosom biner dengan nilai x1 sekitar 1,5712 dan x2 sekitar minus 0,0007, dengan nilai minimum fungsi mencapai minus 1481,55. Koordinat ini berada tepat di bibir batas aman sebelum garis asimtot pi per 2."
    },
    10: {
      topic: "Kesimpulan & Goals yang Tercapai",
      notes: "Sebagai kesimpulan, seluruh target tugas telah berhasil kami penuhi dengan baik. Program kami berjalan secara mandiri, stabil berkat filter singularitas, dan menghasilkan nilai minimum yang optimal secara deterministik. Terima kasih atas perhatian dosen pengampu dan rekan-rekan sekalian, sesi tanya jawab dibuka untuk diskusi."
    }
  };

  // Update UI for active slide
  function goToSlide(slideIndex) {
    if (slideIndex < 1) slideIndex = 1;
    if (slideIndex > totalSlides) slideIndex = totalSlides;

    currentSlide = slideIndex;

    // Toggle active slide class
    slides.forEach((slide) => {
      const idx = parseInt(slide.getAttribute('data-slide'));
      if (idx === currentSlide) {
        slide.classList.add('active');
        const topic = slide.getAttribute('data-topic');
        currentTopic.textContent = topic || `Slide ${idx}`;
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Dock
    currentSlideNum.textContent = String(currentSlide).padStart(2, '0');
    progressFill.style.width = `${(currentSlide / totalSlides) * 100}%`;

    // Update Speaker Notes
    updateNotes();
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }

  function updateNotes() {
    const data = speakerNotes[currentSlide];
    notesSlideNum.textContent = currentSlide;
    if (data) {
      notesContent.innerHTML = `
        <p><strong>Topik:</strong> ${data.topic}</p>
        <div class="notes-script-quote">
          "${data.notes}"
        </div>
      `;
    }
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================

  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  // Fullscreen Toggle
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // Notes Drawer Toggle
  function toggleNotes() {
    notesDrawer.classList.toggle('open');
  }

  btnNotesToggle.addEventListener('click', toggleNotes);
  btnCloseNotes.addEventListener('click', () => {
    notesDrawer.classList.remove('open');
  });

  // Dock Hide / Show Toggle
  function toggleDockHide() {
    dockContainer.classList.toggle('dock-hidden');
  }

  if (btnHideDock) btnHideDock.addEventListener('click', toggleDockHide);
  if (btnShowDock) btnShowDock.addEventListener('click', toggleDockHide);

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key.toLowerCase() === 'n') {
      toggleNotes();
    } else if (e.key.toLowerCase() === 'h') {
      toggleDockHide();
    } else if (e.key.toLowerCase() === 'f') {
      btnFullscreen.click();
    } else if (e.key === 'Home') {
      goToSlide(1);
    } else if (e.key === 'End') {
      goToSlide(totalSlides);
    } else if (e.key >= '1' && e.key <= '9') {
      goToSlide(parseInt(e.key));
    } else if (e.key === '0') {
      goToSlide(10);
    }
  });

  // Touch Swipe for Mobile / Tablet Presentation
  let touchStartX = 0;
  let touchEndX = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
    }
  }

  // ==========================================================================
  // PRESENTATION STOPWATCH (COUNT UP FOR 5-MIN TALK)
  // ==========================================================================
  let secondsElapsed = 0;
  let timerInterval = null;

  function startTimer() {
    if (!timerInterval) {
      timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = Math.floor(secondsElapsed / 60);
        const secs = secondsElapsed % 60;
        timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        // Turn red if over 5 minutes (300 seconds)
        if (secondsElapsed > 300) {
          timerDisplay.style.color = '#ef4444';
        }
      }, 1000);
    }
  }

  // Start timer on first user interaction or slide change
  window.addEventListener('click', startTimer, { once: true });
  window.addEventListener('keydown', startTimer, { once: true });

  // Check hash in URL (e.g. index.html#5)
  function getSlideFromHash() {
    const hash = window.location.hash.replace('#', '');
    const num = parseInt(hash);
    if (!isNaN(num) && num >= 1 && num <= totalSlides) {
      return num;
    }
    return 1;
  }

  // Initial load
  goToSlide(getSlideFromHash());

  // Listen to hash changes
  window.addEventListener('hashchange', () => {
    goToSlide(getSlideFromHash());
  });
});
