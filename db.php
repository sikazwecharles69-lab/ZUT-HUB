
<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = "localhost";
$username = "root";
$password = "";
$database = "restaurant_db";

try {
    $conn = new mysqli($host, $username, $password, $database);
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $exception) {
    error_log("Restaurant database connection failed: " . $exception->getMessage());
    throw new RuntimeException("The restaurant database is unavailable.", 0, $exception);
}
?>
