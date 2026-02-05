Prompt 1 - Compose Page
IN the compose page, change the header to 'compose' only and change the smaller text below it to "share documents with your co-workers". 
There are four categories of reciepients in the scope section. When individual is selected, there should be two filters in the search bar. One should be by-branch filter and the other by team filter. The branches are Mesob Head Quarter, Bole Mesob, Gullele Mesob, Lideta Mesob, Addis Ketema Mesob, Kirkos Mesob, Yeka Mesob, Kolfe Mesob, Lemi Kura Mesob, Kality Mesob and Nifas Silk Lafto Mesob. 
When team reciepient is selected, the search bar should have only by-branch filter the same as the above. 
In the workspace reciepient, the search bar should have only by-branch filter.
In the organization reciepient, all the branches should be listed down. 
Change the text of the scope section to 'to'.

Promt 2 - Inbox Page
In the inbox page, in the 'All' section, there should be a search bar below the navbar for all, personal, department, workspace and organization. 
The same search bar should be in the personal, department, workspace and organization sections. 
Change the name of the department section into "Team". The search bar should have by-team filter. 
In the workspace section, the search bar should have by-workspace filter.
Change the name of the organization section into "Branch". The search bar should have by-branch filter.

Prompt 3 - My Library Module Backend + database
In the Mylibrary page, change the name of the group section to "Categories". Change it also in the uploading form. The user should be able to create categories and be able to select a category when uploading a document. So categories should be stored in the database, each row should contain the user. The uploaded documents should be stored in the database, each row should contain the user and the category. Just implement the backend and database for this module. Do the backend in the dms/backend folder and the database query in the dms/databaseQuery.sql file. I will run the query in pgadmin using postgres user.

Prompt 4 - My Library Page (Improvement)
In the Mylibrary page, let each category have a delete button and an edit button. When the edit button is clicked, the category name should be editable and the user should be able to save the changes. When the delete button is clicked, the category should be deleted.Each document should have a delete button and download button. When the delete button is clicked, the document should be deleted. Clicking the document name should open the document in a new tab. The download button should download the document. The two buttons should be in the three dots menu. Below the Header of this page, add a search bar for searching documents by name. The size column should be in MB. The column header should say "(MB)". The container card for categories should be to the size of the content and be scrollable when the viewport height is less than the content height.

Promt 5 - Drafts Page
The draft page is a list of drafts from the compose page. It should have a grid display with cards. Each card should have the draft name, the date and time it was created, the size of the document and the number of recipients and all the other information that it acquires from the compose page. The cards should be scrollable when the viewport height is less than the content height. When the cards are clicked, they should open the compose page with the draft information. Each draft should have a delete button. When a draft is created initially from the compose page, it should be stored in the database. When a draft is deleted from the drafts page, it should be deleted from the database. 

Prompt 6 - Admin Page
In the dashboard, delete the roles and registration requests pages. Create a new admin module and name it "Admin Tools". 
In the admin tools page, there should be two sections. The first section is for managing users and the second section is for managing roles. In the user management section, there should be a table of users. Each row should have the user's Employee ID, name, email, phone number, role and status. The table should have a search bar for searching users by name, email, phone number, role and status. The table should have a delete button and an edit button. When the edit button is clicked, the user's information should be editable and the user should be able to save the changes. When the delete button is clicked, the user should be deleted. 
In the role management section, there should be a table of roles. Each row should have the role's name and description. The table should have a delete button and an edit button. When the edit button is clicked, the role's information should be editable and the user should be able to save the changes. When the delete button is clicked, the role should be deleted.
Each role should have a checkbox for privileges. The privileges are:
In My Library Module
- -Upload documents from local storage to the archive page of the DMS.

In Compose Module
- -Share documents for an individual.
- -Share documents for a team.
- -Share documents for a workspace.
- -Share documents for a branch.
- -Create workspace and share documents.

In Approval Module
- -Have the module

In Workspace Module
- -Create workspace

Let there be only one admin credential in the database. The admin should be able to create a user and assign a role to the user. The user should be able to login with the credentials created by the admin. Avoid the admin from being deleted or his role being changed. Avoid the "change first password" funcitonality in the log in page. Also avoid the sign up functionality since the admin creates accounts for users. Let there be a single user credential in the database for log in test. The admin tools page shouold be visible only for the admin account not for users. 
Do this on the frontend, backend and database. Update the database query file as well. I will run the query in pgadmin using postgres user. 

Prompt 7 - The Compose Page
In the compose page, when send to is for an individual, the search bar should search from the users in the database. Let the users table in the database include columns for branch (not null), team (null) and position (not null). The filters of the search bar should filter by branch and by team in the users table. Remove the mock data of the  branch filter and the teams filter. Branches and teams should be fetched from the user table in the database. Meaning, when a user account is created, the branch and team of the user should be fetched to the filters.The same filters should be implemented if the scope is team and workspace. The list of branches in the branch scope should be fetched from the user table in the database.  

Prompt 8 - Privileges List
In the admin tools page, in the role management section, the list of privilege checkboxes should be updated. The fifth privilege in the compose module should be deleted. The new list of privileges are:

In My Library Module
- -Upload documents from local storage to the archive page of the DMS.

In Compose Module
- -Share documents for an individual.
- -Share documents for a team.
- -Share documents for a workspace.
- -Share documents for a branch.

In Approval Module
- -Have the module

In Workspace Module
- -Create workspace


Prompt 9 - Privileges List
In the admin tools page, in the role management section, let the privileges affect the components of the user dashboard UI. For example, if the user does not have the privilege to upload documents from local storage to the archive page of the DMS, the upload button should not be visible in the archive page. If the user does not have the privilege to share documents for an individual, the individual scope from the four scopes in the compose page should not be visible in the compose page. If the user does not have the privilege to share documents for a team, the team scope from the four scopes in the compose page should not be visible in the compose page. If the user does not have the privilege to share documents for a workspace, the workspace scope from the four scopes in the compose page should not be visible in the compose page. If the user does not have the privilege to share documents for a branch, the branch scope from the four scopes in the compose page should not be visible in the compose page. If the user does not have the privilege to have the approval module, the approval module should not be visible in the user dashboard. If the user does not have the privilege to create a workspace and share documents for a workspace, the create workspace button should not be visible in the workspace page.

Promt-10

