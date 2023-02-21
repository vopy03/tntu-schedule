// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { JSDOM } = require('jsdom')
const { document } = (new JSDOM(`...`)).window;

export default async function handler(req, res) {
  var finalResult = []
  const data = await fetch(req.query.url +"&s="+ req.query.s)
  .then(function (response) { return response.text(); })
  .then(function (html) {

    // parsing string with trimmed \n like symbols to HTML
    var doc = parseHTML(html.replace(/[\n\t\r]/g,""));
    const dom = new JSDOM(doc)
    var DOMTable = dom.window.document.querySelector("#ScheduleWeek")
    
    // main func call
    finalResult = tableToJSON(DOMTable) 

    
  }).catch(function (err) { console.warn('Something went wrong.', err) });

  res.status(200).json(finalResult)
}

function tableToJSON(DOMTable) {
  var headers = [];   // array with table headers
  var tmp = []   // main array

  // Table header select with space trimming
  DOMTable.querySelector('thead tr').querySelectorAll('th').forEach((el) => {headers.push(el.innerHTML.replace(/\s/g, '' ))})

  // All rows select and forEach cycle with info collecting
  DOMTable.querySelector('tbody').querySelectorAll('tr').forEach((el) => {

    // creating DOM element for greater possibilities of interaction with the element
    var tr = document.createElement('tr')
    tr.insertAdjacentHTML("afterbegin",el.innerHTML)


    // variable which will contain all info about row
    var obj = {}
    // service variable for adding it to the object in the future. Item IDs that have an the rowspan attribute
    obj.rowspansIDs = ''


    // cycle with collecting RAW INFO from table and pushing it into main array
    for(var i = 0; i< tr.children.length;i++) {
      try {
        
        var isTrueRow = false // service variable for understanding whether the current element is True | цілісний

        // row incompleteness detection
        try { isTrueRow = tr.children[0].classList.contains("LessonNumber") ? true : false}
        catch(e) {}

        // row IDs that have an the rowspan attribute detection
        try { obj.rowspansIDs = tr.children[i].getAttribute('rowspan') != null ? obj.rowspansIDs == '' ? i : obj.rowspansIDs+", " + i : obj[rowspansIDs];}
        catch(e) {}


        // Присвоєння значень
        obj.isTrueRow = isTrueRow;
        obj[headers[i]] = tr.children[i].textContent
      
      }
      catch(e) {
        
      }
    }
    tmp.push(obj)
  })


  
  
  var nextRowFalse = false; // service variable for understanding whether the next element (object) is false or incomplete
  // cycle with POLISHING objects
  for(var i = 0; i< tmp.length;i++) {

    if(nextRowFalse) {
      nextRowFalse = false

      // splitting and parsing rowspansIDs elements into numbers in array for future use in polishing info
      var rIDs = (tmp[i-1].rowspansIDs).split(", ").map((x)=>{return parseInt(x)} );

      // service variable for obtaining all the parameters of the main object (tmp) for further iterating | Because all FALSE rows has different amounts of parameters
      var objKeys = Object.keys(tmp[i])

      for(var key = 2; key< objKeys.length; key++) {
        // console.log([headers[rIDs[rIDs.length-1]+1-2+key]])

        for(var n=0; n < rIDs.length;n++) {
          if(rIDs[n+1] == rIDs[n]+1) continue
          else {

            //including info in false rows into previous true row
            if(rIDs[n]-1+key < headers.length)
              tmp[i-1][headers[rIDs[n]-1+key]] = {"0":tmp[i-1][headers[rIDs[n]-1+key]],"1":tmp[i][objKeys[key]]}
          }
        }

        // console.log("key: "+objKeys[key])
      }
      
      continue
    }
    
    // row incompleteness detection 
    if(tmp[i].rowspansIDs !=='') nextRowFalse = true
    else nextRowFalse = false

  }

  // filter only true row
  tmp = tmp.filter(tmp => tmp.isTrueRow === true)

  return tmp
}

function parseHTML(str) {
  var dom = document.createElement("div");
  dom.innerHTML = str;
  return dom.innerHTML;
}


