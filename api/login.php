<?php
require_once 'config.php';

// معالجة طلبات JSONP
$callback = isset($_GET['callback']) ? $_GET['callback'] : '';

$email = isset($_GET['username']) ? $_GET['username'] : '';
$password = isset($_GET['password']) ? $_GET['password'] : '';

if (empty($email) || empty($password)) {
    $response = jsonResponse('false', 'البريد الإلكتروني وكلمة المرور مطلوبان');
    echo $callback ? $callback . '(' . $response . ')' : $response;
    exit;
}

$conn = getDBConnection();
if (!$conn) {
    $response = jsonResponse('false', 'خطأ في الاتصال بقاعدة البيانات');
    echo $callback ? $callback . '(' . $response . ')' : $response;
    exit;
}

$stmt = $conn->prepare("SELECT id, name, email, weight, height, age, daily_calories FROM users WHERE email = ? AND password = ?");
$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $session = md5($user['email'] . time());
    
    $response = jsonResponse('true', 'تم تسجيل الدخول بنجاح', array(
        'user' => $user,
        'session' => $session
    ));
} else {
    $response = jsonResponse('false', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
}

$stmt->close();
$conn->close();

echo $callback ? $callback . '(' . $response . ')' : $response;
?>
