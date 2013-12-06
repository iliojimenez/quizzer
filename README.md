# Quizzer

A simple, lightweight, low-security quiz engine implemented in JavaScript, with a
node.js backend.

--------------------

Initial code based on a sample posted by Chetan Jain:

  http://chetan0389.blogspot.jp/2013/06/quiz-using-htmlcss-jquery-xml-javascript.html


Okay, so what are we after here ...

## Operations

##Disk files

  * Administrators (CSV): ID, key
  * Classes (CSV): Name, ID
  * Students (CSV): Name, email, ID, key [supplied if not present]
  * Results: (class/student+question).json

## Screens

  * Admin:
    * Top-level: add course / delete courses / edit course / student menu
    * Student-admin: add student / disable-enable student / edit student
    * Course-level: add quiz / delete quizes / edit quiz / add student / disable-enable student
    * Quiz-level
      * add question / delete questions / edit question
      * send quiz links to students
      * view results

  * Student:
    * Quiz engine cycle only. One shot and out per question, no time limit.

## General design

The idea is to build quizes from 400-word essays submitted by
students, using grammatical errors, errors in usage and awkward
expression as raw material. To add a peer-pressure element, the
name of the student from whose essay each question is drawn is
displayed in the question itself. In composing questions, the bad
example, an equally bad example, a corrected sentence, and a
corrected sentence containing a common error are composed and
saved. The engine randomizes the sequence of questions and
responses, and flags the correct answer in each for final marking.

Quiz responses are saved only when the full quiz has been completed.
If the quiz page is refreshed before completion, the quiz is
re-randomized, and starts over from the beginning. There is no time
limit: this is a tool for study, rather than examination.

For ease of administration, the system works without IDs and passwords.
A management screen for each quiz, available only to instructors, allows
a quiz link to be sent to each student, with the student ID and key
embedded in the link. Student simply clicks on the link and takes the quiz.
There is no other security.

The result of a quiz can be called up by an instructor in a quick-view response screen
(useful for in-class exercises), and can be downloaded in CSV
format for the final course record held on the instructor's own
computer.
