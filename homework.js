tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

  Template.todo.helpers({
  	tasks: function () {
  		return tasks.find({}, { sort: { name : 1 }});
  	}
  })

  Template.task.helpers({
    selected: function () {
      return Session.equals("selected", this._id) ? "selected" : '';
    }
  });

  Template.task.events({
    'click': function () {
      Session.set("selected", this._id);
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
 
      // Insert a task into the collection
      tasks.insert({
        name: name,
        due: due,
        course: course,
        details: details
      });
 
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