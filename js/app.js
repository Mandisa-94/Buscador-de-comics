// -------------------------------- FOUNDATION --------------------------------
$(document).foundation();

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
  arr.forEach((html) => {
    getId("cards-container").insertAdjacentHTML("beforeend", html);
  });
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
  let cards = createCharactersCards(arr);
  cleanContainer();
  printAll([cards]);
};

// FUNCION QUE TRAE LOS COMICS SEGUN EL OFFSET QUE LE PASEMOS, CREA LAS CARDS Y LAS IMPRIME EN EL CONTAINER
const fetchAndPrintComics = async (offset) => {
  const url = getURL();
  const data = await getData(url);
  const cards = createComicsCards(data);
  cleanContainer();
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
    <div class="cell">
    <div class="card" style="width: 300px"; onclick= "clickOnCharacter(${id})">
    <img src="${
      path === pathNonFoundNowanted ? pathNonFoundWanted : path
    }.${extension}" alt="${name}">
    <div class="card-section">
    <h4>${name}</h4>
    </div>
    </div>
    </div>
    `;
  });
  return cards;
};

// FUNCION QUE CREA LA CARD DE UN PERSONAJE SOLO
const printOneCharacter = (arr) => {
  let characterCard = "";
  let comicsCard = "";
  arr.forEach((characters) => {
    const {
      name,
      thumbnail: { path, extension },
      description,
    } = characters;
    characterCard += `
    <div class="cell">
      <div class="card small-6">
        <img src="${
          path === pathNonFoundNowanted ? pathNonFoundWanted : path
        }.${extension}" alt="${name}">
        <h4>${name}</h4>
        <p>${description}</p>
    </div>
    `;
    const comics = characters.comics.items;
    comics.forEach((comic) => {
      const { resourceURI } = comic;
      comicsCard = createComicsCards(getData(resourceURI + urlKeys));
    });
  });
  printAll([characterCard, comicsCard]);
};

// FUNCION QUE TRAE EL CHARACTER SEGUN EL ID QUE LE PASEMOS, CREA LA CARD Y LA IMPRIME EN EL CONTAINER
const clickOnCharacter = async (id) => {
  const info = await getData(`${urlBase}${urlCharacters}/${id}${urlKeys}`);
  printOneCharacter(info);
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
    const img = `${path}.${extension}`;
    cards += `<div class="cell">
            <div class="card" style="width: 250px; height:600px;" onclick="clickOnComic(${id})">
            <figure>
            <img class="comic-card-image" src=${img}>
            </figure>
            <div class="card-section">
                <h4>${title}</h4>
            </div>
            </div>
        </div>`;
  });
  return cards;
};

// FUNCION QUE TRAE LOS CHARACTERS DEL COMIC, RECIBE LA URL Y DEVUELVE UN STR CON EL HTML DE LAS CARDS Y EL RESULTADO
const getCharactersByComic = async (url) => {
  const data = await getData(url + urlKeys);
  const resultsAmount = data.length;
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
      <div class="cell smal-12">
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
  cleanContainer();
  printAll([card]);
};

// Funcion que multiplica el numero de la pagina clickeada por 20 y le resta 20 (ya que la pag uno es offset 0)
// const changeOffset = (page) =>{
//   offset = page * 20 - 20;
//   return offset
// }

//Función que toma el fetch de la api y retorna el total de comics existentes
const getTotalComics = (resp) => resp.data.total;

//Funcion NO TESTEADA que chequea cuantas páginas deberían existir de acuerdo a la cantidad total de comics y cuantos comics quedan para la ultima pagina.
// const checkAmountPages = (total) => {
//   let totalPages;
//   const rest = total % 20;
//   const division = total / 20;
//   if (rest === 0) {
//     totalPages = division;
//   } else {
//     totalPages = {
//       total: division + 1,
//       lastPage: rest,
//     };
//   }
// };

//Evento del boton de Previous page, le resta 20 comics al offset(una pagina) y lo retorna al ambito global
getId("previous-page").addEventListener("click", () => {
  if (offset !== 0) {
    offset -= 20;
  }
  cleanContainer();
  selectedCards === "comics"
    ? fetchAndPrintComics(offset)
    : fetchAndPrintCharacters(offset);
  return offset;
});

//Evento del boton de Next page, le suma 20 comics al offset(una pagina) y lo retorna al ambito global
getId("next-page").addEventListener("click", () => {
  getId("previous-page").classList.remove("disabled");
  offset += 20;
  cleanContainer();
  selectedCards === "comics"
    ? fetchAndPrintComics(offset)
    : fetchAndPrintCharacters(offset);
  return offset;
});

// CAMBIAR ENTRE CHARACTERS Y COMICS -- TEMPORAL, DESPUES LO TENEMOS QUE ADAPTAR AL BOTON


// EVENTO APLICADO AL RADIO BUTTON DE SHOW COMICS. LIMPIA EL CONTENEDOR E IMPRIME LOS COMICS SEGUN EL OFFSET
getId("show-comics").addEventListener("change", (e) => {
  if (e.target.checked === true) {
    selectedCards = "comics";
    changeOrderOptions(selectedCards);
    cleanContainer();
    fetchAndPrintComics(offset);
  }
  return selectedCards;
});

// EVENTO APLICADO AL RADIO BUTTON DE SHOW CHARACTERS. LIMPIA EL CONTENEDOR E IMPRIME LOS CHARACTERS SEGUN EL OFFSET
getId("show-characters").addEventListener("change", (e) => {
  if (e.target.checked === true) {
    selectedCards = "characters";
    changeOrderOptions(selectedCards);
    cleanContainer();
    fetchAndPrintCharacters();
  }
  return selectedCards;
});

// FUNCION QUE CAMBIA LAS OPCIONES DE ORDEN SEGÚN MOSTREMOS LOS COMICS O LOS CHARACTERS
const changeOrderOptions = (choice) => {
  if (choice === "comics") {
    getId("order-input").innerHTML =
      '<option value="title">A-Z</option><option value="-title">Z-A</option><option value="-focDate">Más nuevos</option><option value="focDate">Más viejos</option>';
  } else {
    getId("order-input").innerHTML =
      '<option value="name">A-Z</option><option value="-name">Z-A</option>';
  }
};

getId("order-input").addEventListener("change", (e) => {
  console.log('change');
  selectedCards === 'comics' ? fetchAndPrintComics(offset) : fetchAndPrintCharacters(offset)
});

const handlerButtonSubmit = () =>{
  selectedCards === 'comics' ? fetchAndPrintComics(offset) : fetchAndPrintCharacters(offset)
}


// EVENTO ON LOAD QUE CARGA LOS COMICS COMO OPCION DEFAULT EN LA PAGINA
window.addEventListener("load", () => {
  fetchAndPrintComics(offset);
});

