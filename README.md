# Student Dashboard Application

This application provides a comprehensive student and subject management system with the following functionalities:

## Features Implemented:

### Student Management
* **Add New Students:** Users can register and add new student records through the dashboard form. New students appear correctly in the student list.

* **Update Student Information:** Existing student records can be updated. When a student's 'Edit' button is clicked, their details populate the form, allowing for modifications. The 'SAVE' button transforms into an 'UPDATE' button, and changes are saved to the database.

* **Delete Students:** Students can be removed from the system using the 'Delete' action button next to their record.

* **Improved Form Handling & Error Feedback:**
    * The 'SAVE' button in the student form provides proper client-side and server-side error messages if adding a new student fails.
    * The 'UPDATE' operation provides detailed error messages and automatically clears the form and resets the 'UPDATE' button to 'SAVE' if the update fails.
    * The 'CANCEL' button consistently clears the form and resets it to the 'SAVE' (add new student) state.

* **Action Button Layout:** The 'Edit' and 'Delete' action buttons in the student list table are displayed side-by-side for better visual organization.

### Subject Management
* **View Subjects:** All subjects are displayed in a table format showing EDP Code, Subject Code, Descriptive Title, Schedule, Room, and Units.

* **Add New Subjects:** Users can add new subjects through a form with fields for:
    * EDP Code
    * Subject Code
    * Descriptive Title
    * Schedule
    * Room
    * Units

* **Update Subjects:** Existing subject records can be modified:
    * Click the 'Edit' button to populate the form with subject details
    * Modify the required fields
    * Click 'UPDATE' to save changes

* **Delete Subjects:** Subjects can be removed from the system:
    * Click the 'Delete' button next to the subject
    * Confirm deletion in the popup dialog
    * Subject is removed from both the UI and database

* **Form Management:**
    * Form clears after successful addition/update
    * 'CANCEL' button resets the form
    * Proper error handling and user feedback

## Technical Details
* Built with Node.js and Express.js
* Uses EJS as the template engine
* SQLite database for data storage
* RESTful API architecture
* Responsive design with modern UI elements

## Navigation
* Dashboard: Student registration and management
* Subject: Course and subject management
* Grades: Grade management (in development) 