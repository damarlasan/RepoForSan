var express = require('express');
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
//var CircularJSON = require('circular-json');
var PORT = process.env.PORT || 8090;
var app = express();

var connectionProperties = {
  //user: process.env.DBAAS_USER_NAME || "patientdb",
  //password: process.env.DBAAS_USER_PASSWORD || "patientdb",
  //connectString: process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR || "172.16.0.86:1521/FREEPDB1"
  
  //user: process.env.DBAAS_USER_NAME || "admin",
  //password: process.env.DBAAS_USER_PASSWORD || "M-vr$srbxIN3T2veEU8X3TTqHa%U",
  user: process.env.DBAAS_USER_NAME || "patientdbrds",
  password: process.env.DBAAS_USER_PASSWORD || "patientdbrds",
  connectString: process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR || "idg.cod1v5mt9tpa.us-east-1.rds.amazonaws.com:1521/ORCL_A"
};

function doRelease(connection) {
  connection.release(function (err) {
    if (err) {
      console.error(err.message);
    }
  });
};

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));

var router = express.Router();

router.use(function (request, response, next) {
  console.log("REQUEST:" + request.method + "   " + request.url);
  console.log("BODY:" + JSON.stringify(request.body));
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorizationToken');
  response.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

/**
 * GET / 
 * Return Home Page for NSSM to work.
 */
router.route('/').get(function (request, response) {
  response.send('Welcome to Node Server REST API!');
});

/**
 * GET / 
 * Returns a list of employees 
 */
router.route('/employees/').get(function (request, response) {
  console.log("GET EMPLOYEES");
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }
    console.log("After connection");
    connection.execute("SELECT * FROM employee",{},
	//connection.execute("select PATIENT_UTILS_PKG.get_employees from dual",{},
      { outFormat: oracledb.OBJECT },
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        console.log("RESULTSET:" + JSON.stringify(result));
        var employees = [];
        result.rows.forEach(function (element) {
          employees.push({ id: element.ID, firstName: element.FIRSTNAME, 
                           lastName: element.LASTNAME, email: element.EMAIL, 
                           phone: element.PHONE, birthDate: element.BIRTHDATE, 
                           title: element.TITLE, dept: element.DEPARTMENT });
        }, this);
        response.json(employees);
        doRelease(connection);
      });
  });
});

/**
 * GET / 
 * Returns a list of patients 
 */
router.route('/fetchAll').get(function (request, response) {
  console.log("GET PATIENT_ENCOUNTER_DETAILS");
  oracledb.getConnection(connectionProperties
  //, async function (err, connection) {
	, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }
    console.log("After connection");
	//await connection.execute("SELECT * FROM PATIENT_ENCOUNTER_DETAILS",{},
	//connection.execute("SELECT * FROM PATIENT_ENCOUNTER_DETAILS_MOCK",{},
	connection.execute("SELECT * FROM PATIENT_ENCOUNTER_DETAILS_VW",{},
	
	
    //connection.execute("SELECT * FROM patients",{},
	//connection.execute("select PATIENT_UTILS_PKG.get_employees from dual",{},
      { outFormat: oracledb.OBJECT },
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        //console.log("RESULTSET:" + JSON.stringify(result));
		const jsonString = JSON.stringify(result, circularReplacer());
		//console.log("RESULTSET:" + jsonString);
        var employees = [];
        // result.rows.forEach(function (element) {
          // employees.push({ patientId: element.PATIENT_ID, firstName: element.FIRST_NAME, 
                           // lastName: element.LAST_NAME, dateOfBirth: element.DATE_OF_BIRTH});
        // }, this);
		
		
		result.rows.forEach(function (element) {
			employees.push({
				id: element.ID,
				patient_name: element.PATIENT_NAME,
				date_of_birth: element.DATE_OF_BIRTH,
				age_at_treatment: element.AGE_AT_TREATMENT,
				gender: element.GENDER,
				contact_number: element.CONTACT_NUMBER,
				treating_physician: element.TREATING_PHYSICIAN,
				hospital_name: element.HOSPITAL_NAME,
				encounter_date: element.ENCOUNTER_DATE,
				encounter_type: element.ENCOUNTER_TYPE,
				notes: element.NOTES,
				condition_name: element.CONDITION_NAME,
				severity: element.SEVERITY,
				medication_name: element.MEDICATION_NAME,
				instructions: element.INSTRUCTIONS,
				prescribing_physician: element.PRESCRIBING_PHYSICIAN,
				complexity_score: element.COMPLEXITY_SCORE});
        }, this);
		
        //const jsonString = JSON.stringify(yourObject, circularReplacer());
		console.log(employees);
		response.json({"items":employees, "count":employees.length});
        doRelease(connection);
      });
  });
});

/**
 * GET /searchValue 
 * Returns a list of patients that match the criteria 
 */
