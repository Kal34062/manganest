document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const autocompleteList = document.getElementById("autocomplete-list");

  // Load recent searches from localStorage
  let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

  function saveSearch(name) {
    if (!recentSearches.includes(name)) {
      recentSearches.unshift(name); // add to start
      if (recentSearches.length > 10) recentSearches.pop(); // max 10
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }
  }

  function createAutocompleteItem(name, imgUrl, isRecent = false, id = null) {
    const item = document.createElement("div");
    item.classList.add("autocomplete-item");
    if (isRecent) item.classList.add("recent");

    item.innerHTML = isRecent ? name : `<img src="${imgUrl}" width="40" height="60"> ${name}`;
    item.addEventListener("click", () => {
      if (!isRecent) saveSearch(name); // save only API results
      window.location.href = `detail.html?id=${id}`;
    });
    return item;
  }

  async function fetchMangaSuggestions(query) {
    try {
      const response = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=10&includes[]=cover_art`);
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function updateAutocomplete() {
    const query = searchInput.value.trim();
    autocompleteList.innerHTML = "";

    // Show recent searches when input is empty
    if (!query) {
      recentSearches.forEach(name => {
        const item = createAutocompleteItem(name, null, true);
        autocompleteList.appendChild(item);
      });
      return;
    }

    // Fetch API results
    const mangas = await fetchMangaSuggestions(query);
    mangas.forEach(manga => {
      const title = manga.attributes?.title?.en || Object.values(manga.attributes?.title || {})[0] || "No Title";
      const cover = manga.relationships?.find(rel => rel.type === "cover_art");
      const coverUrl = cover ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}` : "https://via.placeholder.com/40x60?text=No+Cover";
      const item = createAutocompleteItem(title, coverUrl, false, manga.id);
      autocompleteList.appendChild(item);
    });
  }

  searchInput.addEventListener("input", updateAutocomplete);
  searchInput.addEventListener("focus", updateAutocomplete);
  searchInput.addEventListener("blur", () => setTimeout(() => autocompleteList.innerHTML = "", 200));
});