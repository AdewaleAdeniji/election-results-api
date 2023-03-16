//file is in csv
//convert them to json
//write the conversion to a state-file
//write the result to result file

const fs = require("fs");
const folderPath = "results";
const filePaths = [];
const stateResults = [];
const csv = require("csvtojson");

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach((file) => {
    if (file.includes("_crosschecked")) {
      filePaths.push(file);
    }
  });
  filePaths.forEach((path)=>{
      processFile(path);
  })
});
async function processFile(path) {
  const filePath = "results/" + path;
  const state = path.split("_")[0];
  csv()
    .fromFile(filePath)
    .then((results) => {
      addResult(results, state);
    });
}
function addResult(results, state) {
  const scores = [];

  const score = {
    STATE: state,
    APC: 0,
    LP: 0,
    PDP: 0,
  };

  results.forEach((result) => {
    score.APC = score.APC + parseInt(result.APC);
    score.LP = score.LP + parseInt(result.LP);
    score.PDP = score.PDP + parseInt(result.PDP);
    scores.push({
      APC: result.APC,
      LP: result.LP,
      PDP: result.PDP,
      Ward: result.Ward,
      LGA: result.LGA,
      PU: result["PU-Name"],
      STATE: result.State,
    });
  });
  stateResults.push(score);
  fs.writeFile("parsed/" + state + ".json", JSON.stringify(scores), (err) => {
    if (err) {
      console.log("FAILED " + state);
      return;
    }
    console.log("SUCCESS " + state);
  });
  fs.writeFile("stateResults.json", JSON.stringify(stateResults), (err) => {
    if (err) {
      console.log("FAILED STATE" + state);
      return;
    }
    console.log("SUCCESS STATE" + state);
  });
}
//console.log(filePaths)
