tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  var currentUserId = Meteor.userId();
  Meteor.subscribe('tasks', currentUserId);

  Template.todo.helpers({
  	tasks: function () {
      // upon switching accounts, tasks do not auto populate
      var currentUserId = Meteor.userId();
  		return tasks.find({}, {sort: {score: -1, name: 1}});
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
      var taskID = this._id
      Session.set("selected", taskID);
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
 
      // Clear form
      event.target.name.value = "";
      event.target.due.value = "";
      event.target.course.value = "";
      event.target.details.value = "";
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    console.log('yes... i love homework.')
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
  deleteTask: function (taskID) {
    tasks.remove(taskID);

  }
});
