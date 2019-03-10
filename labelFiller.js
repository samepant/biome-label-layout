#include "json2.js"

var script_file = File($.fileName); // get the location of the script file
var script_file_path = script_file.path; // get the path

var file_to_read = File(script_file_path + "/citizenSeeds.json");// but we want JSON
var citizenSeeds = null; // create an empty variable

var content; // this will hold the String content from the file
if(file_to_read !== false){// if it is really there
  file_to_read.open('r'); // open it
  content = file_to_read.read(); // read it
  citizenSeeds =  JSON.parse(content);// now evaluate the string from the file
  file_to_read.close(); // always close files after reading

  var labelCount = citizenSeeds.citizenCap;

  //do page generations
  generateLabels(labelCount, citizenSeeds.seeds);

}else{
  alert("error reading citizen seeds"); // if something went wrong
}


function generateLabels(numberOfLabels, seeds) {
  var myDocument = app.activeDocument;
  var masterSpreads = myDocument.masterSpreads;
  var masterSpread = masterSpreads.item('A-Master');
  var initial = myDocument.spreads.add();

  layoutLabelRecursive(myDocument, numberOfLabels, masterSpread, initial, seeds, 1);
}

function layoutLabelRecursive(document, numberOfLabels, masterSpread, currentSpread, seeds, labelCount, needsNewSpread){
  if (needsNewSpread) {
    var newSpread = document.spreads.add();
    newSpread.appliedMaster= masterSpread;

    layoutLabelRecursive(document, numberOfLabels, masterSpread, newSpread, seeds, labelCount, false);
  } else {
    if (labelCount === numberOfLabels) {
      // last label just happened
      return;
    } else {
      //main loop

      var currentSeed = seeds[labelCount - 1];
      var groupNumber;

      if ((labelCount % 12) > 0) {
        groupNumber = labelCount % 12;
      } else {
        groupNumber = 12;
      }

      var groupMaster = currentSpread.appliedMaster.groups.item(groupNumber.toString());

      var currentPage = currentSpread.pages.firstItem();
    
      groupMaster.override(currentPage);

      var circle = currentSpread.groups.item(groupNumber.toString()).ovals.item('codeTextCircle');
      var qrMediaBox = currentSpread.groups.item(groupNumber.toString()).rectangles.item('qrCodeBox');
      
      var text = circle.textPaths.firstItem();
      var code = currentSeed;
      text.contents = code;

      var qrCodeSource = script_file_path + '/qrCodes/' + code + '.png';
      var qrCode = new File(qrCodeSource);
      qrMediaBox.place(qrCode, false);
      qrMediaBox.fit(FitOptions.PROPORTIONALLY);
      qrMediaBox.fit(FitOptions.centerContent);
      qrMediaBox.sendToBack()

      //send it back around
      var nextLabel = labelCount + 1;

      if ((nextLabel % 12) === 1) {
        layoutLabelRecursive(document, numberOfLabels, masterSpread, currentSpread, seeds, nextLabel, true);
      } else {
        layoutLabelRecursive(document, numberOfLabels, masterSpread, currentSpread, seeds, nextLabel, false);
      }
    }  
  }
}


