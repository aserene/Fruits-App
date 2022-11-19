require("dotenv").config() // load env variables
const express = require("express") // bring in express to make the routes in our app
const morgan = require("morgan") // logs every time there is a request to the server
const methodOverride = require("method-override") // allows us to override post requests from our ejs/forms
const mongoose = require("mongoose") // middleware that connects us to the mongodb and enables methods for CRUD

const PORT = process.env.PORT

const app = express()

//////////////////////////////////////////
////////// Database Connections //////////
//////////////////////////////////////////

const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// Establish our connections
mongoose.connect(DATABASE_URL, CONFIG)

// LOG CONNECTION EVENTS
mongoose.connection
    .on("open", () => console.log("Connected to Mongoose"))
    .on("close", () => console.log("Disconnected from Mongoose"))
    .on("error", (error) => console.log(error))

///////////////////////////////////////////
//////////// Fruits Model /////////////////
///////////////////////////////////////////
const { Schema, model } = mongoose // pull schema and model from mongoose

// make fruits schema
const fruitsSchema = new Schema({
    name: String,
    color: String,
    readyToEat: Boolean
})

const Fruit = model("Fruit", fruitsSchema)

/////////////////////////////////////////////////////
////////////////// Middleware ///////////////////////
/////////////////////////////////////////////////////
app.use(morgan("tiny")) //logging
app.use(methodOverride("_method")) // override for put and delete requests from forms
app.use(express.urlencoded({extended: true})) // parse urlencoded request bodies
app.use(express.static("public")) // serve files from public statically

/////////////////////////////////////////////////////
//////////////////// Routes /////////////////////////
/////////////////////////////////////////////////////
app.get("/", (req, res) => {
    res.send("Winter is coming....")
})
app.get("/fruits/seed", (req, res) => {
    const startFruits = [
        { name: "Orange", color: "orange", readyToEat: false },
        { name: "Grape", color: "purple", readyToEat: false },
        { name: "Banana", color: "orange", readyToEat: false },
        { name: "Strawberry", color: "red", readyToEat: false },
        { name: "Coconut", color: "brown", readyToEat: false },
      ]
    // Delete all fruits
  Fruit.deleteMany({}, (err, data) => {
    // Seed Starter Fruits
    Fruit.create(startFruits,(err, data) => {
        // send created fruits as response to confirm creation
        res.json(data);
      }
    )
  })
})
app.get("/fruits", (req, res)=> {
    // get all fruits from mongo and send them back
    Fruit.find({})
    .then((fruits) => {
        res.render("fruits/index.ejs", { fruits })
    })
    .catch(err => console.log(err))
})
// new route
app.get("/fruits/new", (req, res) => {
    res.render("fruits/new.ejs")
})
app.get("/fruits/:id", (req, res) => {
    // find the particular fruit from the database
    Fruit.findById(req.params.id)
    .then((fruit) => {
        res.render("fruits/show.ejs", { fruit })
    })
})
app.get("/fruits/:id/edit", (req, res) => {
    // get the id from params
    const id = req.params.id
    // get the fruit from the database
    Fruit.findById(id, (err, fruit) => {
        // render template and send it fruit
        res.render("fruits/edit.ejs", {fruit})
    })
})
// create route
app.post("/fruits", (req, res) => {
    // check if the readyToEat property should be true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false
    // create the new fruit
    Fruit.create(req.body, (err, fruit) => {
        // redirect the user back to the main fruits page after fruit created
        res.redirect("/fruits")
    })
})
//update route
app.put("/fruits/:id", (req, res) => {
    // get the id from params
    const id = req.params.id
    // check if the readyToEat property should be true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false
    // update the fruit
    Fruit.findByIdAndUpdate(id, req.body, {new: true}, (err, fruit) => {
        // redirect user back to main page when fruit 
        res.redirect("/fruits")
    })
})
app.delete("/fruits/:id", (req, res) => {
    // get the id from params
    const id = req.params.id
    // delete the fruit
    Fruit.findByIdAndRemove(id, (err, fruit) => {
        // redirect user back to index page
        res.redirect("/fruits")
    })
})
app.listen(PORT, () => {
    console.log(`The server is listening on port ${PORT}...`)
})
