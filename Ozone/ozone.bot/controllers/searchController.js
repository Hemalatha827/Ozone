const GLOBAL = require('../GLOBAL_VARS.json');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const utilitieFunc = require('../utilities/utilitieFunc');
const searchUniversityService = require('../service/search/searchUniversityService');
const searchWhatsappGalleryService = require('../service/search/searchWhatsappGalleryService');


exports.searchUniversity = async (req, res) => {

   var  postData =req.body;

  var PAGE_START = Number(postData.start);

  const studyLevel = await utilitieFunc.mapWords(postData["study-level"]);

  const elasticData = await queryBuilderUtils.getOzoneElasticData(PAGE_START, GLOBAL.SEARCH.MAX_MESSENGER_PAGE_SIZE, GLOBAL.SERVER.ZS_COURSE_INDEX, utilitieFunc.safeToLower(postData["country"]),utilitieFunc.safeToLower(postData["course"]), studyLevel, "");

  const data = elasticData.hits.hits;
  let dataTotalCount = Number(elasticData.hits.total.value);

  let message = searchUniversityService.dynamicSearchMessage(data, PAGE_START, dataTotalCount);

  let dynamicContent = {
    "messages": message
  };

    res.json(dynamicContent);
};


exports.searchWhatsapp =async (req,res)=>{

  var postData =req.body;

   
  var PAGE_START = Number(postData.start);

  const studyLevel = await utilitieFunc.mapWords(postData["study-level"]);
  const elasticData = await queryBuilderUtils.getOzoneElasticData(PAGE_START, GLOBAL.SEARCH.MAX_WHATSAPP_PAGE_SIZE, GLOBAL.SERVER.ZS_COURSE_INDEX, utilitieFunc.safeToLower(postData["country"]), utilitieFunc.safeToLower(postData["course"]), studyLevel, postData["university"]);

  const data = elasticData.hits.hits;
  let dataTotalCount = Number(elasticData.hits.total.value);
  const messages = [];
  let actions = [];
  
  try {
    if (dataTotalCount > 0) {
      const templateData = searchWhatsappGalleryService.createSearchWhatsAppGallery(data, postData["user-id"]);
      //console.log(JSON.stringify(templateData));

   
      messages.push(templateData);

      const coursesFound = dataTotalCount - (PAGE_START + GLOBAL.SEARCH.MAX_WHATSAPP_PAGE_SIZE);

      actions = utilitieFunc.createCUFActions(
        [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_whatsapp_msg_status", "accepted"],
        [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_is_nextpage_available", dataTotalCount > (PAGE_START + GLOBAL.SEARCH.MAX_WHATSAPP_PAGE_SIZE)],
        [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "course_count", coursesFound]
      );
    } else {
      actions = utilitieFunc.createCUFActions(
        [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_whatsapp_msg_status", "no-data-found"],
        [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_is_nextpage_available", false]
      );

    }
  } catch (e) {
    actions = utilitieFunc.createCUFActions(
      [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_whatsapp_msg_status", "error"],
      [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "ozone_is_nextpage_available", false]
    );
  }

  let dynamicContent ={
    "messages": messages,
    "actions": actions
  };

 res.json(dynamicContent);

};