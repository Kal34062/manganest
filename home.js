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
  onAuthStateChanged(auth, user => {
    if (user && userInfo) userInfo.textContent = `Logged in as: ${user.displayName || "User"} (${user.email})`;
    else if (userInfo) userInfo.textContent = "Browsing as Guest";
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => signOut(auth).then(() => window.location.href = "Singup.html"));
  }

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
    return titles[Object.keys(titles)[0]] || "No Title";
  }

  async function fetchTopManga() {
    const cacheKey = "topManga";
    const cacheTimeKey = "topManga_time";
    const now = Date.now();

    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    if (cached && cachedTime && (now - cachedTime) < 86400000) { // 24h cache
      topMangaList = JSON.parse(cached);
      updateHero();
      populateGrid();
      return;
    }

    try {
      const res = await fetch("https://api.mangadex.org/manga?limit=10&order[followedCount]=desc&includes[]=cover_art");
      const data = await res.json();
      topMangaList = data.data || [];
      localStorage.setItem(cacheKey, JSON.stringify(topMangaList));
      localStorage.setItem(cacheTimeKey, now);
      updateHero();
      populateGrid();
    } catch (err) {
      console.error("Failed to fetch MangaDex:", err);
    }
  }

  function updateHero() {
    if (!topMangaList.length) return;
    const manga = topMangaList[Math.floor(Math.random() * topMangaList.length)];
    heroTitle.textContent = getMangaTitle(manga);
    heroSynopsis.textContent = manga.attributes?.description?.en
      ? manga.attributes.description.en.replace(/\[.*?\]\(.*?\)/g, "").slice(0, 200) + "..."
      : "No synopsis available";

    const cover = manga.relationships?.find(rel => rel.type === "cover_art");
    hero.style.backgroundImage = cover && cover.attributes?.fileName
      ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.512.jpg`
      : "url('https://via.placeholder.com/800x600?text=No+Cover')";

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
      card.innerHTML = `
        <img src="${coverUrl}" alt="${title}" loading="lazy">
        <div class="info">
          <h3>${title}</h3>
          <button id="readbtn-${manga.id}" class="readbtn">Read</button>
        </div>
      `;
      mangaGrid.appendChild(card);

      const readBtn = card.querySelector(`#readbtn-${manga.id}`);
      readBtn.addEventListener("click", () => window.location.href = `detail.html?id=${manga.id}`);
    });
  }

  // Navigation icon behavior
  document.querySelectorAll(".icon-list a").forEach(link => {
    link.addEventListener("click", e => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        document.querySelectorAll(".icon-list a").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  fetchTopManga();
  setInterval(updateHero, 10000);
});
