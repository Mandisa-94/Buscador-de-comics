// -------------------------------- FOUNDATION --------------------------------
// import Foundation from 'foundation-sites';
 $(document).foundation();
 $('#foo').foundation(); // initialize all plugins within the element `#foo`
$('.has-tip').foundation(); // initialize all tooltips on the page.

//-------------------------------- GET FROM DOM FUNCS --------------------------------

const getId = (id) => document.getElementById(id);
const getQuery = (query) => document.querySelector(query);
const getAll = (query) => document.querySelectorAll(query);

//-------------------------------- BASE URL VARIABLES --------------------------------

const publicKey = "1bd6b21648b80657c891a38bf36937fe";
const privateKey = "83f70320d62fe850c251b0921f1b777e2c10f110";
const timestamp = Date.now();
const hash = md5(timestamp + privateKey + publicKey);
const urlBase = "http://gateway.marvel.com/";
const urlKeys = `?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;
const urlCharacters = "/v1/public/characters";
const urlComics = `/v1/public/comics`;
const pathNonFoundNowanted =
  "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available";
const pathNonFoundWanted =
  "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available/portrait_uncanny";
const limitPerPage = 20;
let offset = 0;
let selectedCards = "comics";

//-------------------------------- FUNCTION THAT FETCHS THE DATA FROM THE API --------------------------------

// FUNCION QUE HACE EL FECTH DE LA URL QUE LE PASEMOS - RECIBE STRING
const getData = async (url) =>
  await fetch(url)
    .then((resp) => resp.json())
    .then((resp) => resp.data.results)
    .catch((err) => console.error(err));

// FUNCION QUE LIMPIA EL CONTAINER DE LAS CARDS
const cleanContainer = () => {
  getId("cards-container").innerHTML = "";
};

// FUNCION QUE IMPRIME EN EL CONTENEDOR TODO LO QUE LE PASEMOS, EN ORDEN - RECIBE ARRAY SINO TIRA ERROR
const printAll = (arr) => {
  getPagesInfo();
  arr.forEach((html) => {
    getId("cards-container").insertAdjacentHTML("beforeend", html);
  });
  return pagesData;
};

// FUNCION QUE CHEQUEA QUE DESEAMOS MOSTRAR, EN QUE ORDEN Y SI QUEREMOS FILTRARLO PARA DEVOLVER LA URL PARA HACERLE EL FETCH
const getURL = (offset) => {
  let finalUrl = urlBase;
  finalUrl += selectedCards === "comics" ? urlComics : urlCharacters;
  finalUrl += `?limit=20&offset=${offset}&ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;
  finalUrl += `&orderBy=${getId("order-input").value}`;
  if (getId("search-input").value !== "") {
    finalUrl +=
      selectedCards === "comics"
        ? `&titleStartsWith=${getId("search-input").value}`
        : `&nameStartsWith=${getId("search-input").value}`;
  }
  return finalUrl;
};

// FUNCION QUE TRAE LOS CHARACTERS SEGUN EL OFFSET QUE LE PASEMOS, CREA LAS CARDS Y LAS IMPRIME EN EL CONTAINER

const fetchAndPrintCharacters = async (offset) => {
  const url = getURL(offset);
  let arr = await getData(url);
  showResultsAmount(url);
  let cards = createCharactersCards(arr);
  cleanContainer();
  toggleResultsHeader("flex");
  printAll([cards]);
};

// FUNCION QUE TRAE LOS COMICS SEGUN EL OFFSET QUE LE PASEMOS, CREA LAS CARDS Y LAS IMPRIME EN EL CONTAINER
const fetchAndPrintComics = async (offset) => {
  const url = getURL(offset);
  const data = await getData(url);
  showResultsAmount(url);
  const cards = createComicsCards(data);
  cleanContainer();
  toggleResultsHeader("flex");
  printAll([cards]);
};

