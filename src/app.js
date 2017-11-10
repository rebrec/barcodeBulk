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
  // if (opt.barcodeHeight) template += '  jsbarcode-height="' + opt.barcodeHeight + '" ';
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
    if (subArray.length !== 2) {
      console.warn('Skipping value : ' + subArray);
      continue;
    }
    elt.label = subArray[0].trim();
    elt.barcode = subArray[1].trim();
    result.push(elt);
  }
  return result;
};


const generateClick = () => {

  let colSettings = {
    colNumber: 2,
    labelClass: 'col-sm-2',
    barcodeClass:'col-sm-2',
    colClass:'col-sm-4',
  };

  let title = $('#txt-title').val();

  let datasource = parseDatasource();
  let componentHtml = '';
  componentHtml += '<h1 class="title col-sm-12">' + title + '</h1><div class="row">';
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
  JsBarcode(".barcode").init();
};

$("#btn-generate").click(generateClick);
$("#btn-print").click(_=>{window.print();});
