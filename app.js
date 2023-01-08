//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
var _ = require('lodash');
const { result } = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const i1=new Item({
  name:"Bread"
});

const i2=new Item({
  name:"Butter"
});

const i3=new Item({
  name:"Jam"
});

const defaultItems=[i1,i2,i3];

const listSchema ={

  name:String,
  items: [itemsSchema]
};

const List =mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems)
  {
    if(foundItems.length === 0) 
      {
        Item.insertMany(defaultItems, function(err)
         { 
          if(err)
            {
              console.log(err);
            }
           else
            {
              console.log("Successfull Updated the Items");
             }
          });
      }
      else
      {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  });
});

app.get("/:topic",function(req,res)
{
  const customListName =_.capitalize(req.params.topic);

    List.findOne({name :customListName}, function(err,foundList)
    {
      if(!err)
      {
        if(!foundList)
        {
          //create new list
          const list =new List({
            name:customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+ customListName); 
        }
        else
        {
          //show an existing list
          res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
        }
      }
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listname = req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listname === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listname}, function(err,foundList){

      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listname);
    });
  }
});

app.post("/delete", function(req, res) 
{
  const id=req.body.checkbox;

  const listName =req.body.listName;

  if(listName === "Today")
  {
  Item.findByIdAndRemove(id, function(err)
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("successfully removed");
      res.redirect('/');
    }
  });
}
else
{
  List.findOneAndUpdate(
    {name: listName},
    {$pull : {items: {_id: id}}},
    function(err,foundList)
    {
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
}
});
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on http://localhost:3000");
});
