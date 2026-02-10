const searchPokemon = document.getElementById("search-pokemon");
const pokemonContainer = document.getElementById("pokemon-container");
const loadingContainer = document.getElementById("loading-container");
const loadingMessage = document.getElementById("loading-message");

let allPokemons = [];
let timerId = null;
let lastRequestId = 0;

const pokemonCache = new Map();

const colorTypes = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const setIsLoading = (isLoading) => {
  isLoading
    ? (loadingMessage.className = "")
    : (loadingMessage.className = "hidden");
};

const pokemonCard = (finalId, officialSprite, name, type) => {
  return `
        <article
            class="relative flex flex-col items-center bg-white text-center rounded-xl w-80 h-auto py-7 pt-15 shadow-md"
          >
            <div class="flex justify-center items-center">
              <p class="absolute bottom-40 text-8xl text-black/20">#${finalId}</p>
              <img
                src=${officialSprite}
                alt="Charizard"
                class="w-50 absolute bottom-25"
              />
            </div>
            <div class="mt-5">
              <p class="text-black/60">#${finalId}</p>
              <h3 class="text-xl font-bold">${capitalizar(name)}</h3>
            </div>
            <div class="flex justify-center gap-2 pt-3">
                ${type
                  .map((el) => {
                    return `<p class="px-5 rounded-sm bg-[${colorTypes[el]}] shadow-md text-white font-medium">${capitalizar(el)}</p>`;
                  })
                  .join("")}
            </div>
          </article>
        `;
};

const fetchAllPokemons = async () => {
  const results = await fetch(
    "https://pokeapi.co/api/v2/pokemon?limit=1300&offset=0",
  );
  const data = await results.json();
  allPokemons = data.results;
};

const getPokemonDetail = async (name) => {
  if (pokemonCache.has(name)) {
    return pokemonCache.get(name);
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();

  pokemonCache.set(name, data);

  return data;
};

const liveFilter = () => {
  searchPokemon.addEventListener("input", () => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      const myId = ++lastRequestId;

      const query = searchPokemon.value.trim().toLowerCase();
      const matches = allPokemons
        .filter((p) => p.name.includes(query))
        .slice(0, 8);
      renderFilter(matches, myId);
    }, 250);
  });
};

const renderFilter = async (matches, myId) => {
  setIsLoading(true);
  const details = await Promise.all(
    matches.map((pokemon) => getPokemonDetail(pokemon.name)),
  );

  if (myId !== lastRequestId) return;

  let html = "";

  if (details.length <= 0)
    html += "No se encontraron resultados para tu busqueda...";
  for (const data of details) {
    const { id, name, types, sprites } = data;

    const officialSprite = sprites.other["official-artwork"].front_default;

    const finalId = String(id).padStart(5, "0");
    const type = types.map((el) => el.type.name);

    html += pokemonCard(finalId, officialSprite, name, type);
  }
  setIsLoading(false);

  pokemonContainer.innerHTML = html;
};

const render = async () => {
  setIsLoading(true);
  const firstPokemons = allPokemons.slice(0, 15);

  const details = await Promise.all(
    firstPokemons.map((pokemon) => getPokemonDetail(pokemon.name)),
  );

  setIsLoading(false);
  let html = "";

  for (const data of details) {
    const { id, name, types, sprites } = data;

    const officialSprite = sprites.other["official-artwork"].front_default;

    const finalId = String(id).padStart(5, "0");
    const type = types.map((el) => el.type.name);

    html += pokemonCard(finalId, officialSprite, name, type);
  }
  pokemonContainer.innerHTML = html;
};

const init = async () => {
  await fetchAllPokemons();
  liveFilter();
  render();
};

init();
