// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const jsdom = require('jsdom')
const {JSDOM} = jsdom
const { document } = (new JSDOM(`...`)).window;
import {max} from 'mathjs'
const HtmlTableToJson = require('html-table-to-json');
// import TableToExcel from "@linways/table-to-excel";

var doc;

function tableToJSON(DOMTable) {
  var finJSON = [];
  var headers = [];
  var tmp = []
  DOMTable.querySelector('thead tr').querySelectorAll('th').forEach((el) => {headers.push(el.innerHTML.replace(/\s/g, '' ))})
  // DOMTable.querySelector()
  DOMTable.querySelector('tbody').querySelectorAll('tr').forEach((el) => {
    var tr = document.createElement('tr')
    // tr.innerHTML = el;
    tr.insertAdjacentHTML("afterbegin",el.innerHTML)
    var obj = {}
    obj.rowspansIDs = ''
    for(var i = 0; i< tr.children.length;i++) {
      try {
        var isTrueRow = false
        try { isTrueRow = tr.children[0].getAttribute('class') === "LessonNumber" ? true : false}
        catch(e) {}
        try { obj.rowspansIDs = tr.children[i].getAttribute('rowspan') != null ? obj.rowspansIDs == '' ? i : obj.rowspansIDs+", " + i : obj[rowspansIDs];}
        catch(e) {}

        obj.isTrueRow = isTrueRow;
        
        obj[headers[i]] = tr.children[i].textContent
      
      }
      catch(e) {
        
      }
    }
    tmp.push(obj)
  })
  
  var nextRowFalse = false;
  for(var i = 0; i< tmp.length;i++) {

    if(nextRowFalse) {
      nextRowFalse = false

      var rIDs = (tmp[i-1].rowspansIDs).split(", ").map((x)=>{return parseInt(x)} );
      console.log(rIDs);
      var objKeys = Object.keys(tmp[i])
      for(var key = 2; key< objKeys.length; key++) {
        console.log([headers[rIDs[rIDs.length-1]+1-2+key]])

        for(var n=0; n < rIDs.length;n++) {
          if(rIDs[n+1] == rIDs[n]+1) continue
          else {
            //including in previous True row new right way
            if(rIDs[n]-1+key < headers.length)
              tmp[i-1][headers[rIDs[n]-1+key]] = {"0":tmp[i-1][headers[rIDs[n]-1+key]],"1":tmp[i][objKeys[key]]}
          }
        }
        //including in previous True row old
        // tmp[i-1][headers[rIDs[rIDs.length-1]-1+key]] = {"0":tmp[i-1][headers[rIDs[rIDs.length-1]-1+key]],"1":tmp[i][objKeys[key]]}

        console.log("key: "+objKeys[key])
      }
      console.log()
      
      continue
    }
    
    if(tmp[i].rowspansIDs !=='') nextRowFalse = true
    else nextRowFalse = false
  }
  // filter only true row
  tmp = tmp.filter(tmp => tmp.isTrueRow === true)

  return {tmp}
}

function parseHTML(str) {
  var dom = document.createElement("div");
  dom.innerHTML = str;
  return dom.innerHTML;
}

export default async function handler(req, res) {
  var dT
  var customfunc = []
  const data = await fetch('https://tntu.edu.ua/?p=uk/schedule&s=fis-sbs32').then(function (response) {
    // The API call was successful!
    return response.text();
  }).then(function (html) {
    var doc = parseHTML(html.replace(/[\n\t\r]/g,""));
    const dom = new JSDOM(doc)
    var DOMTable = dom.window.document.querySelector("#ScheduleWeek")
    
    var tmp = [];
    DOMTable.querySelectorAll('td').forEach((el) => {tmp.push("<td>"+el.innerHTML+"</td>")})
    
    customfunc = tableToJSON(DOMTable)




    dT = {dt: tmp}
    const jsonTable = HtmlTableToJson.parse("<table>" + DOMTable.innerHTML +"</table>");
    // const jsonTable = TableToExcel.convert(DOMTable);
    return jsonTable.results
    // console.log("<table>" + DOMTable +"</table>")
  }).catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });

  res.status(200).json(customfunc.tmp)
}
