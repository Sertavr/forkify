import { API_URL, RES_PER_PAGE, KEY } from './config';
//import { getJSON, sendJSON } from './helpers';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    result: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const {
    id,
    title,
    publisher,
    ingredients,
    sourceUrl = data.data.recipe.source_url,
    image = data.data.recipe.image_url,
    servings,
    cookingTime = data.data.recipe.cooking_time,
  } = data.data.recipe;

  return {
    id,
    title,
    publisher,
    ingredients,
    sourceUrl,
    image,
    servings,
    cookingTime,
    ...(data.data.recipe.key && { key: data.data.recipe.key }),
  };
};

export const loadRecipe = async function (hash) {
  try {
    const data = await AJAX(`${API_URL}${hash}?key=${KEY}`);

    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === hash))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    //Temp error hendling
    console.error(`${err} 💥💥💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.result = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥💥💥`);
    throw err;
  }
};

export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; //0
  const end = page * state.search.resultsPerPage; //10
  return state.search.result.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity
      ? (ing.quantity * newServings) / state.recipe.servings
      : '';
  });
  //Mark current recipe as bookmark
  state.recipe.servings = newServings;
};

export const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  //Add bookMark
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);
  //Mark current recipe as not bookmarked

  if (state.recipe.id === id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

export const uploadRecipe = async function (newRecipe) {
  try {
    const { title, sourceUrl, image, publisher, cookingTime, servings } =
      newRecipe;
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        //const ingArr = ing[1].replaceAll(' ', '').split(',');
      
        const [quantity, unit, description] = ingArr;
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please use the corect format :)'
          );
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title,
      source_url: sourceUrl,
      image_url: image,
      publisher,
      cooking_time: +cookingTime,
      servings: +servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
