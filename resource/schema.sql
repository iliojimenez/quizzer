-- 13

CREATE TABLE version (
       schema TEXT PRIMARY KEY,
       version INT NOT NULL
);
CREATE INDEX version_idx ON version(schema);

CREATE TABLE admin (
       adminID INTEGER PRIMARY KEY,
       name TEXT,
       adminKey TEXT,
       role INTEGER,
       interval INTEGER,
       email TEXT
);
CREATE UNIQUE INDEX admin_key_idx ON admin(adminKey);
CREATE UNIQUE INDEX admin_name_idx ON admin(name);

CREATE TABLE students (
       studentID INTEGER PRIMARY KEY,
       name TEXT,
       email TEXT,
       privacy INTEGER DEFAULT 0,
       lang TEXT DEFAULT 'en'
);

CREATE TABLE classes (
       classID INTEGER PRIMARY KEY,
       name TEXT
);

CREATE TABLE memberships (
       membershipID INTEGER PRIMARY KEY,
       classID INTEGER,
       studentID INTEGER,
       studentKey TEXT NOT NULL,
       last_mail_date DATE,
       UNIQUE (studentID,classID),
       FOREIGN KEY (studentID) REFERENCES students(studentID),
       FOREIGN KEY (classID) REFERENCES classes(classID)       
);

CREATE TABLE showing (
       showID INTEGER PRIMARY KEY,
       adminID INTEGER,
       classID INTEGER,
       studentID INTEGER,
       UNIQUE (adminID,classID,studentID),
       FOREIGN KEY (adminID) REFERENCES admin(adminID),
       FOREIGN KEY (classID) REFERENCES classes(classID),
       FOREIGN KEY (studentID) REFERENCES students(studentID)       
);

CREATE TABLE quizzes (
       quizID INTEGER PRIMARY KEY,
       classID INTEGER,
       quizNumber INTEGER,
       sent BOOLEAN,
       examName TEXT,
       examDate TEXT,
       UNIQUE (classID,quizNumber),
       FOREIGN KEY (classID) REFERENCES classes(classID)
);

CREATE TABLE questions (
       questionID INTEGER PRIMARY KEY,
       quizID INTEGER,
       questionNumber INTEGER,
       correct INTEGER,
       stringID INTEGER,
       UNIQUE (quizID,questionNumber),       
       FOREIGN KEY (quizID) REFERENCES quizzes(quizID),
       FOREIGN KEY (stringID) REFERENCES strings(stringID)
);

CREATE TABLE choices (
       choiceID INTEGER PRIMARY KEY,
       questionID INTEGER,
       choice INTEGER,
       stringID INTEGER,
       UNIQUE (questionID,choice),
       FOREIGN KEY (questionID) REFERENCES questions(questionID),
       FOREIGN KEY (stringID) REFERENCES strings(stringID)
);

CREATE TABLE strings (
       stringID INTEGER PRIMARY KEY,
       string TEXT NOT NULL,
       UNIQUE (string)
);

CREATE TABLE answers(
       answerID INTEGER PRIMARY KEY AUTOINCREMENT,
       questionID INTEGER,
       studentID INTEGER,
       choice INTEGER,
       FOREIGN KEY (questionID) REFERENCES questions(questionID)
);
CREATE UNIQUE INDEX answers_idx ON answers(questionID,studentID,choice);

CREATE TABLE comments (
       commentID INTEGER PRIMARY KEY,
       choiceID INTEGER,
       adminID INTEGER,
       stringID INTEGER,
       UNIQUE (choiceID,stringID),
       FOREIGN KEY (choiceID) REFERENCES choices(choiceID),
       FOREIGN KEY (adminID) REFERENCES admin(adminID),
       FOREIGN KEY (stringID) REFERENCES strings(stringID)
);

CREATE TABLE rules (
       ruleID INTEGER PRIMARY KEY,
       ruleStringID INTEGER,
       adminID INTEGER,
       FOREIGN KEY (adminID) REFERENCES admin(adminID),
       FOREIGN KEY (ruleStringID) REFERENCES ruleStrings(ruleStringID)
);

CREATE TABLE ruleStrings (
       ruleStringID INTEGER PRIMARY KEY,
       string TEXT NOT NULL,
       UNIQUE (string)
);
CREATE UNIQUE INDEX rulestrings_idx ON ruleStrings(string);

CREATE TABLE ruleTranslations (
       ruleTranslationID INTEGER PRIMARY KEY,
       ruleID NOT NULL,
       string TEXT NOT NULL,
       lang TEXT NOT NULL
       UNIQUE (string),
       UNIQUE (ruleID,lang),
       FOREIGN KEY (ruleID) REFERENCES rules(ruleID)
);

CREATE TABLE rulesToChoices (
       ruleToChoiceID INTEGER PRIMARY KEY,
       choiceID INTEGER,
       ruleID INTEGER,
       UNIQUE (choiceID,ruleID),
       FOREIGN KEY (choiceID) REFERENCES choices(choiceID),
       FOREIGN KEY (ruleID) REFERENCES rules(ruleID)
);