// FUNCION QUE CREA LAS CARDS DE LOS CHARACTERS, UNA DESPUÉS DE LA OTRA EN UNA SOLA VARIABLE - RECIBE EL ARRAY DEL FETCH Y RETORNA UN STRING CON TODAS LAS CARDS
const createCharactersCards = (arr) => {
  let cards = "";
  arr.forEach((character) => {
    const {
      id,
      name,
      thumbnail: { path, extension },
    } = character;
    cards += `
    <div class="cell shrink bottom">
    <div class="card align-self-midle adapt" style="width: 350px; height:600px; "onclick= "clickOnCharacter(${id})">
    <img class="comic-card-image" src="${
      path === pathNonFoundNowanted ? pathNonFoundWanted : path
    }.${extension}" alt="${name}">
    <div class="card-section">
    <h4>${name}</h4>
    </div>
    </div>
    </div>
    `;
    responsive();
  });

  return cards;
};

// FUNCION QUE CREA LA CARD DE UN PERSONAJE SOLO

const printOneCharacter = ([characters]) => {
  const {
    name,
    thumbnail: { path, extension },
    description,
    comics: { items },
  } = characters;
  const characterCard = `
  <div class="cell small-4">
  <img src="${
    path === pathNonFoundNowanted ? pathNonFoundWanted : path
  }.${extension}" alt="${name}">
  </div>
  
  <div class="cell small-6">
  <h4>${name}</h4>
  <p>${description}</p>
  </div>
  </div>
  <div class= "grid-x"></div>
  `;

  printInfoCaracters(items);
  return characterCard;
};

const printInfoCaracters = (items) => {
  items.forEach((info) => {
    const { resourceURI } = info;
    getComicsByCharacter(resourceURI);
  });
};

const getComicsByCharacter = async (url) => {
  const data = await getData(url + urlKeys);
  const resultsAmount = data.length;
  const cards = createComicsCards(data);
  togglePaginationDisabled("all");
  printAll([cards]);
};

// FUNCION QUE TRAE EL CHARACTER SEGUN EL ID QUE LE PASEMOS, CREA LA CARD Y LA IMPRIME EN EL CONTAINER
const clickOnCharacter = async (id) => {
  const data = await getData(`${urlBase}${urlCharacters}/${id}${urlKeys}`);
  const card = printOneCharacter(data);
  toggleResultsHeader("none");
  cleanContainer();
  printAll([card]);
};

// FUNCION QUE CREA CARDS DE COMICS - RECIBE UN ARRAY Y DEVUELVE UN STRING
const createComicsCards = (comics) => {
  let cards = "";

  comics.forEach((comic) => {
    const {
      id,
      title,
      thumbnail: { extension, path },
    } = comic;

    // const img = `${path}.${extension}`;
    cards += `<div class="cell  shrink bottom top">
    <div class="card align-self-midle adapt" style="width: 350px; height:600px;" onclick="clickOnComic(${id})">
    <figure >
    <img class="comic-card-image tiny" src=${
      path === pathNonFoundNowanted ? pathNonFoundWanted : path
    }.${extension}>
    </figure>
    <div class="card-section">
    <h4>${title}</h4>
    </div>
    </div>
    </div>
    `;
    responsive();
  });
  return cards;
};

// FUNCION QUE TRAE LOS CHARACTERS DEL COMIC, RECIBE LA URL Y DEVUELVE UN STR CON EL HTML DE LAS CARDS Y EL RESULTADO
const getCharactersByComic = async (url) => {
  const data = await getData(url + urlKeys);
  const resultsAmount = data.length;
  togglePaginationDisabled("all");
  const cards = createCharactersCards(data);
  return `<p>${resultsAmount} resultados</p>
  <div class='grid-x'>${cards}</div>`;
};

