// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { JSDOM } = require('jsdom')
const { document } = (new JSDOM(`...`)).window;

export default async function handler(req, res) {
  var finalResult = []
  let paramData;
  let param;
  if(req.query.s !== undefined) {
    paramData = req.query.s
    param = "s"
  }
  else {
    paramData = req.query.t
    param = "t"
  }
  const data = await fetch(req.query.url +"&"+param+"="+ paramData)
  .then(function (response) { return response.text(); })
  .then(function (html) {

    // parsing string with trimmed \n like symbols to HTML
    var doc = parseHTML(html.replace(/[\n\t\r]/g,""));
    const dom = new JSDOM(doc)
    var DOMTable = dom.window.document.querySelector("#ScheduleWeek")

    // defining if table is simple
    let simpleTypeTable = isTableSimple(DOMTable)

    // main func call
    if(simpleTypeTable) finalResult = getScheduleSimple(DOMTable)
    else finalResult = getScheduleComplicated(DOMTable)
    
    
  }).catch(function (err) { console.warn('Something went wrong.', err) });

  res.status(200).json(finalResult)
}

function isTableSimple(DOMTable) {
  let isSimple = true
  DOMTable.querySelector('thead tr').querySelectorAll('th').forEach((el) => {
    if(isSimple) {
      if(el.getAttribute('colspan') === "2") {
        isSimple = !isSimple
      }
    }
    
  })
  return isSimple
}


function getSched(DOMTable) {

  let tabHead = DOMTable

  if (!tabHead) return false;

  let tab = tabHead.lastChild;

  let colSpans = [].slice.call(tabHead.rows[0].cells, 1).map(cell => cell.colSpan || 1);
  let rowSpans = [];

  for (let span, rowIdx = 0; rowIdx < tab.rows.length; rowIdx += span) {
    let row = tab.rows[rowIdx];
    span = row.cells[0].rowSpan || 1;
    rowSpans.push(span);
  }

  let rowSpan;
  let rowSpanIdx = 0;
  let rowSpanIn;
  let rowSpansLeft;
  let rowSpansLeftN = 0;

  let colSpan;
  let colSpanIdx;
  let colSpanIn;

  let resultCell;
  let resultRow;
  let results = [];
  
  for (let y = 0; y < tab.rows.length; y++) {
    let row = tab.rows[y];

    if (rowSpansLeftN <= 0) {
      resultRow = [];
      results[rowSpanIdx] = resultRow;

      rowSpan = rowSpans[rowSpanIdx++];
      rowSpanIn = 0;
      rowSpansLeftN = 0;

      rowSpansLeft = new Array(colSpans.length).map((v, k) => {
        let spans = rowSpan * colSpans[k];
        rowSpansLeftN += spans;
        return spans;
      });
    }
    

    colSpan = 0;
    colSpanIdx = 0;
    colSpanIn = 0;
    while (colSpanIdx < rowSpansLeft.length && rowSpansLeft[colSpanIdx] <= 0) colSpanIdx++;

    for (let x = rowSpanIn ? 0 : 1; x < row.cells.length; x++) {
      let cell = row.cells[x];

      if (colSpanIn >= colSpan) {
        if (colSpan) {
          do {colSpanIdx++;}
          while (colSpanIdx < rowSpansLeft.length && rowSpansLeft[colSpanIdx] <= 0);
        }

        resultCell = resultRow[colSpanIdx];
        if (!resultCell) resultRow[colSpanIdx] = resultCell = [];


        colSpan = colSpans[colSpanIdx];
        colSpanIn = 0;
      }

      
      let cellRowSpan = cell.rowSpan || 1;
      let cellColSpan = cell.colSpan || 1;
      let coverage = cellRowSpan * cellColSpan;

      rowSpansLeft[colSpanIdx] -= coverage;
      rowSpansLeftN -= coverage;

      let lession = cell.querySelector('div');
      let info = cell.querySelector('div.Info');

      if (lession && info) {
        resultCell.push({
          week: (cellRowSpan >= rowSpan) ? null : (rowSpanIn + 1),
          subgroup: (cellColSpan >= colSpan) ? null : (colSpanIn + 1),
          link: lession.firstChild.href,
          subject: lession.textContent,
          subjectType: info.firstChild.textContent.trim(),
          room: info.lastChild.textContent.trim()
        });
      }

      colSpanIn += cell.colSpan || 1;
    }
    
    rowSpanIn++;
  }

  return results;
};


