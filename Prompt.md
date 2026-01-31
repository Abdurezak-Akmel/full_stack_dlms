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