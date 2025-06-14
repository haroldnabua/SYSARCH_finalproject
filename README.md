# Student Dashboard Application 🎓

This application provides a comprehensive student and subject management system with the following functionalities:

## Features Implemented: ✨

### Student Management 🧑‍🎓
* **Add New Students:** Users can register and add new student records through the dashboard form. New students appear correctly in the student list. ➕

* **Update Student Information:** Existing student records can be updated. When a student's 'Edit' button is clicked, their details populate the form, allowing for modifications. The 'SAVE' button transforms into an 'UPDATE' button, and changes are saved to the database. ✏️

* **Delete Students:** Students can be removed from the system using the 'Delete' action button next to their record. 🗑️

* **Improved Form Handling & Error Feedback:**
    * The 'SAVE' button in the student form provides proper client-side and server-side error messages if adding a new student fails. 🛑
    * The 'UPDATE' operation provides detailed error messages and automatically clears the form and resets the 'UPDATE' button to 'SAVE' if the update fails. 🔄
    * The 'CANCEL' button consistently clears the form and resets it to the 'SAVE' (add new student) state. ↩️

* **Action Button Layout:** The 'Edit' and 'Delete' action buttons in the student list table are displayed side-by-side for better visual organization. 🎛️

### Subject Management 📚
* **View Subjects:** All subjects are displayed in a table format showing EDP Code, Subject Code, Descriptive Title, Schedule, Room, and Units. 📋

* **Add New Subjects:** Users can add new subjects through a form with fields for:
    * EDP Code
    * Subject Code
    * Descriptive Title
    * Schedule
    * Room
    * Units

* **Update Subjects:** Existing subject records can be modified: 📝
    * Click the 'Edit' button to populate the form with subject details
    * Modify the required fields
    * Click 'UPDATE' to save changes

* **Delete Subjects:** Subjects can be removed from the system:
    * Click the 'Delete' button next to the subject
    * Confirm deletion in the popup dialog
    * Subject is removed from both the UI and database. ❌

* **Form Management:**
    * Form clears after successful addition/update ✅
    * 'CANCEL' button resets the form
    * Proper error handling and user feedback

### Grade Management 💯
* **Subject-Specific Grading:** Grades are now assigned and stored specifically for each student within a particular subject, utilizing a new `student_grades` table in the database. 📊
* **Enhanced Grades Page (`grades.ejs`):**
    * The page dynamically displays detailed subject information (EDP Code, Title, Schedule, Room) based on the selected subject. 🏫
    * Users can click on a student's IDNO in the main list to automatically populate their details and grades for the current subject on the right-hand panel. 🖱️
    * The student search functionality on the grades page now retrieves subject-specific grades. 🔍
* **Backend API for Grades:**
    * New API endpoints in `api/students.js` allow fetching a student's grades for a specific subject (`GET /api/students/:idno/subject-grades/:edpcode`). 🔗
    * A new endpoint fetches all students enrolled in a subject with their grades (`GET /api/students/subject/:edpcode`). 📝
    * The `PUT /api/students/:idno/grades` endpoint has been updated to perform an 'upsert' (insert or update) operation on the `student_grades` table, ensuring grades are correctly saved or updated for the given student and subject. 💾
* **Seamless Navigation:** Clicking a student's IDNO on the `enrollment.ejs` page now correctly redirects to `grades.ejs`, automatically loading that student's details and the context of the specific subject. ➡️
* **Consistent Grade Display:** All numerical grade inputs and displays (Prelim, Midterm, Semi-Final, Final, FG) are consistently formatted to one decimal place (e.g., `1.0`, `2.5`). 🔢

### Enrollment Management Enrollment ➕
* **Enhanced Enrollment Page Design:** The `enrollment.ejs` page now features a two-column layout, displaying a list of enrolled students on the left and a student details panel on the right for enrollment and search. 🖥️
* **Student Search Functionality:** Users can search for students by their ID number (IDNO) on the enrollment page. The details of the searched student are dynamically displayed in the right-hand panel. 🔎
* **Enroll Student in Subject:** Functionality to enroll a student in the currently viewed subject is implemented. This updates a new `student_enrollments` table in the database. ✅
* **Unenroll Student from Subject:** Students can be removed from a subject using a trash can icon in the action column of the student list. This also updates the `student_enrollments` table. 🚫
* **Dynamic Student List:** The list of students on the enrollment page dynamically updates to reflect current enrollments for the selected subject. 🔄

## Technical Details ⚙️
* Built with Node.js and Express.js 🚀
* Uses EJS as the template engine 📄
* SQLite database for data storage 🗄️
* RESTful API architecture 🌐
* Responsive design with modern UI elements 📱

## Navigation 🧭
* Dashboard: Student registration and management 🏠
* Subject: Course and subject management 🏫
* Grades: Grade management ✅ 