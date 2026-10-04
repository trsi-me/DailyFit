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

if ($action === 'get_daily') {
    // الحصول على التمارين اليومية للمستخدم
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    $day_number = isset($_GET['day_number']) ? intval($_GET['day_number']) : date('N'); // 1-7
    
    if (empty($email)) {
        $response = jsonResponse('false', 'البريد الإلكتروني مطلوب');
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    // أسماء الأيام
    $days = array('', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت');
    $day_name = $days[$day_number];
    
    // الحصول على التمارين المخصصة لهذا اليوم
    $stmt = $conn->prepare("
        SELECT de.id, de.day_number, de.day_name, de.completed, de.completed_at,
               e.id as exercise_id, e.name_ar, e.name_en, e.description, 
               e.calories_per_minute, e.duration_minutes
        FROM daily_exercises de
        INNER JOIN exercises e ON de.exercise_id = e.id
        INNER JOIN users u ON de.user_id = u.id
        WHERE u.email = ? AND de.day_number = ?
        ORDER BY de.id
    ");
    $stmt->bind_param("si", $email, $day_number);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $exercises = array();
    while ($row = $result->fetch_assoc()) {
        $exercises[] = $row;
    }
    
    // إذا لم تكن هناك تمارين مخصصة، إرجاع التمارين العامة
    if (empty($exercises)) {
        $stmt2 = $conn->prepare("SELECT * FROM exercises ORDER BY id LIMIT 5");
        $stmt2->execute();
        $result2 = $stmt2->get_result();
        
        while ($row = $result2->fetch_assoc()) {
            $exercises[] = array(
                'id' => null,
                'day_number' => $day_number,
                'day_name' => $day_name,
                'completed' => false,
                'completed_at' => null,
                'exercise_id' => $row['id'],
                'name_ar' => $row['name_ar'],
                'name_en' => $row['name_en'],
                'description' => $row['description'],
                'calories_per_minute' => $row['calories_per_minute'],
                'duration_minutes' => $row['duration_minutes']
            );
        }
        $stmt2->close();
    }
    
    $response = jsonResponse('true', 'تم جلب التمارين بنجاح', array(
        'day_number' => $day_number,
        'day_name' => $day_name,
        'exercises' => $exercises
    ));
    
    $stmt->close();
    
} elseif ($action === 'assign') {
    // تعيين تمرين ليوم معين
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    $exercise_id = isset($_GET['exercise_id']) ? intval($_GET['exercise_id']) : 0;
    $day_number = isset($_GET['day_number']) ? intval($_GET['day_number']) : 0;
    
    if (empty($email) || $exercise_id == 0 || $day_number == 0) {
        $response = jsonResponse('false', 'جميع البيانات مطلوبة');
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    // الحصول على user_id
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        $response = jsonResponse('false', 'المستخدم غير موجود');
        $stmt->close();
        $conn->close();
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    $stmt->close();
    
    $days = array('', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت');
    $day_name = $days[$day_number];
    
    // إضافة التمرين
    $stmt = $conn->prepare("INSERT INTO daily_exercises (user_id, exercise_id, day_number, day_name) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE day_name = ?");
    $stmt->bind_param("iiiss", $user_id, $exercise_id, $day_number, $day_name, $day_name);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0 || $stmt->errno == 0) {
        $response = jsonResponse('true', 'تم تعيين التمرين بنجاح');
    } else {
        $response = jsonResponse('false', 'فشل تعيين التمرين');
    }
    
    $stmt->close();
    
} elseif ($action === 'complete') {
    // تحديد التمرين كمكتمل
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    $exercise_id = isset($_GET['exercise_id']) ? intval($_GET['exercise_id']) : 0;
    $day_number = isset($_GET['day_number']) ? intval($_GET['day_number']) : 0;
    
    if (empty($email) || $exercise_id == 0 || $day_number == 0) {
        $response = jsonResponse('false', 'جميع البيانات مطلوبة');
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    // الحصول على user_id
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        $response = jsonResponse('false', 'المستخدم غير موجود');
        $stmt->close();
        $conn->close();
        echo $callback ? $callback . '(' . $response . ')' : $response;
        exit;
    }
    
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    $stmt->close();
    
    // تحديث حالة التمرين
    $stmt = $conn->prepare("UPDATE daily_exercises SET completed = TRUE, completed_at = NOW() WHERE user_id = ? AND exercise_id = ? AND day_number = ?");
    $stmt->bind_param("iii", $user_id, $exercise_id, $day_number);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0 || $stmt->errno == 0) {
        $response = jsonResponse('true', 'تم تحديد التمرين كمكتمل');
    } else {
        $response = jsonResponse('false', 'فشل تحديث حالة التمرين');
    }
    
    $stmt->close();
    
} elseif ($action === 'get_all') {
    // الحصول على جميع التمارين المتاحة
    $stmt = $conn->prepare("SELECT * FROM exercises ORDER BY name_ar");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $exercises = array();
    while ($row = $result->fetch_assoc()) {
        $exercises[] = $row;
    }
    
    $response = jsonResponse('true', 'تم جلب التمارين بنجاح', $exercises);
    $stmt->close();
    
} else {
    $response = jsonResponse('false', 'إجراء غير صحيح');
}

$conn->close();
echo $callback ? $callback . '(' . $response . ')' : $response;
?>
