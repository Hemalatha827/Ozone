const GLOBAL_VARS = require('../GLOBAL_VARS.json');
const zinc = require("../connections/zincConnector");

exports.getElasticCustomAggsDataWithCriteria = function (searchData, aggField, index) {
    const query = queryBuilder(searchData);

    const payload = {
        "size": 0,
        "query": query,
        "aggs": aggField
    };

    const response = zinc.zincSelect(payload, index);

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
};

exports.getElasticAggsDataWithCriteria = function (searchData, aggField, index) {
    const query = queryBuilder(searchData);

    const payload = {
        "from": 0,
        "size": 0,
        "query": query,
        "aggs": {
            "text": {
                "terms": {
                    "field": aggField
                }
            }
        }
    };

    const response = zinc.zincSelect(payload, index);

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
};

exports.getElasticAggsData = async function (aggField, index) {
    var payload = {
        "from": 0,
        "size": 0,
        "aggs": {
            "text": {
                "terms": {
                    "field": aggField
                }
            }
        }
    };

    const response = await zinc.zincSelect(payload, index);

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
};

exports.insertIntoZs = function (data, index, docId) {
    return zinc.zincUpdate(data, index, docId)

}


exports.removeDocFromZs = function (index, docId) {
    return zinc.zincRemove(index, docId)
}


exports.getElasticData = function (start, size, searchData, index, fetchFields,sortFields ,searchType ='MUST') {


    const query = queryBuilder(searchData, searchType);

    if (fetchFields === undefined || fetchFields === null) {
        fetchFields = [];
    }


    if (sortFields === undefined || sortFields === null) {
        sortFields = ["id"];
    } else {
        sortFields.push("id");
    }

    var payload = {
        "from": start,
        "size": size,
        "query": query,
        "_source": fetchFields,
        "sort": sortFields
    };

    

    return zinc.zincSelect(payload, index);
};


exports.getOzoneElasticData = function(start, size, index, country, course, studyLevel, university) {

    let queryData = [];
    if (country) {
      queryData.push({
        "match": {
          "country": country
        }
      });
    }
  
    if (university) {
      queryData.push({
        "term": {
          "university.keyword": university
        }
      });
    }
  
    if (course) {
      queryData.push({
        "bool": {
          "should": [
            {
              "match": {
                "course-name": course
              }
            },
            {
              "fuzzy": {
                "course-name": course
              }
            },
            {
              "wildcard": {
                "course-name": "*" + course + "*"
              }
            }
          ]
        }
      });
    }
  
    if (studyLevel) {
      queryData.push({
        "bool": {
          "should": [
            {
              "term": {
                "study-level.keyword": studyLevel
              }
            }
          ]
        }
      });
    }
  
    if (queryData.length) {
      queryData = {
        "bool": {
          "must": queryData
        }
      };
    } else {
      //if user skipped all options, then show all records we have
      queryData = {
        "match_all": {}
      };
    }
  
    var payload = {
      "from": start,
      "size": size,
      "query": queryData
    };
  
    return zinc.zincSelect(payload, index);
  }
  
  

      



function queryBuilder(searchData, searchType) {
    var searchCriteria = [];
    var query = {
        "bool": {
            [searchType]: searchCriteria
        }
    };

    for (const e of searchData) {
        const filter = e["query"];
        const filterType = e["type"];
        const filterValue = e["value"];
        if (filterValue) {
            searchCriteria.push(buildSubQuery(filter, filterType, filterValue));
        }
    }

    if (searchCriteria.length == 0) {
        var query = {
            "match_all": {}
        }
    }

    return query;
}

function buildSubQuery(filter, filterType, filterValue) {
    var subQuery;
    var rValue;

    if (filterType == 'range') {
        //Re-map the range values
        const sheet = SpreadsheetApp.getActive().getSheetByName(filter);
        const sheetData = sheet.getDataRange().getValues();

        var filterRange = getValueBasedOnAnotherColumn(sheetData, "Options", filterValue);
        const filterVal1 = filterRange['Lower bound'];
        const filterVal2 = filterRange['Lower bound'];

        if (filterVal2 === '-') {
            rValue = {
                "gte": filterVal1
            };
        } else if (filterVal1 === '-') {
            rValue = {
                "lte": filterVal2
            };
        } else {
            rValue = {
                "gte": filterVal1,
                "lte": filterVal2
            };
        }
        subQuery = {
            [filter]: rValue
        }
    } else if (filterType == 'term') {
        filter = filter + ".keyword";
        subQuery = {
            [filter]: filterValue
        }
    } else if (filterType == 'match' || filterType == 'match_phrase') {
        subQuery = {
            [filter]: filterValue
        }
    } else if (filterType == 'fuzzy') {
        subQuery = {
            [filter]: filterValue.toLowerCase()
        }
    }

    return {
        [filterType]: subQuery
    };
}

