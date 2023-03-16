const results = require("./csvjson.json");
var fs = require("fs");

const scores = [];

const score = {
    APC: 0,
    LP: 0,
    PDP: 0,
}


results.forEach((result)=> {
    score.APC = score.APC + result.APC
    score.LP = score.LP + result.LP
    score.PDP = score.PDP + result.PDP
    scores.push({
        APC: result.APC,
        LP: result.LP,
        PDP: result.PDP,
        Ward: result.Ward,
        LGA: result.LGA,
        PU: result['PU-Name']
    })
})

console.log(score)
fs.writeFile('oyo.json', JSON.stringify(scores), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('File has been written successfully!');
  });