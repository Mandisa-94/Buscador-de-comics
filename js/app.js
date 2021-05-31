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

