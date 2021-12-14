//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://newuser:welcome123@cluster0.op2ib.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
};

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

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



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

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
      if (!err) {
        if (!foundList) {
          console.log("Does not exist");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
    else {
      console.log(err);
    }
  })

});
app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName == "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name : listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
});

app.post("/delete", function(req, res){

  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  Item.findByIdAndRemove(checkedItemID, function(err, ){
    if (!err){
      if (listName === "Today"){
        console.log("Delete Success");
        res.redirect("/");
      }
      else {
        List.findOneAndUpdate({name : listName}, {$pull : {items: {_id: checkedItemID}}}, function(err, foundList){
            if (!err) {
              res.redirect("/" + listName);
            }
        });
      }
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
