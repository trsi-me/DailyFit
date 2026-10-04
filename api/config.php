<?php
// إعدادات الاتصال بقاعدة البيانات
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// معالجة طلبات OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'dailyfit');

// الاتصال بقاعدة البيانات
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $conn->set_charset("utf8mb4");
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        return $conn;
    } catch (Exception $e) {
        return null;
    }
}

// دالة لإرجاع استجابة JSON
function jsonResponse($status, $message, $data = null) {
    $response = array(
        'status' => $status,
        'message' => $message
    );
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    return json_encode($response, JSON_UNESCAPED_UNICODE);
}
?>
