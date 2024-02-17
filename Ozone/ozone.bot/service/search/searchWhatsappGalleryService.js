const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');

module.exports ={

createSearchWhatsAppGallery: function(data, userId) {
    var cards = [];
  
    data.forEach((item, index) => {
  
      var card = {
        "card_index": index,
        "components": [
          {
            "type": "HEADER",
            "parameters": [
              {
                "type": "IMAGE",
                "image": {
                  "link": item._source["flag"]
                }
              }
            ]
          },
          {
            "type": "BODY",
            "parameters": [
              {
                "type": "TEXT",
                "text": utils.truncateString(item._source["university"].trim(), 45)
              },
              {
                "type": "TEXT",
                "text": utils.truncateString(item._source["course-name"].trim(), 70)
              }
            ]
          },
          {
            "type": "BUTTON",
            "sub_type": "QUICK_REPLY",
            "index": "0",
            "parameters": [
              {
                "type": "PAYLOAD",
                "payload": JSON.stringify({
                  "actions": utils.createCUFActions(
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_univ_name", item._source["university"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_univ_country", item._source["country"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_course_name", item._source["course-name"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_graduation", item._source["study-level"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_grad_duration", item._source["duration"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_grad_intake", item._source["intakes"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_ielts", item._source["ielts-score"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_toefl", item._source["toefl-score"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_grad_fee", item._source["tuition-fee"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_univ_website", item._source["website-url"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1698482616545"]
                  )
                })
  
              }
            ]
          },
          {
            "type": "BUTTON",
            "sub_type": "QUICK_REPLY",
            "index": "1",
            "parameters": [
              {
                "type": "PAYLOAD",
                "payload": JSON.stringify({
                  "actions": utils.createCUFActions(
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_user_interested_country", item._source["country"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_user_interested_course", item._source["course-name"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1698341289035"]
                  )
                })
  
              }
            ]
          }
        ]
      };
  
      cards.push(card);
    });
  
    if (cards) {
      return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": userId,
        "type": "template",
        "template": {
          "name": "univ_2btn_" + cards.length + "cards",
          "language": {
            "code": "en_GB"
          },
          "components": [
            {
              "type": "CAROUSEL",
              "cards": cards
            }]
        }
      };
    } else {
      return {};
    }
  
  
  }
  
  


}