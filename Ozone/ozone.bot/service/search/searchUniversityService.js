const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');

module.exports = {
    dynamicSearchMessage: function (data, start, dataTotalCount) {

      var messages = [];
      var end = (dataTotalCount - start > GLOBAL.SEARCH.MAX_MESSENGER_PAGE_SIZE) ? start + GLOBAL.SEARCH.MAX_MESSENGER_PAGE_SIZE : start + (dataTotalCount - start);
    
    
      //Information count
      if (dataTotalCount > 0) {
        messages.push({
          "message": {
            "text": (start + 1) + "-" + end + " of " + dataTotalCount + " University Courses👇"
          }
        });
    
        //Create properties card
        messages.push({
          "message": {
            "attachment": {
              "payload": {
                "elements": createSearchGallery(data, start, dataTotalCount),
                "template_type": "generic"
              },
              "type": "template"
            }
          }
        });
      } else {
        messages.push({
          "message": {
            "text": "Sorry! Nothing found. Please refine your search."
          }
        });
      }
    
      //Send followup message
      messages.push({
        "message": {
          "text": "Here are some choices for you🌍✈️📚",
          "quick_replies": createSearchQuickReplies()
        }
      });
    
    
      return messages;
    }
};

// Define the createSearchGallery function

function createSearchGallery(data, start, dataTotalCount) {
  var cards = [];

  data.forEach((item) => {
    var buttons = [];

    buttons.push({
      "title": "📋Course Details",
      "type": "postback",
      "payload": JSON.stringify({
        "actions": utils.createCUFActions(
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_course_id", item._source["id"]],
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1698482616545"]
        )
      })
    });


    buttons.push({
      "title": "🙌Send Enquiry",
      "type": "postback",
      "payload": JSON.stringify({
        "actions": utils.createCUFActions(
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_user_interested_country", item._source["country"]],
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_user_interested_course", item._source["course-name"]],
          [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1699804063679"]
        )
      })
    });


    var card = {
      "title": "🏛️" + item._source["university"].trim(),
      "subtitle": "📚" + item._source["course-name"].trim() + "\n🎓" + item._source["study-level"].trim(),
      "image_url": item._source["flag"],
      "buttons": buttons
    };

    cards.push(card);
  });

  //Last card as pagination
  if (dataTotalCount > (start + GLOBAL.SEARCH.MAX_MESSENGER_PAGE_SIZE)) {

    var card = {
      "title": "Tap for more👇",
      "image_url": GLOBAL.FLOW.NEXT_PAGE_CARDS.IMAGE,
      "buttons": [{
        "title": GLOBAL.FLOW.NEXT_PAGE_CARDS.TEXT,
        "type": "postback",
        "payload": JSON.stringify({
          "actions": [
            {
              "action": "set_field_value",
              "field_name": "card_search_index",
              "value": start + GLOBAL.SEARCH.MAX_MESSENGER_PAGE_SIZE
            }, {
              "action": "send_flow",
              "flow_id": GLOBAL.FLOW.NEXT_PAGE_CARDS.FLOW_ID //add to cart flow
            }
          ]
        })
      }]
    };

    cards.push(card);
  }



  return cards;

}




function createSearchQuickReplies() {
  var quickReplies = [];

  quickReplies.push({
    "content_type": "text",
    "title": GLOBAL.FLOW.QUICK_SEARCH.TEXT,
    "payload": JSON.stringify({
      "actions": [{
        "action": "send_flow",
        "flow_id": GLOBAL.FLOW.QUICK_SEARCH.FLOW_ID//Calling Search
      }]
    })
  });

  quickReplies.push({
    "content_type": "text",
    "title": "💭Get in Touch",
    "payload": JSON.stringify({
      "actions": [{
        "action": "send_flow",
        "flow_id": "1699804063679"//Calling Search
      }]
    })
  });

  quickReplies.push({
    "content_type": "text",
    "title": "🗣️Language Training",
    "payload": JSON.stringify({
      "actions": [{
        "action": "send_flow",
        "flow_id": "1699805616726"//language training
      }]
    })
  });

  return quickReplies;
}
