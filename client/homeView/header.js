//   activeRouteClass: function(/* route names */) {
//     var args = Array.prototype.slice.call(arguments, 0);
//     args.pop();
    
//     var active = _.any(args, function(name) {
//       return Router.current() && Router.current().route.getName() === name
//     });
    
//     return active && 'active';
//   }
// });

Template.header.events({
  'click #logout': function(){
    if(Meteor.user){
      Meteor.logout();
    }
  }
});
