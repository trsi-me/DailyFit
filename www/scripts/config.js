// إعدادات التطبيق - رابط API
// اكتشاف تلقائي للـ IP الحالي
var currentHost = window.location.hostname;

// إذا كان التطبيق يعمل على IP محلي (مثل 192.168.x.x)، استخدم نفس الـ IP للـ API
if (currentHost.match(/^192\.168\.|^10\.|^172\./)) {
    var API_BASE_URL = 'http://' + currentHost + '/dailyfit/api/';
}
// إذا كان localhost
else {
    var API_BASE_URL = 'http://localhost/dailyfit/api/';
}