function getScheduleSimple(DOMTable) {
  var headers = [];   // array with table headers
  var tmp = []   // main array


  let getLesson = (week, subgroup, lesson, info) => {
    return {
      week: week, 
      subgroup: subgroup, 
      link: lesson.firstChild.href,
      subject: lesson.textContent, 
      subjectType: info.firstChild.textContent.trim(),
      venue: info.lastChild.textContent.trim()
      }
  }
  // console.log([].slice.call(DOMTable.rows[0].cells, 1).map(cell => cell.colSpan || 1))

  let tab = DOMTable.lastChild;

  // Table header select with space trimming
  DOMTable.querySelector('thead tr').querySelectorAll('th').forEach((el) => {headers.push(el.innerHTML.replace(/\s/g, '' ))})

  // All rows select and forEach cycle with info collecting
  for(let y = 0; y < tab.rows.length; y++) {

    let tr = tab.rows[y]

    // variable which will contain all info about row
    var obj = {}
    // service variable for adding it to the object in the future. Item IDs that have an the rowspan attribute
    let rowspansIDs = []

    var isTrueRow = false // service variable for understanding whether the current element is True | цілісний

    // row incompleteness detection
    try { isTrueRow = tr.cells[0].classList.contains("LessonNumber") ? true : false}
    catch(e) {}

    var isOneLayered = true

    isOneLayered = tr.cells[0].rowSpan == 1 ? true : false

    // cycle with collecting RAW INFO from table and pushing it into main array
    // passing all elements in row cycle
    for (let x = isTrueRow ? 1 : 0; x < tr.cells.length; x++) {
      let cell = tr.cells[x];
      
        
        

        // row IDs that have an the rowspan attribute detection
        try { if(cell.getAttribute('rowspan') != null) rowspansIDs.push(x)}
        catch(e) {}

        let lesson = cell.querySelector('div');
        let info = cell.querySelector('div.Info');

        // Присвоєння значень
        obj.isTrueRow = isTrueRow;
        obj.rowspansIDs = rowspansIDs;
        obj.timeStart = tr.cells[0].lastChild.textContent.split('-')[0];
        obj.timeEnd = tr.cells[0].lastChild.textContent.split('-')[1]

        let week = null;

        if(cell.rowSpan == 1 && !isOneLayered && isTrueRow) week = 1;
        if(!isTrueRow) week = 2

        let subgroup = null;

        if(lesson && info) {
          obj[headers[x]] = [getLesson(week,null, lesson, info)]
        }
        else obj[headers[x]] = []
      

    }
    tmp.push(obj)
  }


  
  
  var nextRowFalse = false; // service variable for understanding whether the next element (object) is false or incomplete
  // cycle with POLISHING objects
  for(var i = 0; i< tmp.length;i++) {

    if(nextRowFalse) {
      nextRowFalse = false

      // splitting and parsing rowspansIDs elements into numbers in array for future use in polishing info
      var rIDs = tmp[i-1].rowspansIDs;

      // service variable for obtaining all the parameters of the main object (tmp) for further iterating | Because all FALSE rows has different amounts of parameters
      var objKeys = Object.keys(tmp[i])
      for(var key = 4; key< objKeys.length; key++) {
        // console.log([headers[rIDs[rIDs.length-1]+1-2+key]])

        for(var n=0; n < rIDs.length;n++) {
          if(rIDs[n+1] == rIDs[n]+1) continue
          else {

            //including info in false rows into previous true row
            if(rIDs[n]-3+key < headers.length)
              tmp[i-1][headers[rIDs[n]-3+key]].push(tmp[i][objKeys[key]][0])
          }
        }

        // console.log("key: "+objKeys[key])
      }
      
      continue
    }

    // row incompleteness detection 
    if(tmp[i].rowspansIDs.length !== 0) nextRowFalse = true
    else nextRowFalse = false
  }

  // filter only true row
  tmp = tmp.filter(tmp => tmp.isTrueRow === true)
  tmp.forEach((el) => {
    delete el.isTrueRow
    delete el.rowspansIDs
  })

  return tmp
}

