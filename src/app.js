import '../node_modules/bootstrap/dist/css/bootstrap.css'
import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";


import "jsbarcode"
// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import {remote} from "electron";
import jetpack from "fs-jetpack";
import {greet} from "./hello_world/hello_world";
import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");


const osMap = {
  win32: "Windows",
  darwin: "macOS",
  linux: "Linux"
};


const barcodeHtml = (barcodeNumber, opt={}) => {
  let template = '';
  template += '<svg class="barcode" ';
  template += '  jsbarcode-format="code128" ';
  template += '  jsbarcode-value="' + barcodeNumber + '" ';
  template += '  jsbarcode-textmargin="0" ';
  if (opt.barcodeHeight) template += '  jsbarcode-height="' + opt.barcodeHeight + '" ';
  // if (opt.barcodeWidth)  template += '  jsbarcode-width="' + opt.barcodeWidth + '" ';
  template += '    </svg> ';
  return template;
};

const parseDatasource = () => {
  let textData = $('#txt-datasource').val().split('\n');
  let result = [];
  for (let i = 0; i < textData.length; i++) {
    let elt = {};
    let subArray = textData[i].split(';');
    if (subArray.length === 1) {
      if (subArray[0].length ===0){
        console.warn('Skipping value : ' + subArray);
        continue;
      } else {
        elt.label = '';
        elt.barcode = subArray[0].trim();
      }
    } else {
      elt.label = subArray[0].trim();
      elt.barcode = subArray[1].trim();
    }
    result.push(elt);
  }
  return result;
};


const generateClick = () => {
  saveSettings();
  let colSettings = {
    colNumber: 2,
    labelClass: 'col-sm-2',
    barcodeClass:'col-sm-2',
    colClass:'col-sm-4',
    barcodeHeight: 40,
  };
  let height = $('#settings-panel-barcode-height').val();
  let isnum = /^\d+$/.test(height);
  if (isnum){ colSettings.barcodeHeight = height }
  let title = $('#txt-title').val();

  let datasource = parseDatasource();
  let componentHtml = '';
  componentHtml += '<div class="row">';
  componentHtml += '  <h1 class="title col-sm-8">' + title + '</h1>';
  componentHtml += '  <div class="col-sm-4" id="main-header">';
  componentHtml += '    <img src=""  id="image-container" />';
  componentHtml += '  </div>';
  componentHtml += '</div>';
  componentHtml += '  <div class="row">';
  for (let i = 0; i < datasource.length; i++) {
    let elt = datasource[i];
    let label = elt.label;
    let barcodeNumber = elt.barcode;
    let template = barcodeHtml(barcodeNumber, colSettings);
    let html = '';
    // html += '<div class="row">';
    html += '   <div class="' + colSettings.colClass + ' text-center">';
    html += '      <div class="row">';
    html += '         <div class="col-sm-12 barcode-label">' + label + '</div>';
    html += '      </div>';
    html += '      <div class="row">';
    html += '         <div class="col-sm-12">' + template + '</div>';

    html += '      </div>';
    html += '   </div>';
    componentHtml += html;
  }
  componentHtml += '</div>';
  $('#div-result').html(componentHtml);
  let output = document.getElementById('image-container');
  let file = $('#input-fileload')[0].files[0];

  var reader = new FileReader();
  reader.onload = function(){
    output.src = reader.result;
  };
  reader.readAsDataURL(file);


  // let src = URL.createObjectURL(file);
  // output.src = src;
  // console.log(src);
  JsBarcode(".barcode").init();
};

const settingsClick = () => {
  $('.settings-panel').toggle();
};

const loadSettings = (settings={}) =>{
  if (settings.hasOwnProperty('title')){      $('#txt-title').val(      settings.title); }
  if (settings.hasOwnProperty('datasource')){ $('#txt-datasource').val( settings.datasource); }
  // if (settings.hasOwnProperty('imageFile')){  $('#input-fileload').val( settings.imageFile); }
  if (settings.hasOwnProperty('barcodeHeight')){  $('#settings-panel-barcode-height').val( settings.barcodeHeight); }
};

const saveSettings = () =>{
  let settings = {};
  let title = $('#txt-title').val();
  let textData = $('#txt-datasource').val();
  let file = $('#input-fileload')[0].files[0].path;
  // let file = $('#input-fileload')[0].files[0];
  let height = $('#settings-panel-barcode-height').val();

  settings.title = title;
  settings.datasource = textData;
  settings.imageFile = file;
  settings.barcodeHeight = height;
  localStorage.setItem('lastData', JSON.stringify(settings));
};

$('.settings-panel').hide();
$("#btn-settings").click(settingsClick);
$("#btn-generate").click(generateClick);
$("#btn-print").click(_=>{window.print();});

loadSettings(JSON.parse(localStorage.getItem('lastData')));