router.route('/fetcAll/:searchValue').get(function (request, response) {
  console.log("GET EMPLOYEES BY CRITERIA");
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }
	console.log("After connection");
	//var searchType = request.params.searchType;
	var searchValue = request.params.searchValue;
	  
    connection.execute("SELECT * FROM PATIENT_ENCOUNTER_DETAILS_MOCK WHERE patient_name LIKE %:searchValue%",[searchValue],
      { outFormat: oracledb.OBJECT },
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        const jsonString = JSON.stringify(result, circularReplacer());
		//console.log("RESULTSET:" + jsonString);
        var employees = [];
        // result.rows.forEach(function (element) {
          // employees.push({ patientId: element.PATIENT_ID, firstName: element.FIRST_NAME, 
                           // lastName: element.LAST_NAME, dateOfBirth: element.DATE_OF_BIRTH});
        // }, this);
		
		
		result.rows.forEach(function (element) {
			employees.push({
				id: element.ID,
				patient_name: element.PATIENT_NAME,
				date_of_birth: element.DATE_OF_BIRTH,
				age_at_treatment: element.AGE_AT_TREATMENT,
				gender: element.GENDER,
				contact_number: element.CONTACT_NUMBER,
				treating_physician: element.TREATING_PHYSICIAN,
				hospital_name: element.HOSPITAL_NAME,
				encounter_date: element.ENCOUNTER_DATE,
				encounter_type: element.ENCOUNTER_TYPE,
				notes: element.NOTES,
				condition_name: element.CONDITION_NAME,
				severity: element.SEVERITY,
				medication_name: element.MEDICATION_NAME,
				instructions: element.INSTRUCTIONS,
				prescribing_physician: element.PRESCRIBING_PHYSICIAN});
        }, this);
		console.log(employees);
        response.json(employees);
        doRelease(connection);
      });
  });
}); 

// HPEPALA
function circularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return; // Circular reference found, omit it
            }
            seen.add(value);
        }
        return value;
    };
}

//const jsonString = JSON.stringify(yourObject, circularReplacer());


/**
 * GET /searchType/searchValue 
 * Returns a list of employees that match the criteria 
 */
router.route('/employees/:searchType/:searchValue').get(function (request, response) {
  console.log("GET EMPLOYEES BY CRITERIA");
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }
	console.log("After connection");
	var searchType = request.params.searchType;
	var searchValue = request.params.searchValue;
	  
    connection.execute("SELECT * FROM employee WHERE "+searchType+" = :searchValue",[searchValue],
      { outFormat: oracledb.OBJECT },
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        console.log("RESULTSET:" + JSON.stringify(result));
        var employees = [];
        result.rows.forEach(function (element) {
          employees.push({ id: element.ID, firstName: element.FIRSTNAME, 
		                   lastName: element.LASTNAME, email: element.EMAIL, 
		                   phone: element.PHONE, birthDate: element.BIRTHDATE, 
						   title: element.TITLE, dept: element.DEPARTMENT });
        }, this);
        response.json(employees);
        doRelease(connection);
      });
  });
}); 

/**
 * POST / 
 * Saves a new employee 
 */
router.route('/employees/').post(function (request, response) {
  console.log("POST EMPLOYEE:");
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }

    var body = request.body;

    connection.execute("INSERT INTO EMPLOYEE (ID, FIRSTNAME, LASTNAME, EMAIL, PHONE, BIRTHDATE, TITLE, DEPARTMENT)"+ 
                       "VALUES(EMPLOYEE_SEQ.NEXTVAL, :firstName,:lastName,:email,:phone,:birthdate,:title,:department)",
      [body.firstName, body.lastName, body.email, body.phone, body.birthDate, body.title,  body.dept],
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error saving employee to DB");
          doRelease(connection);
          return;
        }
        response.end();
        doRelease(connection);
      });
  });
});

/**
 * PUT / 
 * Update a employee 
 */
router.route('/employees/:id').put(function (request, response) {
  console.log("PUT EMPLOYEE:");
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }

    var body = request.body;
    var id = request.params.id;

    connection.execute("UPDATE EMPLOYEE SET FIRSTNAME=:firstName, LASTNAME=:lastName, PHONE=:phone, BIRTHDATE=:birthdate,"+
                       " TITLE=:title, DEPARTMENT=:department, EMAIL=:email WHERE ID=:id",
      [body.firstName, body.lastName,body.phone, body.birthDate, body.title, body.dept, body.email,  id],
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error updating employee to DB");
          doRelease(connection);
          return;
        }
        response.end();
        doRelease(connection);
      });
  });
});

/**
 * DELETE / 
 * Delete a employee 
 */
router.route('/employees/:id').delete(function (request, response) {
  console.log("DELETE EMPLOYEE ID:"+request.params.id);
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }

    var body = request.body;
    var id = request.params.id;
    connection.execute("DELETE FROM EMPLOYEE WHERE ID = :id",
      [id],
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error deleting employee to DB");
          doRelease(connection);
          return;
        }
        response.end();
        doRelease(connection);
      });
  });
});

app.use(express.static('static'));
app.use('/', router);
app.listen(PORT);