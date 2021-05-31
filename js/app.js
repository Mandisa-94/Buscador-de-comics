// -------------------------------- FOUNDATION --------------------------------
$(document).foundation();

//-------------------------------- GET FROM DOM FUNCS --------------------------------

const getId = (id) => document.getElementById(id);
const getQuery = (query) => document.querySelector(query);
const getAll = (query) => document.querySelectorAll(query);

//-------------------------------- BASE URL VARIABLES --------------------------------


const publicKey = '1bd6b21648b80657c891a38bf36937fe';
const privateKey = '83f70320d62fe850c251b0921f1b777e2c10f110';
const timestamp = Date.now();
const hash = md5(timestamp + privateKey + publicKey);
const urlBase = "http://gateway.marvel.com/";
const urlKeys = `?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;
const charactersUrl = '/v1/public/characters';



const getComics = async (url) =>
await fetch(url)
    .then((resp) => resp.json())
    .then(resp =>  printCharacters(resp.data.results)) 
    .catch((err) => console.error(err));

getComics(urlBase + charactersUrl + urlKeys);



const cardsContainer = getId('cards-container');
const printCharacters = arr => {
  newCard = '';
  arr.forEach(characters => {
    const pathNonFoundNowanted = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available";
    const pathNonFoundWanted =   "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available/portrait_uncanny"
    const {id, name, thumbnail:{path, extension}} = characters;
    newCard += `
    <div class="cell">
            <div class="card" style="width: 300px"; onclick= "clickOnCharacter(${id})">
            <img src="${path === pathNonFoundNowanted ? pathNonFoundWanted : path}.${extension}" alt="${name}">
            <div class="card-section">
                <h4>${name}</h4>
            </div>
            </div>
        </div>
    `
  })
  cardsContainer.innerHTML = newCard
}


const clickOnCharacter = async (id) => {
  await fetch(`${urlBase}${charactersUrl}/${id}${urlKeys}`)
    .then((resp) => resp.json())
    .then(resp => printInfoCharacter(resp.data.results))
    .catch((err) => console.error(err));
} 


const printInfoCharacter = (arr) => {
  newCard = '';
  newCardItems = '';
  arr.forEach(characters => {
    console.log(characters);
    const { name, thumbnail:{path, extension}, description} = characters;
    
    const pathNonFoundNowanted = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available";
    const pathNonFoundWanted =   "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available/portrait_uncanny";
    newCard += `
    <div class="cell">
      <div class="card small-6">
        <img src="${path === pathNonFoundNowanted ? pathNonFoundWanted : path}.${extension}" alt="${name}">
        <h4>${name}</h4>
        <p>${description}</p>
    </div>
    `
    const series = characters.comics.items
    series.forEach(series => {
      const {resourceURI} = series
      const getResourseComic = async (url) =>{
        await fetch (url)
          .then((resp) => resp.json())
          .then(resp => guardarInfo(resp.data.results))
          .catch(err => console.error(err))
      }
      const guardarInfo = (arr) => {
        console.log(arr);
        arr.forEach(info => {
          const { title, thumbnail:{path, extension}} = info
           newCardItems += `
        <div class="cell">
        <div class="card" style="width: 300px";>
        <img src="${path === pathNonFoundNowanted ? pathNonFoundWanted : path}.${extension}" alt="${name}">
        <div class="card-section">
            <h4>${title}</h4>
        </div>
        </div>
    </div>
     `
      })
      cardsContainer.innerHTML = newCard + newCardItems
      }
      
      getResourseComic(resourceURI + urlKeys)
      
      })
  })
  
}

const publicKey = "32f15c68226028d29ba4973258668eb5";
const privateKey = "1f3ed17bd9f71088f8286cefdf60a5d746d23499";
const timestamp = Date.now();
const hash = md5(timestamp + privateKey + publicKey);
const urlBase = "http://gateway.marvel.com";
const urlKeys = `?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;

//-------------------------------- COMICS URL VARIABLES --------------------------------
let comicId = 0;
let offset = 0;
const urlComics = `/v1/public/comics`;
const urlComicId = `/v1/public/comics/${comicId}`;
const urlComicIdCharacters = `/v1/public/comics/${comicId}/characters`;

// Función que hace el fetch a los comics
const getComics = async (url) =>
  await fetch(url)
    .then((resp) => resp.json())
    .catch((err) => console.error(err));

// Función que crea una card por comic en el contenedor
const createComicsCards = async (resp) => {
  getId("cards-container").innerHTML = "";
  const obj = await resp;
  const comics = await obj.data.results;
  comics.forEach((comic) => {
    const {id, title, thumbnail: {extension, path}} = comic;
    const img =`${path}.${extension}`
    const newCard = `<div class="cell">
            <div class="card" style="width: 250px; height:600px;" onclick="clickOnComic(${id})">
            <figure>
            <img class="comic-card-image" src=${img}>
            </figure>
            <div class="card-section">
                <h4>${title}</h4>
            </div>
            </div>
        </div>`;
    getId("cards-container").insertAdjacentHTML("beforeend", newCard);
  });
};

// Función que reune las dos funciones anteriores y a partir del offset, pinta la pagina de comics correspondiente
const printComics = (offset) =>{
  const urlOffsetKeys = `?limit=20&offset=${offset}&ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;
  createComicsCards(getComics(urlBase + urlComics + urlOffsetKeys));
}
printComics(offset)

// Funcion que multiplica el numero de la pagina clickeada por 20 y le resta 20 (ya que la pag uno es offset 0)
// const changeOffset = (page) =>{
//   offset = page * 20 - 20;
//   return offset
// }

//Función que toma el fetch de la api y retorna el total de comics existentes
// const getTotalComics = async (resp) => {
//   const obj = await resp;
//   const total = await obj.data.total;
//   return total;
// };

//Funcion NO TESTEADA uqe chequea cuantas páginas deberían existir de acuerdo a la cantidad total de comics y cuantos comics quedan para la ultima pagina.
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
getId('previous-page').addEventListener('click', () =>{
  if(offset!==0){
    offset-=20;
  }
  printComics(offset);
  return offset;
})

//Evento del boton de Next page, le suma 20 comics al offset(una pagina) y lo retorna al ambito global
getId('next-page').addEventListener('click', () =>{
  getId('previous-page').classList.remove('disabled')
    offset+=20;

  printComics(offset);
  return offset;
})
