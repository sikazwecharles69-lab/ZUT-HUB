# ZUT-HUB

## Running the restaurant site with order storage

The site can be opened as static HTML, but saving orders requires PHP, MySQL, and
the PHP `mysqli` extension (for example, through XAMPP).

1. Start Apache and MySQL in XAMPP.
2. Import `schema.sql` in phpMyAdmin, or run it with the MySQL command-line client.
   This creates the `restaurant_db` database and its `orders` table.
3. If your local MySQL credentials differ, update the connection settings in
   `db.php`.
4. Put the project folder under XAMPP's `htdocs` directory and open
   `http://localhost/<project-folder>/` in your browser.

The PHP entry point serves the existing restaurant homepage. “Order Now” links
open the website order form, and each menu and price-list item can prefill that
form. WhatsApp ordering links are also available. The XAMPP `applications.html`
dashboard page is not part of the restaurant site.
