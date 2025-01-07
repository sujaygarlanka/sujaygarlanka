+++
draft = false
title = 'Drink Machine'
summary = "A CAD designed and 3D-printed drink machine that mixes drinks with millileter accuracy. Recipes can be sent via an NFC enabled iPhone app."
weight = -1
[params]
  data = 'Hardware'
  dataColor = 'pink'
+++

{{< figure src="https://raw.githubusercontent.com/sujaygarlanka/DrinkMixr/master/media/DrinkMixr-demo.gif" height="450px">}}

A friend and I built a drink mixing machine that can dispense up to 4 liquids with half an ounce accuracy in any combination. There are three parts to this project.

- [Drink Machine](#drink-machine)
- [Mobile App](#mobile-app)
- [API](#api)

## Drink Machine

A physical machine that is 3D printed and MDF cut and contains tubing and motors controlled by a Raspberry Pi. It runs embedded python code that can be found [here](https://github.com/sujaygarlanka/DrinkMixr-Raspberry-Pi).

<div style="display: flex; gap: 20px;">
{{< figure title="Final Machine" src="https://raw.githubusercontent.com/sujaygarlanka/DrinkMixr/master/media/machine.jpg" width="350px">}}
{{< figure title="3D Model" src="https://raw.githubusercontent.com/sujaygarlanka/DrinkMixr/master/media/machine-3D.png" width="350px">}}
</div>

## Mobile App

{{< figure src="https://raw.githubusercontent.com/sujaygarlanka/DrinkMixr/master/media/app-demo.gif" width="250px">}}

A mobile built in React Native that allows you to customize, save and send recipes to the drink machine when you tap your phone to the machine. Code for the 
app can be found [here](https://github.com/sujaygarlanka/DrinkMixr/tree/master/mobile_app).

## API

An API written in Python Flask running on a heroku server that accepts orders sent from the mobile app, queues them and sends them to the machine when it is ready to dispense. This API also handles the creation of users, tracking how much a user drinks, storing machine settings, etc. The API uses a MongoDB database to store all information.

### API Endpoints:

```python
@app.route('/order', methods=['GET'])
def getOrder():
    """
    GET /order
    Get the first order in the queue.

    Returns:
        JSON: The first order in the queue.
    """
    pass


@app.route('/order', methods=['POST'])
def addOrder():
    """
    POST /order
    Add an order to the end of the queue.

    Request Body:
        JSON: The order details.

    Returns:
        200 OK: If the order was successfully added.
        400 Bad Request: If the order data is missing or invalid.
    """
    pass


@app.route('/user', methods=['POST'])
def createUser():
    """
    POST /user
    Create a new user.

    Request Body:
        JSON: Contains the user's name.

    Returns:
        200 OK: If the user was successfully created.
        400 Bad Request: If the name is missing in the request body.
    """
    pass


@app.route('/configuration', methods=['GET'])
def getConfiguration():
    """
    GET /configuration
    Get the current Drink Mixr ingredients and motor configurations.

    Returns:
        JSON: The current configuration.
        200 OK: If the configuration is successfully retrieved.
    """
    pass


@app.route('/ingredients', methods=['PUT'])
def updateIngredients():
    """
    PUT /ingredients
    Update the ingredients in the Drink Mixr.

    Request Body:
        JSON: The updated ingredient list.

    Returns:
        204 No Content: If the update was successful.
    """
    pass


@app.route('/motors', methods=['PUT'])
def updateMotors():
    """
    PUT /motors
    Update the motor configurations in the Drink Mixr.

    Request Body:
        JSON: The updated motor configurations.

    Returns:
        204 No Content: If the update was successful.
    """
    pass


@app.route('/tubes', methods=['PUT'])
def updateTubes():
    """
    PUT /tubes
    Update the volume in the Drink Mixr's tubes.

    Request Body:
        JSON: The updated tube volume information.

    Returns:
        204 No Content: If the update was successful.
    """
    pass


@app.route('/recipes', methods=['GET'])
def getRecipes():
    """
    GET /recipes
    Retrieve all recipes for a specific user.

    Query Parameters:
        user_name (str): The name of the user.

    Returns:
        JSON: A list of recipes for the specified user.
        200 OK: If the recipes are successfully retrieved.
        400 Bad Request: If the user name is missing.
    """
    pass


@app.route('/recipes', methods=['POST'])
def addRecipe():
    """
    POST /recipes
    Add or update a recipe for a user.

    Query Parameters:
        user_name (str): The name of the user.

    Request Body:
        JSON: The recipe details.

    Returns:
        JSON: Confirmation of the added or updated recipe.
        200 OK: If the operation was successful.
        400 Bad Request: If the user name is missing.
    """
    pass


@app.route('/recipes', methods=['DELETE'])
def deleteRecipe():
    """
    DELETE /recipes
    Delete a specific recipe for a user.

    Query Parameters:
        user_name (str): The name of the user.
        recipe_name (str): The name of the recipe to delete.

    Returns:
        JSON: Confirmation of the deleted recipe.
        200 OK: If the recipe is successfully deleted.
        400 Bad Request: If the user name or recipe name is missing.
    """
    pass

```