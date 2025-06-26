import View from './View';
import icons from 'url:../../img/icons.svg';
class AddRecipeview extends View {
  _parentElement = document.querySelector('.upload');
  _message = "Recipe was successfully uploaded :)"

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this._addHandlerShowWondow();
    this._addHndlerHiddenWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }
  _addHandlerShowWondow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  _addHndlerHiddenWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const dataArray = [...new FormData(this)];
      const data = Object.fromEntries(dataArray)
      handler(data);
    });
  }
}

export default new AddRecipeview();
