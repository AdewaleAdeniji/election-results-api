const express = require("express");
const app = express();
const port = 3000;
const states = require("./states.json");
const stateResults = require("./stateResults.json");
const fs = require("fs");
const fss = require("fs").promises;
const csv = require("csvtojson");
const folderPath = "parsed";
const filePaths = [];
const _ = require("lodash");
var bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send({ name: "Built with Love by Feranmi" });
});
app.post("/slack", (req, res) => {
  // console.log(req.body)
  var request = require("request");
  var options = {
    method: "POST",
    url: "https://hooks.slack.com/services/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",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: req.body.message || "NO text",
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    // console.log(response.body);
  });

  res.send({ name: "Built with Love by Feranmi" });
});

app.get("/states", (req, res) => {
  res.send({ states });
});
app.get("/results/states", (req, res) => {
  res.send(stateResults);
});
app.get("/results/polling-units", async (req, res) => {
  const grouped = req.query.ungroup == "true" ? true : false;
  var resp = {};
  var puResults = [];
  var statesPath = "states.json";
  var states = await fss.readFile(statesPath, "utf-8");
  states = JSON.parse(states);
  for (var i = 0; i < states.length; i++) {
    var statee = states[i].toUpperCase();
    const statePath = "parsed/" + statee + ".json";
    var fileContent = await fss.readFile(statePath, "utf-8");
    fileContent = JSON.parse(fileContent);
    resp[statee] = fileContent;
    puResults = [...puResults, ...fileContent];
  }
  res.send(!grouped ? resp : puResults);
  return;
});

app.get("/polling-units", async (req, res) => {
  const grouped = req.query.ungroup == "true" ? true : false;
  var resp = {};
  var puResults = [];
  var statesPath = "states.json";
  var states = await fss.readFile(statesPath, "utf-8");
  states = JSON.parse(states);
  for (var i = 0; i < states.length; i++) {
    var statee = states[i].toUpperCase();
    const statePath = "parsed/" + statee + ".json";
    var fileContent = await fss.readFile(statePath, "utf-8");
    fileContent = JSON.parse(fileContent);
    var arr = fileContent.map((pu) => pu["PU"]);
    resp[statee] = arr;
    puResults = [...puResults, ...arr];
  }
  res.send(!grouped ? resp : puResults);
  return;
});
app.get("/wards", async (req, res) => {
  const grouped = req.query.ungroup == "true" ? true : false;
  var resp = {};
  var puResults = [];
  var statesPath = "states.json";
  var states = await fss.readFile(statesPath, "utf-8");
  states = JSON.parse(states);
  for (var i = 0; i < states.length; i++) {
    var statee = states[i].toUpperCase();
    const statePath = "parsed/" + statee + ".json";
    var fileContent = await fss.readFile(statePath, "utf-8");
    fileContent = JSON.parse(fileContent);
    const uniqueWardNames = _.uniqBy(fileContent, "Ward").map((pu) => pu.Ward);
    resp[statee] = uniqueWardNames;
    puResults = [...puResults, ...uniqueWardNames];
  }
  res.send(!grouped ? resp : puResults);
  return;
});
function groupPollingUnitsByWard(pollingUnits) {
  const wards = {};
  const wardResults = [];
  // iterate through each polling unit
  pollingUnits.forEach((unit) => {
    // check if the ward already exists in the wards object
    if (wards[unit.Ward]) {
      // if it exists, add the LP and APC votes to the existing ward
      wards[unit.Ward].LP += parseInt(unit.LP);
      wards[unit.Ward].APC += parseInt(unit.APC);
      wards[unit.Ward].PDP += parseInt(unit.PDP);
      wards[unit.Ward].STATE = unit.STATE;
      wards[unit.Ward].WARD = unit.Ward;
      var j = {
        LP: wards[unit.Ward].LP,
        APC: wards[unit.Ward].APC,
        PDP: wards[unit.Ward].PDP,
        Ward: wards[unit.Ward].WARD,
        State: wards[unit.Ward].STATE,
      };
      wardResults.push(j);
    } else {
      // if it doesn't exist, create a new ward with the LP and APC votes
      wards[unit.Ward] = {
        WARD: unit.ward,
        LP: parseInt(unit.LP),
        APC: parseInt(unit.APC),
        PDP: parseInt(unit.PDP),
        STATE: unit.STATE,
        WARD: unit.Ward,
      };
    }
  });

  // convert the wards object to an array

  return wards, wardResults;
}

app.get("/results/wards", async (req, res) => {
  //const grouped = req.query.ungroup == "true" ? true : false;
  var resp = [];
  var puResults = {};
  var statesPath = "states.json";
  var states = await fss.readFile(statesPath, "utf-8");
  states = JSON.parse(states);
  for (var i = 0; i < states.length; i++) {
    var statee = states[i].toUpperCase();
    const statePath = "parsed/" + statee + ".json";
    var fileContent = await fss.readFile(statePath, "utf-8");
    fileContent = JSON.parse(fileContent);
    let r = {};
    var t,
      results = groupPollingUnitsByWard(fileContent);
    r = { ...t };
    resp.push(results);
    puResults = { ...puResults, ...r };
  }
  res.send(resp);
  return;
});
app.get("/result/state/:state", (req, res) => {
  const { state } = req.params;
  try {
    const statePUResults = require("./parsed/" + state.toUpperCase() + ".json");
    var stateResult = stateResults.filter(
      (results) => results.STATE === state.toUpperCase()
    );
    res.send({
      total: stateResult,
      results: statePUResults,
    });
  } catch {
    res.status(400).send("State does not exist");
  }
});
app.get("/results/state/:state", (req, res) => {
  const { state } = req.params;
  try {
    const stateResults = require("./parsed/" + state.toUpperCase() + ".json");
    var stateResult = stateResults.filter(
      (results) => results.STATE === state.toUpperCase()
    );
    res.send({
      total: stateResult,
      results: stateResults,
    });
  } catch {
    res.status(400).send("State does not exist");
  }
});
app.get("/result", (req, res) => {
  const score = {
    APC: 0,
    LP: 0,
    PDP: 0,
  };
  stateResults.forEach((result) => {
    score.APC = score.APC + parseInt(result.APC);
    score.LP = score.LP + parseInt(result.LP);
    score.PDP = score.PDP + parseInt(result.PDP);
  });
  res.send(score);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${port}`);
});
