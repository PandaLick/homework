tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  var currentUserId = Meteor.userId();
  Meteor.subscribe('tasks', currentUserId);

  Template.todo.helpers({
  	tasks: function () {
      return tasks.find({}, { sort: { due: 1 } });
  	}
  })

  Template.task.helpers({
    selected: function () {
      var allTasks = this._id;
      var selectedTask = Session.get("selected");
      if(allTasks == selectedTask){
          return "selected"
      }
    }
  });

  Template.task.events({
    'click': function () {
      var taskID = this._id;
      Session.set("selected", taskID);
    },

    'click .delete': function () {
      var taskID = this._id;
      Meteor.call("deleteTask", taskID);
    }
  });

  Template.body.events({
    "submit .taskInput": function (event) {
      event.preventDefault();

      var name = event.target.name.value;
      var due = event.target.due.value;
      var course = event.target.course.value;
      var details = event.target.details.value;
      var currentUserId = Meteor.userId();
 
      Meteor.call("addTask", name, due, course, details, currentUserId);
      // Meteor.call("sendEmail", name, due, course, details, currentUserId);
      
      event.target.name.value = "";
      event.target.due.value = "";
      event.target.course.value = "";
      event.target.details.value = "";

    }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function () {
    console.log('on');
    process.env.MAIL_URL = 'smtp://postmaster@sandboxf116af3c6a2a4f0da3ef34a871b0ee0d.mailgun.org:a42fc913e66edab1d82dc07ceb16a047@smtp.mailgun.org:587';
    // Sortable.collections = tasks;
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

    console.log('task created');
  },
  sendEmail: function(name, due, course, details, currentUserId) {
      // Email.send({to:Meteor.user().emails[0].address, from:'no-reply@homework.naauao.com', subject:'New Task!', text:'A new task was created! \"' + name + '\" is due on: ' + due + '.  ' + '\n\nHappy working.'});
      // console.log('email sent.');
  },
  deleteTask: function (taskID) {
    tasks.remove(taskID);
    console.log('deleted task');
  }
});