// FUNCION QUE CREA UNA CARD DE UN COMIC EN CONCRETO, RECIBE UN ARRAY Y DEVUELVE LA CARD
const createComicCard = async ([comic]) => {
  const {
    title,
    thumbnail: { extension, path },
    creators,
    dates,
    description,
    characters: { collectionURI },
  } = comic;
  const [{ date }, ...unimportant] = dates;
  const {
    items: [...creatorsToCheck],
  } = creators;
  const writers = getWriters(creatorsToCheck);
  const charactersCards = await getCharactersByComic(collectionURI);
  const img = `${path}.${extension}`;
  const newCard = `<div class="cell small-4">
  <figure>
  <img src=${img}>
  </figure>
  </div>
  <div class="cell small-7">
  <h4>${title}</h4>
  <h5>Publicado:</h5>
  <p>${date}</p>
  <h5>Guionistas:</h5>
  <p>${writers}</p>
  <h5>Descripción:</h5>
  <p>${description}</p>
  </div>
  <div class="cell smal-12 margin">
  <h4>Personajes</h4>
  ${charactersCards}
  </div>`;
  return newCard;
};

// FUNCION QUE RECIBE UN ARRAY DE CREADORES Y CHEQUEA CUALES DE ESOS SON ESCRITORES, DEVUELVE UN STRING CON TODOS LOS QUE LO SEAN
const getWriters = (arr) => {
  let allWriters = [];
  arr.forEach((creator) => {
    const { name, role } = creator;
    if (role === "writer") {
      allWriters.push(name);
    }
  });
  return allWriters.join(", ");
};

// FUNCION APLICADA A CADA COMIC, RECIBE EL ID DEL COMIC, HACE EL FETCH, CREA LA CARD DE ESE COMIC, LIMPIA EL CONTENDERO Y LA IMPRIME
const clickOnComic = async (id) => {
  const urlComicId = `/v1/public/comics/${id}`;
  const data = await getData(urlBase + urlComicId + urlKeys);
  const card = await createComicCard(data);
  toggleResultsHeader("none");
  cleanContainer();
  printAll([card]);
};

//Función que toma el fetch de la api y retorna el total de comics existentes
const getTotalResults = async () =>
  await fetch(getURL(offset))
    .then((resp) => resp.json())
    .then((resp) => resp.data.total)
    .catch((err) => console.error(err));

const showResultsAmount = async (url) => {
  const total = await getTotalResults(url);
  getId("results-amount").innerText = `${total} conincidencias`;
};

const toggleResultsHeader = (display) => {
  getId("results-header-container").style.display = display;
};

const togglePaginationDisabled = (toDisable) => {
  if (toDisable === "next") {
    getId("first-page").classList.remove("disabled");
    getId("previous-page").classList.remove("disabled");
    getId("last-page").classList.add("disabled");
    getId("next-page").classList.add("disabled");
  } else if (toDisable === "previous") {
    getId("first-page").classList.add("disabled");
    getId("previous-page").classList.add("disabled");
    getId("last-page").classList.remove("disabled");
    getId("next-page").classList.remove("disabled");
  } else if(toDisable === 'all'){
    getId("first-page").classList.add("disabled");
    getId("previous-page").classList.add("disabled");
    getId("last-page").classList.add("disabled");
    getId("next-page").classList.add("disabled");
  } else {
    getId("first-page").classList.remove("disabled");
    getId("previous-page").classList.remove("disabled");
    getId("last-page").classList.remove("disabled");
    getId("next-page").classList.remove("disabled");
  }
};

let pagesData = {};
const getPagesInfo = async () => {
  const totalResults = await getTotalResults();
  const rest = totalResults % limitPerPage;
  const isExact = rest === 0;
  const pages = Math.ceil(totalResults / limitPerPage);
  const data = {
    lastpage: totalResults - rest,
    isExact,
    totalPages: pages,
  };
  pagesData = data;
  return pagesData;
};

//Evento del boton de First page, que setea el offset a 0, vuelve a la primera página y retorna el offset al ambito global
getId("first-page").addEventListener("click", () => {
  offset = 0;
  cleanContainer();
  selectedCards === "comics"
    ? fetchAndPrintComics(offset)
    : fetchAndPrintCharacters(offset);
  togglePaginationDisabled("previous");
  return offset;
});

