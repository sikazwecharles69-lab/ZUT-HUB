# ZUT-HUB

## Running the restaurant site with order storage

The Vercel site uses a static order form that opens WhatsApp with the order
details. The PHP/MySQL order-saving backend is available for local use with PHP,
MySQL, and the PHP `mysqli` extension (for example, through XAMPP).

1. Start Apache and MySQL in XAMPP.
2. Import `schema.sql` in phpMyAdmin, or run it with the MySQL command-line client.
   This creates the `restaurant_db` database and its `orders` table.
3. If your local MySQL credentials differ, update the connection settings in
   `db.php`.
4. Put the project folder under XAMPP's `htdocs` directory and open
   `http://localhost/<project-folder>/` in your browser.

The Vercel deployment excludes local PHP files and serves `index.html` and
`order.html`. Each menu and price-list item can prefill the WhatsApp order form.
For the local PHP/MySQL version, `index.php` serves the homepage and `order.php`
saves orders before opening WhatsApp. The XAMPP `applications.html` dashboard
page is not part of the restaurant site.
