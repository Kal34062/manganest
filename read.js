const urlParams = new URLSearchParams(window.location.search);
const mangaId = urlParams.get("id");

const chapterSelect = document.getElementById("chapter-select");
const pagesDiv = document.getElementById("pages");
const titleEl = document.getElementById("chapter-title");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const scrollTopBtn = document.getElementById("scroll-top-btn");

let chapters = [];
let currentChapterIndex = 0;
let currentPageIndex = 0;
let pages = [];
let touchStartX = 0;
let touchEndX = 0;
const STORAGE_KEY = `manga-${mangaId}-progress`;

// Load chapters from MangaDex
async function loadChapters(mangaId) {
  try {
    const res = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=en&order[chapter]=asc&limit=100`);
    const data = await res.json();
    
    if (!data.data.length) {
      titleEl.textContent = "No chapters available";
      return;
    }
    
    chapters = data.data;
    
    // Populate chapter dropdown
    chapterSelect.innerHTML = "";
    chapters.forEach((chap, i) => {
      const option = document.createElement("option");
      option.value = chap.id;
      option.textContent = `Chapter ${chap.attributes.chapter || "?"}`;
      chapterSelect.appendChild(option);
    });
    
    // Load saved progress
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { chapterIndex: 0, pageIndex: 0 };
    currentChapterIndex = saved.chapterIndex < chapters.length ? saved.chapterIndex : 0;
    
    await loadChapterPages(chapters[currentChapterIndex], saved.pageIndex);
    
    // Event listeners
    chapterSelect.addEventListener("change", async () => {
      currentChapterIndex = chapterSelect.selectedIndex;
      await loadChapterPages(chapters[currentChapterIndex], 0);
    });
    
    prevBtn.addEventListener("click", () => navigatePage(-1));
    nextBtn.addEventListener("click", () => navigatePage(1));
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    
    window.addEventListener("scroll", () => {
      scrollTopBtn.style.display = window.scrollY > 300 ? "inline-block" : "none";
    });
    
    // Swipe gestures
    pagesDiv.addEventListener("touchstart", e => touchStartX = e.changedTouches[0].screenX);
    pagesDiv.addEventListener("touchend", e => {
      touchEndX = e.changedTouches[0].screenX;
      handlePageSwipe();
    });
    
  } catch (err) {
    console.error("Error loading chapters:", err);
    titleEl.textContent = "Failed to load chapters";
  }
}

// Navigate page
function navigatePage(dir) {
  currentPageIndex += dir;
  
  if (currentPageIndex < 0) {
    if (currentChapterIndex > 0) {
      currentChapterIndex--;
      loadChapterPages(chapters[currentChapterIndex], pages.length - 1);
    } else currentPageIndex = 0;
  } else if (currentPageIndex >= pages.length) {
    if (currentChapterIndex < chapters.length - 1) {
      currentChapterIndex++;
      loadChapterPages(chapters[currentChapterIndex], 0);
    } else currentPageIndex = pages.length - 1;
  } else {
    showCurrentPage();
  }
  
  saveProgress();
}

// Swipe detection
function handlePageSwipe() {
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? navigatePage(-1) : navigatePage(1);
  }
}

// Load chapter pages
async function loadChapterPages(chap, startPage = 0) {
  try {
    titleEl.textContent = `Chapter ${chap.attributes.chapter || "?"}`;
    pagesDiv.innerHTML = "<p style='color:#999;'>Loading...</p>";
    
    const atRes = await fetch(`https://api.mangadex.org/at-home/server/${chap.id}`);
    const atData = await atRes.json();
    const baseUrl = atData.baseUrl;
    const hash = atData.chapter.hash;
    pages = atData.chapter.dataSaver;
    
    pagesDiv.innerHTML = "";
    pages.forEach((filename, index) => {
      const img = document.createElement("img");
      img.src = `${baseUrl}/data-saver/${hash}/${filename}`;
      img.alt = `Page ${index + 1}`;
      img.loading = "lazy";
      img.style.display = "none";
      img.classList.add("page-img");
      
      img.addEventListener("click", () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (img.requestFullscreen) img.requestFullscreen();
      });
      
      pagesDiv.appendChild(img);
    });
    
    currentPageIndex = startPage;
    chapterSelect.selectedIndex = currentChapterIndex;
    showCurrentPage();
  } catch (err) {
    console.error("Error loading chapter pages:", err);
    pagesDiv.innerHTML = "<p style='color:red;'>Failed to load pages</p>";
  }
}

// Show current page with animation
function showCurrentPage() {
  const imgs = pagesDiv.querySelectorAll("img");
  imgs.forEach((img, i) => {
    img.classList.remove("active");
    if (i === currentPageIndex) {
      img.style.display = "block";
      setTimeout(() => img.classList.add("active"), 50);
    } else img.style.display = "none";
  });
  
  prevBtn.disabled = currentChapterIndex === 0 && currentPageIndex === 0;
  nextBtn.disabled = currentChapterIndex === chapters.length - 1 && currentPageIndex === pages.length - 1;
  
  window.scrollTo({ top: 0, behavior: "smooth" });
  saveProgress();
}

// Save reading progress
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    chapterIndex: currentChapterIndex,
    pageIndex: currentPageIndex
  }));
}

if (mangaId) loadChapters(mangaId);
else titleEl.textContent = "No manga selected";