# Quizzer

A simple, lightweight, low-security quiz engine implemented in JavaScript, with a
node.js backend.

--------------------

The original motivation for this work was an unpleasant encounter with
the products of a commercial vendor. Quizzes are *simple* things. They
should be easy to customise, and deploying a quiz to a given group of
students should not require weeks of effort, large volumes of email,
numerous meetings and progress reports, or extensive trial-and-error
exploration of a byzantine menu system. It should just do its job,
so that we can get on with our own.

The initial inspiration for this particular attempt to do better was a [code
sample](http://chetan0389.blogspot.jp/2013/06/quiz-using-htmlcss-jquery-xml-javascript.html)
posted by Chetan Jain.

The descriptions below may make it sound like this is a working product
already. Don't be deceived: I've only begin working on the code, and it
will likely be a couple of months before it's ready for deployment. When
done, it will be simple to install and run, though, so if you keep an eye
on this space, you shouldn't be disappointed.

Frank Bennett, 7 December 2013

--------------------

## General design

The idea is to build quizzes from 400-word essays submitted by
students, using grammatical errors, errors in usage, and examples of
awkward expression as raw material. To add a peer-pressure element,
the name of the student from whose essay each question is drawn is
displayed in the question itself. In composing questions, the bad
example, an equally bad example, a corrected sentence, and a corrected
sentence containing a common error are composed and saved
(manually). The engine randomizes the sequence of questions and
responses, and flags the correct answer in each for final marking.

Quiz responses are saved only when the full quiz has been completed.
If the quiz page is refreshed before completion, the quiz is
re-randomized, and starts over from the beginning. There is no time
limit: this is a tool for study, rather than examination.

For ease of administration, the system uses one-time passwords
embedded in the URL for each quiz instance.  A management screen for
each quiz, available only to instructors, is used to send the quiz
link to each student. Student simply clicks on the link and takes the
quiz. The students' one-time passwords change with each new mailing.

Administrators all have global write access, and the administrator URL
can be reset either by deleting the admin.csv file, or by replacing it
with another version manually, and restarting the server.  There is no
other security.

The result of a quiz can be called up by an instructor in a quick-view
response screen (useful for in-class exercises), and can be downloaded
in CSV format for the final course record held on the instructor's own
computer.

## Dependencies

The node server has some dependencies:

    npm install csv
    npm install argparse
    npm install emailjs
    npm install marked
    


## Disk files

  * Administrators (CSV): ID, key
  * Classes (CSV): Name, ID
  * Students (CSV): Name, email, ID, key [supplied if not present]
  * Results: (class/student+question).json

## Screens

  * Admin:
    * Top-level: students / classes [done]
    * Course-admin: add course / edit course [done]
    * Student-admin: add student / edit student [done]
    * Course-level: add quiz / add student / remove student
    * Quiz-level
      * add question / edit question (active until sending)
      * send quiz links to students  (active until sending)
      * view results by question (active after sending)
      * view results by student  (active after sending)

  * Student:
    * Quiz engine cycle only. One shot and out per question, no time limit.
    * On completion, link to incorrect answers is displayed, with correct answer highlighted.

