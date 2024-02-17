const CryptoJS = require('crypto-js');
const { parse } = require('date-fns');
const GLOBAL = require('../GLOBAL_VARS.json');

module.exports = {
    createCUFActions(...data) {

        const actions = [];

        for (const currentValue of data) {
            const operation = currentValue[0];
            if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW,
                    "flow_id": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG,
                    "tag_name": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_TAG) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_TAG,
                    "tag_name": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF,
                    "field_name": currentValue[1],
                    "value": currentValue[2]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF,
                    "field_name": currentValue[1]
                });
            }

        }
        return actions;
    },

    createButtonOrQuickReply(type, displayTxt, ...data) {
        const actions = this.createCUFActions(...data);
        let buttonOrquickReply = {
            "title": displayTxt,
            "payload": JSON.stringify({ "actions": actions })
        };

        if (type == "button") {
            buttonOrquickReply.type = "postback";
        } else {
            buttonOrquickReply.content_type = "text";
        }

        return buttonOrquickReply;
    },


    /**
    * @param {string} title
    * @param {number} flowId
    * @param {string[]} arg
    */
    setFlowIdAndCufInQuickReply(title, flowId, ...arg) {
        let actions = [];
        arg.forEach(function (currentValue) {
            actions.push({
                "action": "set_field_value",
                "field_name": currentValue[0],
                "value": currentValue[1]
            });
        });

        actions.push(
            {
                "action": "send_flow",
                "flow_id": flowId //same flow called again just by updating the pageIndex
            }
        );

        var quickReplies = JSON.stringify({
            "actions": actions
        });

        var quickReply = {
            "content_type": "text",
            "title": title,
            "payload": quickReplies
        };
        return quickReply;
    },


    /**
    * @param {string} title
    * @param {number} flowId
    * @param {string[]} arg
    */
    setFlowIdAndTagInButtons(title, flowId, ...arg) {
        let actions = [];
        arg.forEach(function (currentValue) {
            actions.push({
                "action": currentValue[0] == "add" ? "add_tag" : "remove_tag",
                "tag_name": currentValue[1]
            });
        });

        actions.push(
            {
                "action": "send_flow",
                "flow_id": flowId //same flow called again just by updating the pageIndex
            }
        );

        var buttton = {
            "type": "postback",
            "title": title,
            "payload": JSON.stringify({ "actions": actions })
        };
        return buttton;
    },


    getRowNumByCellValue(values, searchValue) {

        for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
            const row = values[rowIndex];
            const columnIndex = row.indexOf(searchValue);
            if (columnIndex !== -1) {
                const rowNum = rowIndex + 1; // Adding 1 because row index is 0-based, but row numbers are 1-based in Sheets
                return rowNum; // If you want to use this value further, you can return it from the function
            }
        }

        Logger.log(`'${searchValue}' not found in the sheet.`);
        return null; // If the value is not found, you can return null or any other value indicating that it's not present in the sheet.
    },

    getValueBasedOnAnotherColumn(data, searchColumn, searchValue) {
        let targetValue;
        const header = data[1];

        // Iterate over the rows and find the matching value in the search column
        for (let i = 2; i < data.length; i++) {
            if (String(data[i][header.indexOf(searchColumn)]) == String(searchValue)) {
                targetValue = data[i];
                break;
            }
        }

        var targetData = {};
        if (targetValue != null)
            targetValue.forEach((element, index) => {
                targetData[header[index]] = element;
            });

        return targetData;
    },

    getRangeBasedOnValue(data, searchValue, searchType) {

        // Iterate over the rows and find the matching value in the search column
        for (let i = 2; i < data.length; i++) {
            const lowerBound = data[i][1];
            const upperBound = data[i][2];
            const type = data[i][3];

            if (type === searchType) {
                if (lowerBound !== '-' && upperBound !== '-') {
                    if (searchValue >= lowerBound && searchValue <= upperBound) {
                        return data[i][0];
                    }
                } else if (lowerBound === '-') {
                    if (searchValue <= upperBound) {
                        return data[i][0];
                    }
                } else if (upperBound === '-') {
                    if (searchValue >= lowerBound) {
                        return data[i][0];
                    }
                }
            }
        }

    },



    mapWords(inputProgram) {
        const wordMapping = {
          "Foundation": "Foundation",
          "High School(11,12)": "High School (11th-12th)",
          "Short Term Programs": "Short Term Programs",
          "PG Diploma": "PG Diploma/Certificate",
          "UG Diploma": "UG Diploma/Certificate/Associate Degree",
          "Undergraduate(UG)": "Undergraduate",
          "Postgraduate(PG)": "Postgraduate",
          "UG+PG(Accelerated)": "UG+PG (Accelerated) Degree",
          "PhD": "PhD"
        };
      
        // Check if the input program exists in the mapping
        const mappedProgram = wordMapping[inputProgram] || '';
      
        // Return the result
        return mappedProgram;
      },


      
    truncateString(str, maxLength) {
    str = str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
    return str;
  },
      

    generateUniqueSixDigitID() {
        const timestamp = Date.now().toString(); // Get the current timestamp
        const randomPart = Math.floor(Math.random() * 900000) + 100000; // Random 6-digit number
        const uniqueID = timestamp.slice(-6) + randomPart.toString();
        return uniqueID.slice(0, 6); // Ensure it's exactly 6 digits long
    },

     getCurrentDateInDDMMYYYY() {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
      
        return `${day}.${month}.${year}`;
      },

    getUnixTimestampExpiryFromNow(expiryInMins) {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + expiryInMins * 60 * 1000); // Adding 1 hour in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },

    getUnixTimestamp30MinutesFromNow() {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 30 * 60 * 1000); // Adding 30 minutes in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },

    getUnixTimestamp1HourFromNow() {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // Adding 1 hour in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },


     getNext5Months() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = new Date().getMonth(); // Get the current month (0 - January, 1 - February, etc.)
        const next5Months = [];
      
        for (let i = 0; i <= 4; i++) {
          const nextMonthIndex = (currentMonth + i) % 12;
          next5Months.push(months[nextMonthIndex]);
        }
      
        return next5Months;
      },
    
   safeToLower(value) {
    return (value && typeof value === 'string') ? value.toLowerCase() : value;
  },

  
   removeEmojis(inputString) {
    return inputString.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FABF}\u{2B50}\u{23F3}\u{1F004}-\u{1F0CF}\u{1F170}-\u{1F251}\u{2B05}\u{2194}\u{25AA}\u{2B05}\u{2194}\u{25AA}\u{FE0F}\u{203C}\u{2049}\u{2122}\u{2031}\u{2757}\u{2048}\u{2047}\u{2764}\u{FE0F}\u{27A1}]/ug, '');
  },


   removeCommas(inputString) {
    return inputString.replace(/,/g, ''); // The 'g' flag ensures global replacement for all occurrences of commas.
  },

   removeSplCharsFromString(inputText) {

    // Define the words to be removed
    let wordsToRemove = ["Double", "and", "Advanced", "Studies", "Extension", "Majoring", "Secondary", "with", "multi", "Double", "Academic", "Acute", "Adaptive", "Addiction", "Additive", "Based", "Basic", "Bchelor", "Associate", "Cities", "City", "Certifciate", "Course", "Continuing", "Diploma", "Bachelor", "Full", "Great", "Indian", "Info", "MASTER", "Masters", "Pre", "Top", "The", "Set", "abc", "Work", "major", "specialist", "international", "graduate", "month", "not", "program", "specialising", "unendorsed", "unsure", "credits", "Zealand", "Warwick", "Wastewater", "West", "Unit", "Tool", "Regular", "Pen", "Personal", "Offered", "Office", "Only", "Optional", "Non", "Needs", "Practical", "Practice", "Preparation", "Program", "Project", "Heavy", "High", "Dual", "Cat", "Category", "Change", "minor", "office", "option", "based", "YEARS", "all", "One", "Not", "Part", "the", "track", "work", "year", "sure", "pre", "With", "Year", "York", "Young", "Sri", "Master", "MSc", "Level", "Levels", "HONS", "For", "without", "years", "through", "for", "Type", "Option", "Other", "New", "Mode", "with", "entry", "graduates", "Certificates", "Careers", "State", "Multi", "Inclusion", "Built", "Two", "ACCA", "AWARD", "Accessory", "Account", "Action", "Activity", "Adaption", "Advance", "Advisory", "Aerial", "Agent", "Air", "Animal", "Antarctic", "Application", "Arabic", "Arbitration", "Asset", "Assistance", "Assistant", "Assistive", "Assurance", "Attendant", "Australia", "Available", "Awarded", "BAIS", "BIOL", "Bangladesh", "Bangor", "Beckett", "Behavioral", "Behaviour", "Being", "Berlin", "Beverage", "Big", "Birmingham", "Body", "Books", "Border", "Borders", "Brand", "Brewery", "Broadcast", "Broadcasting", "Buffalo", "Buying", "CEFAM", "CHILDHOOD", "CNC", "Cabin", "Car", "Cardiff", "Care", "Casino", "Casuality", "Catholic", "Centre", "Chain", "Chicago", "Child", "Children", "Church", "Cinema", "Circular", "Citizen", "Citizenship", "Classics", "Climate", "Clothing", "Cloud", "Coach", "Collaboration", "Collaborative", "Combined", "Command", "Community", "Comparative", "Compliance", "Compressed", "Concentrations", "Concordia", "Concurrent", "Conditioning", "Conflicts", "Conservation", "Content", "Control", "Controls", "Coordinator", "Corporate", "Costume", "Countermeasures", "Courses", "Cowan", "Creation", "Critical", "Crop", "Cultural", "Cultures", "Dalhousie", "Decision", "Decisions", "Destination", "Detailing", "Dev", "Device", "Diesel", "Dimension", "Dimensions", "Direct", "Direction", "Diseases", "Dispute", "Distance", "Distribution", "Diversional", "Diversity", "Dortmund", "Driven", "EARLY", "Ecole", "Ecosystem", "Edinburgh", "Educators", "Effects", "Efficient", "Elementary", "Elements", "Elite", "Emergency", "Emerging", "Emphasizing", "Employment", "Energies", "Energy", "Eng", "Engine", "Enhanced", "Entertainment", "Entrance", "Equality", "Equipment", "Ethical", "Ethics", "Europe", "Evening", "Events", "Executive", "Exegesis", "Exercise", "Exhibition", "Experience", "Expertise", "Exporting", "Extended", "FCA", "Fabrication", "Family", "Fasion", "Fast", "Festivals", "Filmmaking", "Fine", "First", "Fitness", "Flexible", "Focus", "Football", "Footwear", "Foundations", "France", "Frankfurt", "French", "Game", "Games", "Gas", "Gender", "George", "Global", "Globalisation", "Goods", "Grande", "Green", "Greenhouse", "Group", "Growth", "Guest", "Guidance", "HUMAN", "Hacking", "Heating", "Hertfordshire", "Highways", "Holloway", "Home", "Homes", "Husbandry", "Identities", "Identity", "Illness", "Illustration", "Immersion", "Import", "Importing", "Including", "Indigenous", "Individual", "Individualized", "Industry", "Influence", "Inner", "Innovation", "Innsbruck", "Institute", "Institutional", "Institutions", "Instrument", "Insurance", "Integrated", "Intellectual", "Interaction", "Interactive", "Interdisciplinary", "Interface", "Internation", "Internationally", "Internationbal", "Internet", "Internship", "Interprofessional", "Intractive", "Investigation", "Investigations", "Investing", "Investment", "Investments", "Irrelevent", "Islamic", "Island", "Issues", "Italian", "Jazz", "Jewellery", "John", "Joint", "Justice", "Keyce", "Kingdom", "Labs", "Lahti", "Land", "Languages", "Lanka", "Lateral", "Leaders", "Leadership", "Leading", "Lean", "Learning", "Leeds", "Leicester", "Leisure", "Liberal", "Licence", "License", "Light", "Literary", "Living", "Local", "Lodging", "Logic", "London", "Luxury", "MASS", "MICE", "Maintenance", "Maker", "Making", "Managemen", "Mandarin", "Margaret", "Market", "Markets", "Mary", "Masterclass", "Material", "Materials", "Matropolitan", "Mediterranean", "Menswear", "Mental", "Migration", "Millwright", "Mind", "Mineral", "Minors", "Mixed", "Mobile", "Mobility", "Modeling", "Money", "Montfort", "Moores", "Motion", "Motive", "Multidisciplinary", "Munich", "Murdoch", "Museum", "Music", "Musical", "Napier", "National", "Nations", "Native", "Natural", "Nature", "Negotiation", "Nepal", "Newcastle", "Nonprofit", "North", "Nurses", "Ocean", "Ontario", "Operation", "Operational", "Operations", "Organisational", "Organisations", "Organization", "Organizational", "Outdoor", "Ownership", "PGCertHE", "PPL", "PPLE", "PROFESSIONAL", "Paris", "Parks", "Particle", "Partnered", "Path", "Pathway", "Patient", "Peace", "People", "Performance", "Performing", "Piracy", "Playwriting", "Policing", "Policy", "Political", "Popular", "Population", "Portsmouth", "Post", "Power", "Practices", "Practicum", "Precision", "Preschool", "Privacy", "Private", "Processes", "Product", "Production", "Products", "Profit", "Promotion", "Property", "Propogation", "Protection", "Purposes", "QUANTITY", "Qualifying", "Quality", "Quantitative", "Quantity", "Queen", "RELATIONS", "RESOURCE", "Ranching", "Real", "Recovery", "Refinishing", "Refrigeration", "Regional", "Regulatory", "Relation", "Relations", "Religion", "Religious", "Remotely", "Renaissance", "Renewable", "Repair", "Reporting", "Resilience", "Resolution", "Resort", "Resource", "Resources", "Resourse", "Responsibility", "Restoration", "Retail", "Rhetoric", "Rights", "Risk", "Risks", "Robotised", "Roman", "Rural", "SAFETY", "SECURITY", "SIAST", "SURVEYING", "Safety", "Sales", "School", "ScienceWith", "Sciences", "Scotland", "Screen", "Secure", "Security", "Semester", "Senior", "Sensing", "Serious", "Service", "Shipping", "Signal", "Simulation", "Singapore", "Single", "Site", "Six", "Skills", "Small", "Smart", "Socal", "Soccer", "Society", "Solid", "Solutions", "Sorbonne", "Sound", "South", "Spaces", "Spatial", "Special", "Speech", "Spirits", "Stage", "Stagecraft", "Standard", "Standing", "Stirling", "Strategic", "Strength", "String", "Study", "Stylist", "Sunderland", "Supply", "Support", "Surveying", "Sustainable", "Swedish", "Swinburne", "System", "Systematic", "Systems", "Teachers", "Tech", "Technique", "Techniques", "Technological", "Telephony", "Territories", "Test", "Texts", "Theoretical", "Things", "Thinking", "Threat", "Time", "Tools", "Tranfer", "Transatlantic", "Transfer", "Transition", "Travel", "Treasury", "Treaty", "Trobe", "Truck", "Two", "Undecided", "Union", "United", "Urban", "User", "Valuation", "Ventilation", "Visual", "Voice", "Water", "Wave", "Well", "Women", "Wood", "Worker", "Worlds", "Writing", "Youth", "available", "awarded", "campus", "code", "collaboration", "combined", "cooperation", "developing", "experience", "formerly", "leading", "learning", "relations", "safety", "security", "services", "specializations", "system", "systems", "thesis", "time", "tisserie"];
  
    // Create a regular expression pattern to match special characters
    let specialCharsPattern = /[^a-zA-Z\s]/g;
  
    // Remove special characters
    inputText = inputText.replace(specialCharsPattern, ' ');
  
    // Split the text into words
    let words = inputText.split(/\s+/);
  
    // Filter out the words to be removed
    let filteredWords = words.filter(word => (word.length > 2) && !caseInsensitiveIncludes(wordsToRemove, word));
  
    return [...new Set(filteredWords)];
  },

   caseInsensitiveIncludes(arr, searchElement) {
    return arr.map(el => el.toLowerCase()).includes(searchElement.toLowerCase());
  }
  



  
}

