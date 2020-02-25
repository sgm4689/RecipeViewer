const fs = require('fs'); // pull in the file system module

//Loads CSS and homepage
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const recipes = {};

//sends info to homepage
const respondJSON = (request, response, status, content, object) => {
     const stringMessage = JSON.stringify(object);//Convert JSON to string for transmission
   if (content && object){//Checks to make sure data's supposed to be sent
       response.writeHead(status, { 'Content-Type': content});
       response.write(stringMessage);
   }else{
       response.writeHead(status);
   }
    response.end();
};

//Gets the homepage
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};


//Gets the CSS
const getCSS = (request, response, acceptedTypes) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getAllRecipes = (request, response) => {
    respondJSON(request, response, 200, 'application/json', recipes)
   
}

const getAllRecipesByTag = (request, response) => {
    const header = {
      id: "notImplemented",
    message: 'This feature has not been implemented yet',
  };
    respondJSON(request, response, 500, 'application/json', header)
   
}

const getRandomRecipe = (request, response) => {
    const keys = Object.keys(recipes);
    const random = Math.floor(Math.random() * keys.length)
    const key = keys[random];
    const recipe = {key: recipes[keys[random]]};//wrap this in an object literal so the return is consistant with getAllRecipes
    respondJSON(request, response, 200, 'application/json', recipe)
   
}
const addRecipe = (request, response) =>{
      const body = [];

  //If There's an error, move on
  request.on('error', () => {
    response.statusCode = 400;
    response.end();
  });

  // Get Data
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const recipe = JSON.parse(Buffer.concat(body).toString());

    //the person is missing a parameter.  Throw an error
    if (!recipe.Name || !recipe.Ingredients || !recipe.Steps) {
      respondJSON(request, response, 400, 'application/json', {
        message: 'Please fill out all sections before submitting a recipe',
        id: 'missingParams',
      });
    }
    else if (recipes[recipe.Name]) {//If recipe exists
      respondJSON(request, response, 204, null, null);
    } else {
        //split steps and ingredients on new lines so the data is easier to format
        const ingredients = recipe.Ingredients.split("/");
        const steps = recipe.Steps.split("/");
      recipes[recipe.Name] = { Name: recipe.Name, Ingredients: ingredients, Steps: steps};
      respondJSON(request, response, 201, 'application/json', {
        message: 'Created Successfully',
      });
    }
  });
}

const getMissing = (request, response, acceptedTypes) => {
  const header = {
      id: "notFound",
    message: 'The page you are looking for was not found',
  };
  respondJSON(request, response, 404, 'application/json', header);
};

module.exports = {
  addRecipe,
  getRandomRecipe,
  getAllRecipes,
  getAllRecipesByTag,
  getMissing,
  getIndex,
  getCSS
};
