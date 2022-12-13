const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Date = require(__dirname + "/date.js");
const _ = require("lodash");


const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
mongoose.connect("mongodb+srv://iamsourav19:savvy@cluster0.tha1ee5.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true});

let day = Date.getDate();

const itemSchema = {
  name : String
};const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
};const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {
  Item.find({}, function(err, items){
    res.render("list", { ListTitle: day, newlistItems: items });
  });  
});


app.get("/list/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){

      if(!foundList) {
        //found empty
        //create a new list
        const list = new List({
          name: customListName,
        });
        list.save();
        res.redirect("/" + customListName);
      }

      else {
        //show the existing list
        res.render("list", {ListTitle: foundList.name, newlistItems: foundList.items});
      }
    }
  })
})


app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });
  
  if(listName === day){
    item.save();
    res.redirect("/");  
    console.log("Today's list -> Item Inserted");
  }
  
  else{
    List.findOne({name:listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/list/" + listName);
      console.log(listName + " list -> Item inserted");
    });
  }
});


app.post("/delete", (req, res) => {
  const id = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName===day){
    Item.findByIdAndRemove(id, function(err){
      res.redirect("/");
      console.log("Today's list -> Item Deleted");
    });
  }
  else {
    List.findOne({name:listName}, (err, foundList)=>{
      foundList.items.remove({_id: id});
      foundList.save();
      res.redirect("/list/" + listName);
      console.log(listName +" list -> Item Deleted");
    });
  }
})


app.get("/about", (req, res) => {
  res.render("about");
});

let port = process.env.PORT;
if(port==null || port==""){
  port = 3000;
}
app.listen(port, () => {
  console.log("server has started successfully");
});