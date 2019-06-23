/* global ReactDOM */

import MainComponent from './react/MainComponent.js';
import { loadInjection } from './Injection.js';

loadInjection();
const domContainer = document.querySelector('#main_container');
ReactDOM.render(<MainComponent />, domContainer);
