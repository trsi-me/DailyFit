<?php
require_once 'config.php';

$callback = isset($_GET['callback']) ? $_GET['callback'] : '';

$name = isset($_GET['name']) ? $_GET['name'] : '';
$email = isset($_GET['email']) ? $_GET['email'] : '';
$phone = isset($_GET['phone']) ? $_GET['phone'] : '';
$password = isset($_GET['password']) ? $_GET['password'] : '';

if (empty($name) || empty($email) || empty($password)) {
    $response = jsonResponse('false', 'جميع الحقول مطلوبة');
    echo $callback ? $callback . '(' . $response . ')' : $response;
    exit;
}

$conn = getDBConnection();
if (!$conn) {
    $response = jsonResponse('false', 'خطأ في الاتصال بقاعدة البيانات');
    echo $callback ? $callback . '(' . $response . ')' : $response;
    exit;
}

// التحقق من وجود البريد الإلكتروني
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $response = jsonResponse('false', 'البريد الإلكتروني مستخدم بالفعل');
    $stmt->close();
    $conn->close();
    echo $callback ? $callback . '(' . $response . ')' : $response;
    exit;
}

// إضافة مستخدم جديد
$stmt = $conn->prepare("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $phone, $password);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $response = jsonResponse('true', 'تم التسجيل بنجاح');
} else {
    $response = jsonResponse('false', 'فشل التسجيل');
}

$stmt->close();
$conn->close();

echo $callback ? $callback . '(' . $response . ')' : $response;
?>
