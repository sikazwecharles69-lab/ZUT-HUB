# ZUT-HUB

## Running the restaurant site with order storage

The Vercel site sends order details to the restaurant through the WhatsApp
Cloud API. The local PHP/MySQL order-saving form is available with PHP, MySQL,
and the PHP `mysqli` extension (for example, through XAMPP).

1. Start Apache and MySQL in XAMPP.
2. Import `schema.sql` in phpMyAdmin, or run it with the MySQL command-line client.
   This creates the `restaurant_db` database and its `orders` table.
3. If your local MySQL credentials differ, update the connection settings in
   `db.php`.
4. Put the project folder under XAMPP's `htdocs` directory and open
   `http://localhost/<project-folder>/` in your browser.

The Vercel deployment excludes the local PHP files and serves `index.html`,
`order.html`, and the `api/order.js` serverless endpoint. Configure the variables
from `.env.example` in the Vercel project settings. The WhatsApp API sender must
have an approved utility template named `new_website_order` in language `en_US`
with this body:

```text
New ZUT Restaurant website order {{1}}
Customer: {{2}}
Phone: {{3}}
Order type: {{4}}
Items: {{5}}
Delivery address: {{6}}
Notes: {{7}}
```

Submit example values for all seven placeholders when creating the template.
After it is approved, add the permanent system-user access token, sender phone
number ID, and verified recipient number to Vercel's Environment Variables,
then redeploy. Never commit real credentials. For the local PHP/MySQL version,
`index.php` serves the homepage and `order.php` stores orders in MySQL. The XAMPP
`applications.html` dashboard page is not part of the restaurant site.