function getScheduleComplicated(DOMTable) {
  var headers = [];   // array with table headers
  var tmp = []   // main array

  let getLesson = (week, subgroup, lesson, info) => {
    return {
      week: week, 
      subgroup: subgroup, 
      link: lesson.firstChild.href,
      subject: lesson.textContent, 
      subjectType: info.firstChild.textContent.trim(),
      venue: info.lastChild.textContent.trim()
      }
  }
  // console.log([].slice.call(DOMTable.rows[0].cells, 1).map(cell => cell.colSpan || 1))

  let tab = DOMTable.lastChild;

  let colSpans = [].slice.call(tab.rows[0].cells, 1).map(cell => cell.colSpan || 1);
  // console.log(colSpans)

  // Table header select with space trimming
  DOMTable.querySelector('thead tr').querySelectorAll('th').forEach((el) => {headers.push(el.innerHTML.replace(/\s/g, '' ))})

  // All rows select and forEach cycle with info collecting
  for(let y = 0; y < tab.rows.length; y++) {

    let tr = tab.rows[y]

    try{ 
      if(tr.cells[y].colSpan == 2 && isTrueRow) firstElemInDay = false
    }
    catch(e) {}

    // variable which will contain all info about row
    var obj = {}
    // service variable for adding it to the object in the future. Item IDs that have an the rowspan attribute
    let rowspansIDs = []

    var isTrueRow = false // service variable for understanding whether the current element is True | цілісний

    // row incompleteness detection
    try { isTrueRow = tr.cells[0].classList.contains("LessonNumber") ? true : false}
    catch(e) {}

    var isOneLayered = true
    isOneLayered = tr.cells[0].rowSpan == 1 ? true : false

    let accomplishedElement = false

    let headerIndex = isTrueRow ? 1 : 0
    let firstElemInDay = true

    // cycle with collecting RAW INFO from table and pushing it into main array
    // passing all elements in row cycle
    for (let x = isTrueRow ? 1 : 0; x < tr.cells.length; x++) {
      let cell = tr.cells[x];
      
      let increment = false
        
      if(cell.rowSpan == 2 && cell.colSpan == 2) accomplishedElement = true
        // row IDs that have an the rowspan attribute detection
      try { 

        if(!firstElemInDay && cell.rowSpan == 2) rowspanOffset--
        try {
          if(
            (cell.rowSpan == 2 && cell.colSpan == 2) || 
            (firstElemInDay && tr.children[x+1].rowSpan == 2 && tr.children[x].rowSpan == 2)
              )  {
                rowspansIDs.push(x);
                firstElemInDay = false
              }
        }
        catch(e) {}
      }
      catch(e) {}

      if(!isOneLayered) {

            
        if(firstElemInDay) {
          firstElemInDay = !firstElemInDay

        } else {
          firstElemInDay = !firstElemInDay
          increment = true;
        }

      }
      else increment = true;



      let lesson = cell.querySelector('div');
      let info = cell.querySelector('div.Info');

      // Присвоєння значень
      obj.isTrueRow = isTrueRow;
      obj.rowspansIDs = rowspansIDs;
      obj.timeStart = tr.cells[0].lastChild.textContent.split('-')[0];
      obj.timeEnd = tr.cells[0].lastChild.textContent.split('-')[1]

      let week = null;

      if(cell.rowSpan == 1 && !isOneLayered && isTrueRow) week = 1;
      if(!isTrueRow) week = 2

      let subgroup = null;
      if(!isOneLayered) {
        if(firstElemInDay && !accomplishedElement && colSpans[headerIndex] == 2) subgroup = 1
        if(!firstElemInDay && !accomplishedElement && colSpans[headerIndex] == 2) subgroup = 2
      }
      // console.log(obj[headers[headerIndex]] === undefined)
      // if(lesson && info) {
      //   if(obj[headers[headerIndex]] === undefined) 
      //     obj[headers[headerIndex]] = [getLesson(week,subgroup, lesson, info)]
        
      // }
      // else obj[headers[headerIndex]] = []

      if(isOneLayered) {
        if(lesson && info) obj[headers[headerIndex]] = [getLesson(week,subgroup, lesson, info)]
        else obj[headers[headerIndex]] = []
      }
      else {
        if(lesson && info) {
        if(obj[headers[headerIndex]] === undefined) 
          obj[headers[headerIndex]] = [getLesson(week,subgroup, lesson, info)]
        else {
          if(obj[headers[headerIndex]][0] === undefined) obj[headers[headerIndex]].push({...getLesson(week,subgroup, lesson, info), subgroup: 2})
          else obj[headers[headerIndex]] = [{...obj[headers[headerIndex]][0], subgroup:1},{...getLesson(week,subgroup, lesson, info), subgroup: 2}]
        }
        }
        else obj[headers[headerIndex]] = []
      }

      
      if(increment) headerIndex++
    }
    tmp.push(obj)
  }


  
  
  var nextRowFalse = false; // service variable for understanding whether the next element (object) is false or incomplete
  // cycle with POLISHING objects
  // for(var i = 0; i< tmp.length;i++) {

  //   if(nextRowFalse) {
  //     nextRowFalse = false

  //     let multiple_rIDs = false
      

  //     // splitting and parsing rowspansIDs elements into numbers in array for future use in polishing info
  //     var rIDs = tmp[i-1].rowspansIDs;

  //     if(rIDs.length > 1) multiple_rIDs= true

  //     // service variable for obtaining all the parameters of the main object (tmp) for further iterating | Because all FALSE rows has different amounts of parameters
  //     var objKeys = Object.keys(tmp[i])
  //     for(var key = 4; key< objKeys.length; key++) {
  //       // console.log([headers[rIDs[rIDs.length-1]+1-2+key]])

  //       if(multiple_rIDs) {
  //         if(rIDs[0] != 0) rIDs.unshift(0)
  //         for(var n=0; n < rIDs.length;n++) {
  //           if(rIDs[n+1] == rIDs[n]+1) continue
  //           else {

  //             //including info in false rows into previous true row
  //             if(rIDs[n]-3+key < headers.length)
  //               tmp[i-1][headers[rIDs[n]-3+key]].push(tmp[i][objKeys[key]][0])
  //           }
  //         }
  //       } 
  //       else {
  //       let plus;
  //         if(key >= rIDs) plus = 1
  //         else plus = 0

  //         tmp[i-1][headers[key-3+plus]].push(tmp[i][objKeys[key]][0])
  //       }

  //       // console.log("key: "+objKeys[key])
  //     }
      
  //     continue
    
  // }

  //   // row incompleteness detection 
  //   if(tmp[i].rowspansIDs.length !== 0) nextRowFalse = true
  //   else nextRowFalse = false
  // }

  // filter only true row
  // tmp = tmp.filter(tmp => tmp.isTrueRow === true)
  tmp.forEach((el) => {
    delete el.isTrueRow
    // delete el.rowspansIDs
  })

  return tmp
}

