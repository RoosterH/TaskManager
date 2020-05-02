// setup mongodb-stich-browser-sdk, use import for server
// cannot use require, that is for client side
import { Stitch, RemoteMongoClient, AnonymousCredential } from 'mongodb-stitch-browser-sdk'

const client = Stitch.initializeDefaultAppClient('taskmanager-aispk');
const db = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db('taskmanager');
const login = client.auth.loginWithCredential(new AnonymousCredential());

// this section defines the funtion calls on the client side
$(document).ready(function(){
  // get all the tasks from mongoDB
  getTasks();
  // get category names from mogoDb
  getCategoryOptions();
  // insert tasks to mongoDB
  $('#add_task').on('submit', addTask);
});

function getTasks() {
  login.then(() =>
    db.collection('task').find({}, { limit: 100}).asArray()
  ).then(docs => {
    console.log("Found docs", docs);
    console.log("[MongoDB Stitch] Connected to Stitch");
  
    let output = '<ul class="list-group">';
    $.each(docs, (key, task) => {
      output += '<li class="list-group-item">';
      output += task.task_name+'<span class ="due_on"> [Due on ' + task.due_date + ']</span>';
      if (task.is_urgent == "true") {
        output += '<span class="lable label-danger"> Urgent</span>';
      }
      output += '<div class="float-right"><a class ="btn btn-primary" href="#">Edit</a> <a class ="btn btn-danger" href="#">Delete</a></div>';
    });
    output += '</ul>';
    // jQuery, #tasks is corresponding to id tasks in index.html
    $('#tasks').html(output); 
  }).catch(err => {
      console.error(err)
  });  
};

function addTask(e) {
  var task_name = $('#task_name').val();
  var category = $('#category').val();
  var due_date = $('#due_date').val();
  var is_urgent = $('#is_urgent').val();
  
  // Insert a Single Document
  // https://docs.mongodb.com/stitch/mongodb/add-data-to-mongodb/#methods
  const data = {
    "task_name": task_name,
    "category": category,
    "due_date": due_date,
    "is_urgent": is_urgent
  }
  // post request
  login.then(() =>
    db.collection('task').insertOne(data)
    .then(result => { 
      console.log(`Successfully inserted item with _id: ${result.insertedId}`);
      // re-direct to index.html page
      window.location.href='index.html';})
    .catch(err => 
      console.error(`Failed to insert item: ${err}`)
    )
  );
  
  // this will keep the value on the browser 
  e.preventDefault();
};

function getCategoryOptions() {
  login.then(() =>
    db.collection('category').find({}, { limit: 100}).asArray()
  ).then(docs => {
    console.log("Found docs", docs)
    console.log("[MongoDB Stitch] Connected to Stitch")
  
    let output;
    $.each(docs, (key, category) => {
      output += '<option value="'+category.category_name+'">'+category.category_name+'</option>';
    });
    output += '</ul>';
    // jQuery, this category is corresponding to the id category in addTask.html
    $('#category').append(output); 
  }).catch(err => {
      console.error(err)
  });
};

// testing function to check connection
function initializeAndLogin() {
//  const client = Stitch.initializeDefaultAppClient('taskmanager-aispk');
  client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
    document.getElementById('auth-status').innerHTML = 
      `Logged in as anonymous user with id ${user.id}`;
  });
}
 
//window.onload = initializeAndLogin;