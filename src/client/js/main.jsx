const MainComponent = require('./react/MainComponent').MainComponent;
const React = require('react');
const ReactDOM = require('react-dom');
require('./Injection');

const domContainer = document.querySelector('#main_container');
ReactDOM.render(<MainComponent />, domContainer);
