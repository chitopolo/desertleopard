/**
 * Create Session Variables
 */

Session.setDefault('colPosition', 0);
Session.setDefault('rowPosition', 0);


/**
 * UI Body Event Listeners
 */
var uiBodyEvents = Tracker.autorun(function() {
  UI.body.events({
    'keydown': function(evt) {
      var slide;
      var markDown;
      // Right Arrow Pressed
      if(evt.shiftKey && evt.which === 39 && Session.get('colPosition') < (Meteor.getColumnsCount() - 1)) {
        // Get Markdown
        markDown = $('.markDownText').val();
        
        saveSlide(Session.get('rowPosition'), Session.get('colPosition'), markDown, function(err, data) {
          if(err) { console.log(err); }

          slide = Meteor.moveRight();
          setLiveMarkdown(slide);
          $('.slide').addClass('animated bounceInRight');
          Meteor.setTimeout(function() {
            $('.slide').removeClass('animated bounceInRight');
          }, 500);

          $('.markDownText').val(slide);
        });

      }
      // Left Arrow Pressed
      else if(evt.shiftKey && evt.which === 37 && Session.get('colPosition') > 0) {
        // Get Markdown
        markDown = $('.markDownText').val();

        saveSlide(Session.get('rowPosition'), Session.get('colPosition'), markDown, function(err, data) {
          if(err) { console.log(err); }

          slide = Meteor.moveLeft();
          setLiveMarkdown(slide);
          $('.slide').addClass('animated bounceInLeft');
          Meteor.setTimeout(function() {
            $('.slide').removeClass('animated bounceInLeft');
          }, 500);

          $('.markDownText').val(slide);
        });
      }
      // Down Arrow Pressed
      else if(evt.shiftKey && evt.which === 40 && Session.get('rowPosition') < Meteor.getRowsCount() - 1){
        // Get Markdown
        markDown = $('.markDownText').val();

        saveSlide(Session.get('rowPosition'), Session.get('colPosition'), markDown, function(err, data) {
          if(err) { console.log(err); }

          slide = Meteor.moveDown();
          setLiveMarkdown(slide);          
          $('.slide').addClass('animated bounceInUp');
          Meteor.setTimeout(function() {
            $('.slide').removeClass('animated bounceInUp');
          }, 500);
          
          $('.markDownText').val(slide);
        });
      }
      // Up Arrow Pressed
      else if(evt.shiftKey && evt.which === 38 && Session.get('rowPosition') > 0){
        // Get Markdown
        markDown = $('.markDownText').val();

        saveSlide(Session.get('rowPosition'), Session.get('colPosition'), markDown, function(err, data) {
          if(err) { console.log(err); }

          slide = Meteor.moveUp();
          setLiveMarkdown(slide);          
          $('.slide').addClass('animated bounceInDown');
          Meteor.setTimeout(function() {
            $('.slide').removeClass('animated bounceInDown');
          }, 500);

          $('.markDownText').val(slide);
        });

      }
    }
  });
  
});

/**
 * Markdown Form Helpers
 */

Template.createPresentation.helpers({
  colPosition: function() {
    return Session.get('colPosition') + 1;
  },
  rowPosition: function() {
    return Session.get('rowPosition') + 1;
  },
  markDown: function() {
    return Meteor.getSlideText(Session.get('rowPosition'), Session.get('colPosition'), false);
  },
  liveMarkDown: function() {
    return getLiveMarkdown();
  }
});


Template.createPresentation.events({
  'click .createBtn': function(evt, template) {
    evt.preventDefault();
    // PUBLISH | Store Last Slide
    var markDown = $('.markDownText').val();

    saveSlide(Session.get('rowPosition'), Session.get('colPosition'), markDown);

    // Route to Presentation View
    Router.go('/list');
    setLiveMarkdown('');
    // Reset Default Positions on PUBLISH
    Session.set('colPosition', 0);
    Session.set('rowPosition', 0);
  },

  'click .newColumn': function(evt, template) {
    evt.preventDefault();
    var markDownText = template.find('.markDownText').value;
    var columnId;

    // Saving Current Slide
    saveSlide(Session.get('rowPosition'), Session.get('colPosition'), markDownText);
    setLiveMarkdown(evt.target.value);
    Meteor.call('insertSlideColumns', {'columnTitle': 'TEST', 'slides': [''], 'lastIndex': 0}, function(err, data) {
      if(err) {  console.log(err); }
      columnId = data;

      // Updates Current Slide.slides with New Column
      Meteor.call('updateSlideDeck', Session.get('currentSlideDeck'), {$push: {'columnIds': columnId}}, function(err, data) {
        if(err) { console.log(err); }

        // Increments colPosition
        Session.set('colPosition', Meteor.getColumnsCount() - 1);
        Session.set('rowPosition', 0);
        
      });
    });

    template.find('.markDownText').value = '';
  },

  'click .newRow': function(evt, template) {
    evt.preventDefault();
    var markDownText = template.find('.markDownText').value;

    // Updates current slide at current coordinates
    saveSlide(Session.get('rowPosition'), Session.get('colPosition'), markDownText);
    // Increments rowPosition
    Session.set('rowPosition', (Session.get('rowPosition') + 1));

    // Creates empty string for new row
    saveSlide(Session.get('rowPosition'), Session.get('colPosition'), '');

    // Increments lastIndex position
    Meteor.updateLastIndex(Session.get('rowPosition'), Session.get('colPosition'));

    setLiveMarkdown(evt.target.value);
    // Clear textarea
    template.find('.markDownText').value = '';
  },

  'keyup input.slideTitle': function(evt, template) {
    if(evt.which === 13) {
      return false;
    }
    var slideTitle = $('.slideTitle').val();
    Meteor.call('updateSlideDeck', Session.get('currentSlideDeck'), {$set: {'presentationTitle': slideTitle}});
  },

  'keyup .markDownText': function(evt, template) {
    setLiveMarkdown(evt.target.value);
  }
  
});

/**
 * Helper Functions
 */

function saveSlide(row, column, text, callback) {
  var slidesMarkdown = {};
  var slideDeckObj = SlideDecks.findOne({_id: Session.get('currentSlideDeck')});
  var columnId = slideDeckObj.columnIds[column];
  
  slidesMarkdown['slides.' + row] = text;
  Meteor.call('updateSlideColumn', columnId, {$set: slidesMarkdown}, callback);
}

var markDownDep = new Tracker.Dependency;

function getLiveMarkdown() {
  markDownDep.depend();
  return Session.get('liveMarkdown');
}

function setLiveMarkdown(rawMD) {
  Session.set('liveMarkdown', rawMD);
  markDownDep.changed();
}











