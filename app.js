//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema ({
  name: String
})

const Item = mongoose.model("item", itemSchema);

const item1 = new Item ({
  name: "Welcome to your todo list"
});

const item2 = new Item ({
  name: "Hit + to add"
});

const item3 = new Item ({
  name: "<---- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }
        else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });
  item.save()
  res.redirect("/");
});

app.post("/delete", function(req, res){

  const checkedItemID = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemID, function(err){
    if (!err){
      console.log("Item Removed");
      res.redirect("/");
    }
  });
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