//Evento del boton de Previous page, le resta 20 comics al offset(una pagina) y lo retorna al ambito global
getId("previous-page").addEventListener("click", () => {
  if (offset !== 0) {
    offset -= limitPerPage;
  }
  cleanContainer();
  selectedCards === "comics"
    ? fetchAndPrintComics(offset)
    : fetchAndPrintCharacters(offset);
  offset === 0
    ? togglePaginationDisabled("previous")
    : togglePaginationDisabled("none");
  return offset;
});

//Evento del boton de Next page, le suma 20 comics al offset(una pagina) y lo retorna al ambito global
getId("next-page").addEventListener("click", async () => {
  offset +=
    offset / limitPerPage !== pagesData.totalPages - 1
      ? limitPerPage
      : pagesData.lastpage;
  cleanContainer();
  selectedCards === "comics"
    ? fetchAndPrintComics(offset)
    : fetchAndPrintCharacters(offset);
  offset === pagesData.lastpage
    ? togglePaginationDisabled("next")
    : togglePaginationDisabled("none");
  return offset;
});

// Evento del boton de Last page, calcula cuantos  y lo retorna al ambito global
getId("last-page").addEventListener("click", () => {
  offset = pagesData.isExact
    ? pagesData.totalPages * limitPerPage
    : pagesData.lastpage;
  cleanContainer();
  selectedCards === "comics"
    ? fetchAndPrintComics(offset)
    : fetchAndPrintCharacters(offset);
  togglePaginationDisabled("next");
  return offset;
});

// EVENTO APLICADO AL RADIO BUTTON DE SHOW COMICS. LIMPIA EL CONTENEDOR E IMPRIME LOS COMICS SEGUN EL OFFSET
getId("show-comics").addEventListener("change", (e) => {
  if (e.target.checked) {
    selectedCards = "comics";
    changeOrderOptions(selectedCards);
    cleanContainer();
    fetchAndPrintComics(offset);
  }
  return selectedCards;
});

// EVENTO APLICADO AL RADIO BUTTON DE SHOW CHARACTERS. LIMPIA EL CONTENEDOR E IMPRIME LOS CHARACTERS SEGUN EL OFFSET
getId("show-characters").addEventListener("change", (e) => {
  if (e.target.checked) {
    selectedCards = "characters";
    changeOrderOptions(selectedCards);
    cleanContainer();
    fetchAndPrintCharacters();
  }
  return selectedCards;
});

// FUNCION QUE CAMBIA LAS OPCIONES DE ORDEN SEGÚN MOSTREMOS LOS COMICS O LOS CHARACTERS
const changeOrderOptions = (choice) => {
  offset = 0;
  togglePaginationDisabled("previous");
  if (choice === "comics") {
    getId("order-input").innerHTML =
      '<option value="title">A-Z</option><option value="-title">Z-A</option><option value="-focDate">Más nuevos</option><option value="focDate">Más viejos</option>';
  } else {
    getId("order-input").innerHTML =
      '<option value="name">A-Z</option><option value="-name">Z-A</option>';
  }
};

// Handler de evento que se le pasa al input para que haga el fetch segun las cards seleccionadas sean comics o characters
const handlerFetch = () => {
  offset = 0;
  togglePaginationDisabled("previous");
  selectedCards === "comics"
    ? fetchAndPrintComics(offset)
    : fetchAndPrintCharacters(offset);
  return offset;
};

// EVENTO ON LOAD QUE CARGA LOS COMICS COMO OPCION DEFAULT EN LA PAGINA
window.addEventListener("load", () => {
  fetchAndPrintComics(offset);
  getPagesInfo();
});

const responsive = async () => {
  await getData();
  const adapt = document.querySelectorAll(".adapt");
  const tiny = document.querySelectorAll(".tiny");
  if (window.screen.width < 400) {
    adapt.forEach((card) => (card.style.width = "250px"));
    adapt.forEach((card) => (card.style.height = "380px"));
    tiny.forEach((card) => (card.style.height = "280px"));
  }
};
