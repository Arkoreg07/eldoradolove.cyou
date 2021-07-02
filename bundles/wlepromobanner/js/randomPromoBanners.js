function RandomBannerGroup (current)
{
    this.currentIndex = 0;

    this.current = current;

    this.group = $('.promo-banner.random[data-side='+ $(current).attr('data-side')+'][data-weight='+ $(current).attr('data-weight')+']');

    this.timer = 0;

    this.startTimeout = function ()
    {
        var self = this;
        this.timer = setTimeout(function () { self.nextBanner() }, $(this.current).attr('data-ttl') * 1000);

        $(this.current).mouseenter(function () {
            clearTimeout(self.timer);
        });

        $(this.current).mouseleave(function () {
            clearTimeout(self.timer);
            self.timer = setTimeout(function () { self.nextBanner() }, 3000);
        });
    };

    this.nextBanner = function ()
    {
        this.currentIndex++;
        if (this.currentIndex >= this.group.length) {
            this.currentIndex = 0;
        }

        var next = this.group[this.currentIndex];

        if ($(current).parent().hasClass('promo-random')) {
            $(this.current).fadeOut(500);
            $(next).fadeIn(500);
        } else {
            $(this.current).find('img').fadeOut(500);
            $(this.current).css({'display':'none'});
            $(next).css({'display':'block'}).find('img').fadeIn(500);
        }
        this.current = next;

        this.startTimeout();
    };

    this.startTimeout();
}

$(document).ready(function(){
    var visibleRandomBanners = $('.promo-banner.random:visible');

    for (var i = 0; i < visibleRandomBanners.length; i++) {
        new RandomBannerGroup(visibleRandomBanners[i]);
    }
});