tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  var currentUserId = Meteor.userId();
  Meteor.subscribe('tasks', currentUserId);

  Template.todo.helpers({
  	tasks: function () {
      return tasks.find({}, { sort: { due: 1 } });
  	},

    typesOptions: {
      sortField: 'order',  // defaults to 'order' anyway
      group: {
        name: 'typeDefinition',
        pull: 'clone',
        put: false
      },
      sort: false  // don't allow reordering the types, just the attributes below
    }
  })

  Template.task.helpers({
    selected: function () {
      // this._id refers to ID's of all current tasks
      var allTasks = this._id;
      var selectedTask = Session.get("selected");
      // scans ID's to find match -> if the ID's match, that one is 'selected'
      if(allTasks == selectedTask){
          return "selected"
      }
    }
  });

  Template.task.events({
    'click': function () {
      var taskID = this._id;
      Session.set("selected", taskID);
      console.log('and 1');
    },

    'click .delete': function () {
      var taskID = this._id;
      Meteor.call("deleteTask", taskID);
    }
  });

  Template.body.events({
    "submit .taskInput": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var name = event.target.name.value;
      var due = event.target.due.value;
      var course = event.target.course.value;
      var details = event.target.details.value;
      var currentUserId = Meteor.userId();
 
      Meteor.call("addTask", name, due, course, details, currentUserId);
      Meteor.call("sendEmail", name, due, course, details, currentUserId);
      
      event.target.name.value = "";
      event.target.due.value = "";
      event.target.course.value = "";
      event.target.details.value = "";

    }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function () {
    // SyncedCron.add({
    //   name: 'Daily email notifications.',
    //   schedule: function(parser) {
    //     // parser is a later.parse object
    //     return parser.text('every 10 sec');
    //   },
    //   job: function() {
    //     console.log('cat');
    //     // Meteor.call("fetchTasks");
    //   }
    // });

    console.log('app starting at ' + Date());
    console.log('yes... i love homework.')
    process.env.MAIL_URL = 'smtp://postmaster@sandboxf116af3c6a2a4f0da3ef34a871b0ee0d.mailgun.org:a42fc913e66edab1d82dc07ceb16a047@smtp.mailgun.org:587';

    Sortable.collections = tasks;

    // SyncedCron.start();
  });

  Meteor.publish("tasks", function (createdBy) {
    return tasks.find({createdBy: createdBy}, {sort: {score: -1, name: 1}});
  });
}

Meteor.methods({
  addTask: function (name, due, course, details, currentUserId) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    tasks.insert({
      name: name,
      due: due,
      course: course,
      details: details,
      createdBy: currentUserId
    });
  },
  sendEmail: function(name, due, course, details, currentUserId) {
      Email.send({to:Meteor.user().emails[0].address, from:'no-reply@homework.naauao.com', subject:'New Task!', text:'A new task was created! \"' + name + '\" is due on: ' + due + '.  ' + '\n\nHappy working.'});
      console.log('email sent.');
  },
  deleteTask: function (taskID) {
    tasks.remove(taskID);
    console.log('deleted task');
  },
  printUser: function () {
    console.log(Meteor.user().emails[0].address);
  },
  fetchTasks: function () {
    return tasks.find({}, {sort: {due: 1, score: -1, name: 1}});
  }
});
