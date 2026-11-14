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

  // Speaker notes script dictionary (synced with PPT.md)
  const speakerNotes = {
    1: {
      topic: "Introduction & Team Identity",
      notes: "Halo semuanya dan selamat datang pada presentasi tugas Case Based Searching mata kuliah Kecerdasan Buatan. Saya Ilham Lii Assidaq bersama rekan saya Lian dari kelompok kami. Pada kesempatan ini, kami mempresentasikan perancangan dan implementasi Algoritma Genetika yang kami bangun murni dari nol (from scratch) untuk menyelesaikan permasalahan optimasi minimasi fungsi non-linear kompleks multivariat."
    },
    2: {
      topic: "Definisi Masalah & Fungsi Objektif",
      notes: "Permasalahan yang kami selesaikan adalah mencari nilai x1 dan x2 pada interval [-10, 10] yang meminimalkan fungsi f(x1, x2). Tantangan utama fungsi ini terletak pada komponen tan(x1 + x2) yang memiliki asimtot tegak pada pi/2 + k*pi. Ketika input mendekati asimtot, nilai fungsi dapat turun drastis menuju minus tak hingga. Hal ini menuntut desain algoritma genetika yang kokoh agar tidak bias atau rusak secara numerik."
    },
    3: {
      topic: "Arsitektur Sistem & Siklus GA",
      notes: "Berdasarkan pedoman tugas, kami mengimplementasikan seluruh komponen GA secara mandiri tanpa menggunakan library pihak ketiga. Alur yang kami bangun menerapkan Varian 3, dimulai dari inisialisasi 74 individu berkode riil, dekode pemetaan linear, perhitungan fitness terkompresi logaritmik, seleksi roulette wheel, operasi pindah silang aritmatika, mutasi gaussian, dan elitisme untuk menjaga individu terbaik."
    },
    4: {
      topic: "Representasi Kromosom & Metode Dekode",
      notes: "Kromosom dirancang menggunakan representasi Real-Coded dengan 2 gen bernilai desimal antara 0.0 dan 1.0. Untuk mengevaluasi ke dalam fungsi objektif, gen tersebut didekode secara linear ke domain minus 10 hingga 10. Pendekatan real-coded ini sangat ideal untuk masalah optimasi kontinu karena menghindari masalah resolusi diskrit yang biasa terjadi pada representasi biner."
    },
    5: {
      topic: "Inovasi Fitness & Kompresi Logaritmik",
      notes: "Karena tujuan kita adalah minimasi, nilai f dikalikan minus satu agar menjadi masalah maksimasi. Namun, karena adanya asimtot tangen, nilai g bisa melonjak sangat besar dan memonopoli seleksi. Solusi inovatif yang kelompok kami terapkan adalah pergeseran baseline dan kompresi logaritmik: ln(1 + g - g_min). Melalui kompresi ini, individu terbaik tetap memiliki peluang tertinggi, namun individu lain tetap berkesempatan berevolusi."
    },
    6: {
      topic: "Mekanisme Seleksi Orang Tua (Roulette Wheel)",
      notes: "Untuk memilih orang tua yang akan bereproduksi, kami menggunakan metode Roulette Wheel Selection. Peluang terpilihnya suatu kromosom berbanding lurus dengan nilai fitness terkompresinya. Dengan memanfaatkan kumulatif fitness dan sampling acak, algoritma kami menyeimbangkan aspek eksploitasi solusi terbaik dengan eksplorasi gen-gen baru."
    },
    7: {
      topic: "Operasi Genetik (Crossover & Mutasi)",
      notes: "Operasi reproduksi genetik terdiri dari Arithmetic Crossover dan Gaussian Mutation. Pindah silang aritmatika dengan probabilitas 0.75 menghasilkan kombinasi linear halus antara kedua orang tua. Sedangkan mutasi Gaussian dengan simpangan baku 0.05 dan probabilitas 15% memberikan sedikit derau acak agar algoritma tidak terjebak pada optimum lokal."
    },
    8: {
      topic: "Pergantian Generasi (Elitisme) & Terminasi",
      notes: "Untuk pergantian generasi, kami menerapkan elitisme 5 persen, di mana 4 individu terbaik langsung diselamatkan ke generasi berikutnya agar pencapaian terbaik tidak hilang. Proses evolusi ini dikendalikan oleh tiga kriteria penghentian: tercapainya target ekstrem minus satu juta, batas 250 generasi, atau kondisi stagnan selama 40 generasi berturut-turut."
    },
    9: {
      topic: "Hasil Eksperimen & Analisis Output",
      notes: "Berikut adalah hasil pengujian program yang kami jalankan. Program berhenti pada generasi ke-116 karena tercapainya kondisi konvergensi stagnan selama 40 generasi. Solusi terbaik yang diperoleh menghasilkan kromosom dengan dekode x1 sekitar minus 1.8018 dan x2 sekitar 0.2312, dengan nilai minimum fungsi mencapai minus 4808.42. Ini membuktikan GA mampu menemukan wilayah lembah asimtotik yang sangat dalam."
    },
    10: {
      topic: "Kesimpulan & Goals yang Tercapai",
      notes: "Sebagai kesimpulan, seluruh target yang diberikan pada tugas Case Based Searching ini telah berhasil kami penuhi dengan baik. Program kami berjalan secara mandiri, stabil, dan sukses mengoptimasi fungsi non-linear yang menantang ini. Terima kasih atas perhatian teman-teman dan dosen pengampu, kami membuka ruang untuk sesi diskusi dan tanya jawab."
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
