import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMs_QBPLVwlASvATiwRK-Qd9SuqiEPqDc",
  authDomain: "manganest343632.firebaseapp.com",
  projectId: "manganest343632",
  storageBucket: "manganest343632.firebasestorage.app",
  messagingSenderId: "973182891353",
  appId: "1:973182891353:web:b061877af98ee34220c848",
  measurementId: "G-M7EGCX0BNH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const hero = document.getElementById("hero-mangas");
  const heroTitle = document.getElementById("heroTitle");
  const heroSynopsis = document.getElementById("heroSynopsis");
  const heroContent = document.getElementById("heroContent");
  const mangaGrid = document.getElementById("mangaGrid");

  let topMangaList = [];

  function getMangaTitle(manga) {
    const titles = manga.attributes?.title;
    if (!titles) return "No Title";
    if (titles.en) return titles.en;
    const firstLang = Object.keys(titles)[0];
    return titles[firstLang] || "No Title";
  }

  function seededShuffle(array) {
    const today = new Date().toISOString().slice(0, 10);
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    return [...array].sort((a, b) => (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0) + seed));
  }

  async function fetchTopManga() {
    const cacheKey = "topManga";
    const cacheTimeKey = "topManga_time";
    const now = Date.now();

    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cached && cachedTime && (now - cachedTime) < 86400000) {
      topMangaList = JSON.parse(cached);
      updateHero();
      populateGrid();
      return;
    }

    try {
      const response = await fetch("https://api.mangadex.org/manga?limit=10&order[followedCount]=desc&includes[]=cover_art");
      const data = await response.json();
      topMangaList = data.data || [];

      localStorage.setItem(cacheKey, JSON.stringify(topMangaList));
      localStorage.setItem(cacheTimeKey, now);

      updateHero();
      populateGrid();
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  function updateHero() {
    if (topMangaList.length === 0) return;
    const manga = topMangaList[Math.floor(Math.random() * topMangaList.length)];
    const title = getMangaTitle(manga);
    heroTitle.textContent = title;
    heroSynopsis.textContent = manga.attributes?.description?.en
      ? manga.attributes.description.en.replace(/\[.*?\]\(.*?\)/g, "").substring(0, 200) + "..."
      : "No synopsis available";

    const cover = manga.relationships?.find(rel => rel.type === "cover_art");
    const coverUrl = cover
      ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.512.jpg`
      : "https://via.placeholder.com/800x600?text=No+Cover";

    hero.style.backgroundImage = `url(${coverUrl})`;
    heroContent.classList.add("show");
  }

  function populateGrid() {
    mangaGrid.innerHTML = "";
    topMangaList.forEach(manga => {
      const title = getMangaTitle(manga);
      const cover = manga.relationships?.find(rel => rel.type === "cover_art");
      const coverUrl = cover
        ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`
        : "https://via.placeholder.com/150x220?text=No+Cover";

      const card = document.createElement("div");
      card.classList.add("manga-card");

      const img = document.createElement("img");
      img.src = coverUrl;
      img.alt = title;
      img.loading = "lazy";
      img.crossOrigin = "anonymous"; // Fix CORS issue
      card.appendChild(img);

      const infoDiv = document.createElement("div");
      infoDiv.classList.add("info");
      infoDiv.innerHTML = `<h3>${title}</h3><button id="readbtn-${manga.id}" class="readbtn">Read</button>`;
      card.appendChild(infoDiv);

      mangaGrid.appendChild(card);

      const readBtn = card.querySelector(`#readbtn-${manga.id}`);
      readBtn.addEventListener("click", () => {
        window.location.href = `detail.html?id=${manga.id}`;
      });
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user && userInfo) {
      userInfo.textContent = `Logged in as: ${user.displayName} (${user.email})`;
    } else if (userInfo) {
      userInfo.textContent = "Browsing as Guest";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "Singup.html";
      });
    });
  }

  const links = document.querySelectorAll(".icon-list a");
  links.forEach(link => {
    link.addEventListener("click", e => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  fetchTopManga();
  setInterval(updateHero, 10000);
});
