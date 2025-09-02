document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mangaId = urlParams.get("id");

  let db;
  const request = indexedDB.open("MangaBookmarksDB", 1);

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("bookmarks")) {
      db.createObjectStore("bookmarks", { keyPath: "id" });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    loadMangaDetail();
  };

  request.onerror = (event) => console.error("IndexedDB error:", event.target.error);

  async function loadMangaDetail() {
    try {
      const response = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`);
      const data = await response.json();
      const manga = data.data;

      const title = manga.attributes.title.en || "No Title";
      const synopsis = (manga.attributes.description.en || "No description available.")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/\*\*/g, "")
        .replace(/---.*/gs, "")
        .trim();
      const cover = manga.relationships.find(rel => rel.type === "cover_art");
      const coverUrl = cover ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}` : "https://via.placeholder.com/200x300?text=No+Cover";

      const titleEl = document.getElementById("manga-title");
      const synopsisEl = document.getElementById("manga-synopsis");
      const coverEl = document.getElementById("manga-cover");
      const readBtn = document.getElementById("read-btn");
      const bookBtn = document.getElementById("book-btn");

      if (titleEl) titleEl.textContent = title;
      if (synopsisEl) synopsisEl.textContent = synopsis;
      if (coverEl) coverEl.src = coverUrl;
      if (readBtn) readBtn.addEventListener("click", () => window.location.href = `read.html?id=${mangaId}`);

      if (bookBtn) {
        // Check if already bookmarked
        const tx = db.transaction("bookmarks", "readonly");
        const store = tx.objectStore("bookmarks");
        const getReq = store.get(mangaId);

        getReq.onsuccess = () => {
          if (getReq.result) bookBtn.textContent = "Saved Bookmarked";
        };

        bookBtn.addEventListener("click", () => {
          const txAdd = db.transaction("bookmarks", "readwrite");
          const storeAdd = txAdd.objectStore("bookmarks");
          storeAdd.put({ id: mangaId, title, cover: coverUrl });
          bookBtn.textContent = "Saved Bookmarked";
        });
      }
    } catch (error) {
      console.error("Error loading manga:", error);
    }
  }
});