function complicatedTableToJSON(DOMTable) {
  var headers = [];   // array with table headers
  var tmp = []   // main array

  // Table header select with space trimming
  DOMTable.querySelector('thead tr').querySelectorAll('th').forEach((el) => {headers.push(el.innerHTML.replace(/\s/g, '' ))})

  //headers = [...headers, "пп1","пп2","пп3","пп4","пп5","пп6","пп7","пп8"] // temporary

  // All rows select and forEach cycle with info collecting
  DOMTable.querySelector('tbody').querySelectorAll('tr').forEach((el) => {

    // creating DOM element for greater possibilities of interaction with the element
    var tr = document.createElement('tr')
    tr.insertAdjacentHTML("afterbegin",el.innerHTML)


    // variable which will contain all info about row
    var obj = {}
    // service variable for adding it to the object in the future. Item IDs that have an the rowspan attribute
    obj.rowspansIDs = ''

    // row incompleteness detection
    var isTrueRow = false // service variable for understanding whether the current element is True | цілісний
    try { isTrueRow = tr.children[0].classList.contains("LessonNumber") ? true : false}
    catch(e) {}

    let isOneLayered = false;
    isOneLayered = tr.children[0].getAttribute('rowspan') == null ? true : false

    let accomplishedElement = false

    let headerIndex = 0
    let firstElemInDay = false

    let rowspanOffset = 0

    // cycle with collecting RAW INFO from table and pushing it into main array
    // passing all elements in row cycle
    for(var i = 0; i< tr.children.length;i++) {
      let increment = false

      if(tr.children[i].getAttribute('colspan') != null && tr.children[i].getAttribute('rowspan') != null) accomplishedElement = true

      if(tr.children[i].getAttribute('colspan') != null && isTrueRow) firstElemInDay = false
      // console.log(isOneLayered+ " | "
      // +tr.children[0].textContent+ " | headerIndex: "
      // + headerIndex +" | trElem: "
      // +i+" | isFirstElem: "+firstElemInDay
      // + " |  rowspanOffset: "+ rowspanOffset
      // +" | Day: "+headers[headerIndex]
      // +" | RowspanIDs: "+obj.rowspansIDs)
      
      try {    
        // if(tr.children[i].getAttribute('colspan') != null) firstElemInDay = false

        if(!firstElemInDay && tr.children[i].getAttribute('rowspan') == null) rowspanOffset--
        
        // if(firstElemInDay) rowspanOffset++
        
        // row IDs that have an the rowspan attribute detection
        try {
          console.log("| i: "+i+" | rIDs: "+obj.rowspansIDs+" | accomplished: "+accomplishedElement+ "| altAccomplished: "+
          (tr.children[i].getAttribute('rowspan') != null && tr.children[i].getAttribute('colspan') != null))
          obj.rowspansIDs = ( 
            (tr.children[i].getAttribute('rowspan') != null && tr.children[i].getAttribute('colspan') != null) ||
            (firstElemInDay && tr.children[i+1].getAttribute('rowspan') != null && tr.children[i].getAttribute('rowspan') != null)
          ) ? 
            obj.rowspansIDs == '' ? (i+rowspanOffset) : obj.rowspansIDs+", " + (i+rowspanOffset) : obj[rowspansIDs];}
        catch(e) {}

        // try { obj.rowspansIDs = (tr.children[i].getAttribute('rowspan') != null && tr.children[i].getAttribute('colspan') != null) ? obj.rowspansIDs == '' ? (i+rowspanOffset) : obj.rowspansIDs+", " + (i+rowspanOffset) : obj[rowspansIDs];}
        // catch(e) {}

            if(!isOneLayered) {

              
              if(firstElemInDay) {
                firstElemInDay = !firstElemInDay

              } else {
                firstElemInDay = !firstElemInDay
                increment = true;
              }

            }
            else increment = true;

          

          // Присвоєння значень
          obj.isTrueRow = isTrueRow;
          // obj.isOneLayered = isOneLayered;
          if(isOneLayered) obj[headers[headerIndex]] = tr.children[i].textContent
          else {
            if(obj[headers[headerIndex]] == undefined) obj[headers[headerIndex]] = tr.children[i].textContent
            else  {
              obj[headers[headerIndex]] = {"left":tr.children[i-1].textContent, "right":tr.children[i].textContent}
            }
          }
            // obj[headers[headerIndex]] += tr.children[i].textContent

          

          
          if(increment) headerIndex++
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

      let multiple_rIDs = false

      // console.log(tmp[i-1].rowspansIDs )
      // splitting and parsing rowspansIDs elements into numbers in array for future use in polishing info
      var rIDs = tmp[i-1].rowspansIDs
      try{ 
        rIDs = (tmp[i-1].rowspansIDs).split(", ").map((x)=>{return parseInt(x)} );
        multiple_rIDs = true
      }
      catch(e) {}

      // service variable for obtaining all the parameters of the main object (tmp) for further iterating | Because all FALSE rows has different amounts of parameters
      var objKeys = Object.keys(tmp[i])

      for(var key = 2; key< objKeys.length; key++) {
        // console.log([headers[rIDs[rIDs.length-1]+1-2+key]])
        if(multiple_rIDs) {
          if(rIDs[0] != 0) rIDs.unshift(0)
          for(var n=0; n < rIDs.length;n++) {
            // console.log("| rowId(i): "+i+" | rID: "+rIDs[n]+" | rIDs[n]-1+key: "+ (rIDs[n]-1+key)+" | day than changes: "+headers[rIDs[n]-1+key])
            if(rIDs[n+1] == rIDs[n]+1) continue
            else {
              console.log("change in that row")
              //including info in false rows into previous true row
              if(rIDs[n]-1+key < headers.length)
                tmp[i-1][headers[rIDs[n]-1+key]] = {"0":tmp[i-1][headers[rIDs[n]-1+key]],"1":tmp[i][objKeys[key]]}
            }
            // console.log(tmp[i-1][""]+" | day than changes: "+headers[rIDs[n]-1+key])
          }

        } else {
          let plus;
          if(key >= rIDs) plus = 1
          else plus = 0
          // console.log("plus: "+plus+" | i: "+i+" | key: "+key+" | "+headers[-1+key+plus])
          
          tmp[i-1][headers[-1+key+plus]] = {"0":tmp[i-1][headers[-1+key+plus]],"1":tmp[i][objKeys[key]]}
        }

        
      }
      
      continue
    }
    console.log(rIDs)
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
