import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import recipeView from './views/recipeView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import resultsView from './views/resultsView.js';

//if (module.hot) module.hot.accept();

const controlRecipes = async function () {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    recipeView.renderSpinner();

    //0 Update results view to mark selected seaech result
    resultsView.update(model.getSearchResultPage());
    bookmarksView.update(model.state.bookmarks);

    //1.loading recipe
    await model.loadRecipe(hash);

    //2. rendering recipe
    recipeView.render(model.state.recipe);

    //controlServings()
  } catch (err) {
    recipeView.renderError();
    console.log(err);
  }
};

const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();
    //Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //Load search result
    await model.loadSearchResults(query);

    //Render result
    //resultsView.render(model.state.search.result);
    resultsView.render(model.getSearchResultPage());

    //Render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //Render result
  //resultsView.render(model.state.search.result);
  resultsView.render(model.getSearchResultPage(goToPage));

  //Render initial pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings(in state)
  model.updateServings(newServings);

  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add / remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update recipeView
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spiner

    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the application');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
