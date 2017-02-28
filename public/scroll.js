/*Menu-toggle*/
$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("active");
});

/*Scroll Spy*/
$('body').scrollspy({target: '#spy', offset: 80});

/*Smooth link animation*/
$('a[href*="#"]:not([href="#"])').click(function () {
    if ($('#wrapper').hasClass('active')) {
        $('#wrapper').removeClass('active');
    }
    
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {

        var target = $(this.hash);
        target = target.length
            ? target
            : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            $('html,body').animate({
                scrollTop: target.offset().top
            }, 1000);
            return false;
        }
    }
});
