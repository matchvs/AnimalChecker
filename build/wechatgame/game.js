require('libs/weapp-adapter/index');
var Parser = require('libs/xmldom/dom-parser');
window.DOMParser = Parser.DOMParser;
require('libs/wx-downloader.js');
wxDownloader.REMOTE_SERVER_ROOT = "https://imgs.matchvs.com/static/tianziyou/animalChecker";
wxDownloader.SUBCONTEXT_ROOT = "";
require('src/settings.4f6d2');
require('main.342ff');