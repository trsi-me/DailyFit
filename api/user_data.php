<?php
require_once 'config.php';

$callback = isset($_GET['callback']) ? $_GET['callback'] : '';
$action = isset($_GET['action']) ? $_GET['action'] : '';

$conn = getDBConnection();
if (!$conn) {
    $response = jsonResponse('false', 'خطأ في الاتصال بقاعدة البيانات');
    echo $callback ? $callback . '(' . $response . ')' : $response;
    exit;
}

if ($action === 'get') {
    // الحصول على بيانات المستخدم
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    
    if (empty($email)) {
        $response = jsonResponse('false', 'البريد الإلكتروني مطلوب');
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    $stmt = $conn->prepare("SELECT id, name, email, phone, weight, height, age, daily_calories FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $response = jsonResponse('true', 'تم جلب البيانات بنجاح', $user);
    } else {
        $response = jsonResponse('false', 'المستخدم غير موجود');
    }
    
    $stmt->close();
    
} elseif ($action === 'update') {
    // تحديث بيانات المستخدم
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    $weight = isset($_GET['weight']) ? floatval($_GET['weight']) : null;
    $height = isset($_GET['height']) ? floatval($_GET['height']) : null;
    $age = isset($_GET['age']) ? intval($_GET['age']) : null;
    $daily_calories = isset($_GET['daily_calories']) ? intval($_GET['daily_calories']) : null;
    
    if (empty($email)) {
        $response = jsonResponse('false', 'البريد الإلكتروني مطلوب');
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    $updates = array();
    $params = array();
    $types = '';
    
    if ($weight !== null) {
        $updates[] = "weight = ?";
        $params[] = $weight;
        $types .= 'd';
    }
    if ($height !== null) {
        $updates[] = "height = ?";
        $params[] = $height;
        $types .= 'd';
    }
    if ($age !== null) {
        $updates[] = "age = ?";
        $params[] = $age;
        $types .= 'i';
    }
    if ($daily_calories !== null) {
        $updates[] = "daily_calories = ?";
        $params[] = $daily_calories;
        $types .= 'i';
    }
    
    if (empty($updates)) {
        $response = jsonResponse('false', 'لا توجد بيانات للتحديث');
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE email = ?";
    $params[] = $email;
    $types .= 's';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0 || $stmt->errno == 0) {
        // جلب البيانات المحدثة
        $stmt2 = $conn->prepare("SELECT id, name, email, phone, weight, height, age, daily_calories FROM users WHERE email = ?");
        $stmt2->bind_param("s", $email);
        $stmt2->execute();
        $result = $stmt2->get_result();
        $user = $result->fetch_assoc();
        $stmt2->close();
        
        $response = jsonResponse('true', 'تم تحديث البيانات بنجاح', $user);
    } else {
        $response = jsonResponse('false', 'فشل تحديث البيانات');
    }
    
    $stmt->close();
} else {
    $response = jsonResponse('false', 'إجراء غير صحيح');
}

$conn->close();
echo $callback ? $callback . '(' . $response . ')' : $response;
?>
