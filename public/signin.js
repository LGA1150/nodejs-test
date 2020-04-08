$(document).ready(function () {
    var password = $('input:eq(1)');
    var confirm = $('input:eq(2)');
    password.blur(function () {
        confirm.attr('pattern', password.val());
    });
});