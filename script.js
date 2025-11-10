// -----------------------------
// PLANT PALETTE — FINAL VERSION
// -----------------------------

// DOM Elements
const moodSelect = document.getElementById("mood-select");
const fetchBtn = document.getElementById("fetch-btn");
const paletteContainer = document.getElementById("palette-container");
const plantsContainer = document.getElementById("plants-container");
const errorMessage = document.getElementById("error-message");

// Base hex color per mood (for The Color API)
const moodColors = {
  calm: "a3d5d3",       // mint green
  energized: "ff7b54",  // orange-red
  dreamy: "bfa2db",     // lavender
  fresh: "b8e994",      // soft lime
  grounded: "7d5a50"    // earthy brown
};

// -----------------------------
// EVENT HANDLER
// -----------------------------
fetchBtn.addEventListener("click", () => {
  const mood = moodSelect.value;
  if (!mood) {
    alert("Please select a mood first!");
    return;
  }

  // clear old results
  paletteContainer.innerHTML = "";
  plantsContainer.innerHTML = "";
  errorMessage.hidden = true;

  // generate palette + plants
  generateMoodResults(mood);
});

// -----------------------------
// MAIN FUNCTION
// -----------------------------
async function generateMoodResults(mood) {
  const baseColor = moodColors[mood];
  const colorAPI = `https://www.thecolorapi.com/scheme?hex=${baseColor}&mode=analogic&count=5`;
  const plantAPI = "./plants.json";

  // show loading message
  document.getElementById("loading").hidden = false;
  document.body.className = ""; // clear old mood theme
  errorMessage.hidden = true;

  try {
    // Change page theme color immediately
    applyMoodTheme(mood);

    const [colorRes, plantRes] = await Promise.all([
      fetch(colorAPI),
      fetch(plantAPI)
    ]);

    if (!colorRes.ok || !plantRes.ok) {
      throw new Error("API fetch failed");
    }

    const colorData = await colorRes.json();
    const plantData = await plantRes.json();

    // Filter plants
    const filteredPlants = plantData.filter((p) => {
      switch (mood) {
        case "calm":
          return p.category.includes("indoor");
        case "energized":
          return p.sunlight === "Full Sun";
        case "dreamy":
          return p.color.includes("purple");
        case "fresh":
          return p.color.includes("green");
        case "grounded":
          return p.category.includes("succulent");
        default:
          return false;
      }
    });

    // Render both
    displayPalette(colorData.colors);
    displayPlants(filteredPlants.slice(0, 6));

  } catch (error) {
    console.error("Error fetching data:", error);
    errorMessage.hidden = false;

  } finally {
    // Hide loading message once done
    document.getElementById("loading").hidden = true;
  }
}

// -----------------------------
// DISPLAY COLOR PALETTE
// -----------------------------
function displayPalette(colors) {
  paletteContainer.innerHTML = "";
  colors.map((color) => {
    const swatch = document.createElement("div");
    swatch.classList.add("color-swatch");
    swatch.style.backgroundColor = color.hex.value;
    swatch.title = color.hex.value;

    // click-to-copy
    swatch.addEventListener("click", () => {
      navigator.clipboard.writeText(color.hex.value);
      swatch.style.transform = "scale(1.15)";
      setTimeout(() => (swatch.style.transform = ""), 200);
    });

    paletteContainer.appendChild(swatch);
  });
}

// -----------------------------
// DISPLAY PLANT CARDS
// -----------------------------
function displayPlants(plants) {
  plantsContainer.innerHTML = "";

  if (plants.length === 0) {
    plantsContainer.innerHTML = `<p>No matching plants found for this mood 🌿</p>`;
    return;
  }

  // Smoothly scroll to the plant section (optional but nice)
  plantsContainer.scrollIntoView({ behavior: "smooth" });

  // Create and animate cards
  plants.map((plant, index) => {
    const card = document.createElement("article");
    card.classList.add("plant-card");

    // Stagger animation delay so each card fades in one after another
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <img src="${plant.image_url}" alt="${plant.common_name}"
           onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';" />
      <div class="plant-info">
        <h3>${plant.common_name}</h3>
        <p><em>${plant.scientific_name}</em></p>
      </div>
    `;
    plantsContainer.appendChild(card);
  });
}


// -----------------------------
// APPLY MOOD THEME COLORS
// -----------------------------
function applyMoodTheme(mood) {
  const btn = document.getElementById("fetch-btn");

  switch (mood) {
    case "calm":
      document.body.style.backgroundColor = "#e9f7f6";
      btn.style.backgroundColor = "#6cbdb3";
      break;
    case "energized":
      document.body.style.backgroundColor = "#fff1e6";
      btn.style.backgroundColor = "#ff7b54";
      break;
    case "dreamy":
      document.body.style.backgroundColor = "#f4efff";
      btn.style.backgroundColor = "#bfa2db";
      break;
    case "fresh":
      document.body.style.backgroundColor = "#f0ffe3";
      btn.style.backgroundColor = "#9ad36a";
      break;
    case "grounded":
      document.body.style.backgroundColor = "#f7f3ef";
      btn.style.backgroundColor = "#7d5a50";
      break;
    default:
      document.body.style.backgroundColor = "#f8f8f8";
      btn.style.backgroundColor = "#4a8f5d";
  }
}

