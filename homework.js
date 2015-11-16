tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

  Template.todo.helpers({
  	tasks: function () {
      var currentUserId = Meteor.userId();
  		return tasks.find({createdBy: currentUserId}, {sort: {score: -1, name: 1}});
  	}
  })

  Template.task.helpers({
    selected: function () {
      var taskID = this._id;
      var selectedTask = Session.get('selectedTask');
      if(taskID == selectedTask){
          return "selected"
      }
    }
  });

  Template.task.events({
    'click': function () {
      var taskID = this._id;
      Meteor.call("isSelected", taskID);
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
  },
  isSelected: function (taskID) {
    Session.set("selectedTask", taskID);
  }
});
