const { query } = require("express");
const express = require("express");
const { get } = require("http");
const { animals } = require('./data/animals');
const PORT = process.env.PORT || 3001;
const app = express();
const fs = require('fs');
const path = require('path');


//parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
//parse incoming json data
app.use(express.json());


function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  //Save the animalsArray as filteredresults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
  // Save personalityTraits as a dedicated array.
  // If personalityTraits is a string, place it into a new array and save.
  if (typeof query.personalityTraits === 'string') {
    personalityTraitsArray = [query.personalityTraits];
  } else {
    personalityTraitsArray = query.personalityTraits;
  }
  //loop through each trait in the personalityTraits array:
  personalityTraitsArray.forEach(trait => {
  filteredResults = filteredResults.filter(
    animal => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
  }
  return filteredResults;
}


//takes in the id and array of animals and return a single animal object
function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}

function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({ animals: animalsArray }, null, 2)
  );
  return animal;
}

app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query){
    results = filterByQuery(req.query, results);
  }
    res.json(results);
  });

app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
  //if no results, send error
  if (result) {
    res.json(result);
  } else {
  res.send(404);
  }
});

app.post('/api/animals', (req, res) => {
  //set id based on what the next index of the array will be
  req.body.id = animals.length.toString();
  // if any data in req.body is incorrect, send 400 error back
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.');
  } else {
    const animal = createNewAnimal(req.body, animals);
  res.json(req.animal);
  }
});

//validate user data
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}

app.listen(PORT, () => {
    console.log(`API server now on ${PORT}!`);
  });