fs = require('fs');
csv = require('csv');
http = require('http');
url = require('url');
quizPort = 3498;

// Subdirs to be created if necessary
var dirs = ['answer', 'ids', 'question'];

// Files to be created if necessary
var files = ['students', 'classes', 'membership']

// Pages
var pageAdminTop = fs.readFileSync('./pages/admin/top.html');
var pageStudents = fs.readFileSync('./pages/admin/students.html');
//var pageStudentEdit = fs.readFileSync('./pages/admin/studentedit.html');
var pageClasses = fs.readFileSync('./pages/admin/classes.html');
//var pageClassEdit = fs.readFileSync('./pages/admin/classedit.html');
//var pageMembership = fs.readFileSync('./pages/admin/membership.html');
//var pageQuizEdit = fs.readFileSync('./pages/admin/quizedit.html');
//var pageQuestionEdit = fs.readFileSync('./pages/admin/questionedit.html');
var pageQuiz = fs.readFileSync('./pages/user/quizpage.html');

//var pageQuizResult = fs.readFileSync('./pages/user/quizresult.html');

// Internal access maps
var admin = {};
var students = {};
var classes = {};
var membership = {};

// make data dirs as required
for (var i=0,ilen=dirs.length;i<ilen;i+=1) {
    var dir = dirs[i];
    try {
        fs.mkdirSync(dir);
    } catch (e) {} 
}

// To get a random key or random student ID, when needed in initializing data files
function getRandomKey(len, base) {
    // Modified from http://jsperf.com/random-md5-hash-implementations
    len = len ? len : 16;
    base = base ? base : 16;
    var _results;
    _results = [];
    for (var i=0;i<len;i+=1) {
        _results.push((Math.random() * base | 0).toString(base));
    }
    return _results.join("");
}

// Also initialise students.csv and classes.csv here
try {
    fs.openSync('./ids/admin.csv', 'r')
} catch (e) {
    if (e.code === 'ENOENT') {
        if (process.argv.length === 3) {
            var lst = [process.argv[2], getRandomKey()];
            csv().to('./ids/admin.csv').write(lst);
        } else {
            throw "ERROR: Must provide admin name as a single argument at first startup";
        }
    } else {
        throw e;
    }
}
for (var i=0,ilen=files.length;i<ilen;i+=1) {
    try {
        fs.openSync('./ids/' + files[i] + '.csv', 'r')
    } catch (e) {
        if (e.code === 'ENOENT') {
            csv().to('./ids/' + files[i] + '.csv').write([]);
        } else {
            throw e;
        }
    }
}

function loadStudents() {
    // To instantiate student authentication data
    console.log("XXX Next, load students, if any ...");
    loadClasses();
}

function loadClasses() {
    // To instantiate course membership rosters
    console.log("XXX And next, load classes, if any ...");
    runServer();
}

function loadAdmin() {
    csv()
        .from.stream(fs.createReadStream('./ids/admin.csv'))
        .on ('record', function (row,index) {
            admin[row[1]] = row[0];
            console.log("Admin URL for "+row[0]+": http://localhost:" + quizPort + "/?admin="+row[1]);
        })
        .on('end', function(count){
            loadStudents();
        })
        .on('error', function (e) {
            throw e;
        });
}

function runServer() {
    console.log("XXX And finally, spin up the server in all its glory ...");
    http.createServer(function (request, response) {

        // Stuff that will be needed

        // To call a requested admin page (default is top)
        // To perform the various admin operations after key validation
        // To call the quiz page on a student and course
        // To save the final data from a quiz after key validation

        if(request.method == "OPTIONS"){
            var nowdate = new Date();
            response.writeHead(200, {
                'Date': nowdate.toUTCString(),
                'Allow': 'GET,POST,OPTIONS',
                'Content-Length': 0,
                'Content-Type': 'text/plain',
            });
            response.end('');
            return;
        }
        request.on('data', function(data){
            if(typeof this.POSTDATA === "undefined"){
                this.POSTDATA = data;
            }
            else{
                this.POSTDATA += data;
            }
        });
        request.on('end', function(){
            try {
                //parse url from request object
                var uriObj = url.parse(this.url);
                uriObj.parsedQuery = require('querystring').parse(uriObj.query);
                var adminKey = uriObj.parsedQuery.admin;
                var quizKey = uriObj.parsedQuery.quiz;
                var studentID = uriObj.parsedQuery.id;
                var studentKey = uriObj.parsedQuery.key;
                var pageKey = uriObj.parsedQuery.page;
                var cmd = uriObj.parsedQuery.cmd;
                if (!cmd && adminKey && admin[adminKey]) {
                    if (!pageKey || pageKey === 'top') {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(pageAdminTop);
                    } else if (!pageKey || pageKey === 'students') {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(pageStudents);
                    } else if (!pageKey || pageKey === 'classes') {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(pageClasses);
                    } else {
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.end("Sorry, can't help you. I don't know about that page.");
                        return;
                    }
                } else if (!cmd && quizKey && studentID && studentKey) {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(pageQuiz);
                } else {
                    // All API calls and page dependencies will be handled here when we get to it
                    if ('.xml' === uriObj.href.slice(-4)) {
                        // This needs to be a bit smarter, obviously. Admin pages first, then
                        // fix this up to chase out the correct data file.
                        var myxml = fs.readFileSync(uriObj.href.slice(1)); 
                        response.writeHead(200, {'Content-Type': 'text/xml'});
                        response.end(myxml);
                        return;
                    } else if ('.js' === uriObj.href.slice(-3)) {
                        var myxml = fs.readFileSync(uriObj.href.slice(1));
                        response.writeHead(200, {'Content-Type': 'text/javascript'});
                        response.end(myxml);
                        return;
                    } else if (cmd) {
                        if (cmd === 'addstudent') {
                            response.writeHead(200, {'Content-Type': 'text/plain'});
                            response.end("");
                            var payload = JSON.parse(this.POSTDATA);
                            // Starting to think we should explore sqlite for this.
                            console.log("ADD A STUDENT: " + payload.name);
                            return;
                        } else {
                            response.writeHead(500, {'Content-Type': 'text/plain'});
                            response.end("An error occurred");
                            return;
                        }
                    } else {
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.end("An error occurred");
                        return;
                    }
                }
            } catch (e) {
                console.log(err.message);
                if(typeof err == "string"){
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end(err);
                    return;
                }
                else{
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end("An error occurred");
                    return;
                }
            }
        });
    }).listen(quizPort);
    console.log("Listening on port "+quizPort);
}

// Setup
loadAdmin();

