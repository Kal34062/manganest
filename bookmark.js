document.addEventListener("DOMContentLoaded", async () => {
  const bookmarkGrid = document.getElementById("bookmark-grid")
  
  const isLoggedIn = false // still not using auth, just IndexedDB  
  
  let bookmarks = []
  let db;
  
  const request = indexedDB.open("MangaBookmarksDB", 1);
  
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("bookmarks")) {
      db.createObjectStore("bookmarks", { keyPath: "id" });
    }
  };
  
  request.onsuccess = async (event) => {
    db = event.target.result;
    bookmarks = await getIndexedBookmarks();
    renderBookmarks();
  };
  
  request.onerror = (event) => console.error("IndexedDB error:", event.target.error);
  
  function renderBookmarks() {
    bookmarkGrid.innerHTML = ""
    if (bookmarks.length === 0) {
      bookmarkGrid.innerHTML = "<p class='fault'>No bookmarks yet</p>"
      return
    }
    
    bookmarks.forEach((manga, index) => {
      const card = document.createElement("div")
      card.classList.add("manga-card")
      card.innerHTML = `  
        <img src="${manga.cover}" alt="${manga.title}">  
        <h3 class="tittle">${manga.title}</h3>  
        <div class="buttons">  
          <button class="read-btn">Read</button>  
          <button class="remove-btn">Remove</button>  
        </div>  
      `
      bookmarkGrid.appendChild(card)
      
      // Read button  
      card.querySelector(".read-btn").addEventListener("click", () => {
        window.location.href = `read.html?id=${manga.id}`
      })
      
      // Remove button  
      card.querySelector(".remove-btn").addEventListener("click", async () => {
        const mangaId = manga.id;
        const tx = db.transaction("bookmarks", "readwrite");
        const store = tx.objectStore("bookmarks");
        store.delete(mangaId);
        
        bookmarks.splice(index, 1);
        renderBookmarks();
      })
    })
  }
  
  async function getIndexedBookmarks() {
    return new Promise((resolve) => {
      const tx = db.transaction("bookmarks", "readonly");
      const store = tx.objectStore("bookmarks");
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => resolve([]);
    });
  }
  
});