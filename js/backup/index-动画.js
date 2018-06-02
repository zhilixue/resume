/*--LOADING--*/
let loadingRender = (function ($) {
    let $loadingBox = $('.loadingBox'),
        $run = $loadingBox.find('.run');

    //=>我们需要处理的图片
    let imgList = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course3.png", "img/zf_course5.png", "img/zf_course4.png", "img/zf_course2.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];

    //=>控制图片加载进度
    let total = imgList.length,
        cur = 0;
    let computed = function () {
        imgList.forEach(function (item) {
            let tempImg = new Image;
            tempImg.src = item;
            tempImg.onload = function () {
                tempImg = null;
                cur++;
                runFn();
            }
        });
    };

    //=>计算滚动条加载长度
    let runFn = function () {
        $run.css('width', cur / total * 100 + '%');
        if (cur >= total) {
            let delayTimer = setTimeout(()=> {
                $loadingBox.remove();
                phoneRender.init();
                clearTimeout(delayTimer);
            }, 1500);
        }
    };

    return {
        init: function () {
            $loadingBox.css('display', 'block');
            computed();
        }
    }
})(Zepto);

/*--PHONE--*/
let phoneRender = (function ($) {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('.time'),
        $listen = $phoneBox.find('.listen'),
        $listenTouch = $listen.find('.touch'),
        $detail = $phoneBox.find('.detail'),
        $detailTouch = $detail.find('.touch');

    let audioBell = $('#audioBell')[0],
        audioSay = $('#audioSay')[0];

    let $phonePlan = $.Callbacks();

    //=>控制盒子的显示隐藏
    $phonePlan.add(function () {
        $listen.remove();
        $detail.css('transform', 'translateY(0)');
    });

    //=>控制SAY播放
    $phonePlan.add(function () {
        audioBell.pause();
        audioSay.play();
        $time.css('display', 'block');

        //=>随时计算播放时间
        let sayTimer = setInterval(()=> {
            //=>总时间和已经播放时间:单位秒
            let duration = audioSay.duration,
                current = audioSay.currentTime;
            let minute = Math.floor(current / 60),
                second = Math.floor(current - minute * 60);
            minute < 10 ? minute = '0' + minute : null;
            second < 10 ? second = '0' + second : null;
            $time.html(`${minute}:${second}`);

            //=>播放结束
            if (current >= duration) {
                clearInterval(sayTimer);
                enterNext();
            }
        }, 1000);
    });

    //=>DETAIL-TOUCH
    $phonePlan.add(()=>$detailTouch.tap(enterNext));

    //=>进入下一个区域(MESSAGE)
    let enterNext = function () {
        audioSay.pause();
        $phoneBox.remove();
        messageRender.init();
    };

    return {
        init: function () {
            $phoneBox.css('display', 'block');

            //=>控制BELL播放
            audioBell.play();

            //=>LISTEN-TOUCH
            $listenTouch.tap($phonePlan.fire);
        }
    }
})(Zepto);

/*--MESSAGE--*/
let messageRender = (function ($) {
    let $messageBox = $('.messageBox'),
        $talkBox = $messageBox.find('.talkBox'),
        $talkList = $talkBox.find('li'),
        $keyBord = $messageBox.find('.keyBord'),
        $keyBordText = $keyBord.find('span'),
        $submit = $keyBord.find('.submit'),
        musicAudio = $('#musicAudio')[0];
    let $plan = $.Callbacks();

    //=>控制消息列表逐条显示
    let step = -1,
        autoTimer = null,
        interval = 1500,
        offset = 0;
    $plan.add(()=> {
        autoTimer = setInterval(()=> {
            step++;
            let $cur = $talkList.eq(step);
            $cur.css({
                opacity: 1,
                transform: 'translateY(0)'
            });
            if (step === 2) {
                $cur.one('transitionend', ()=> {
                    $keyBord.css('transform', 'translateY(0)')
                        .one('transitionend', textMove);
                });
                clearInterval(autoTimer);
                return;
            }
            if (step >= 4) {
                offset += -$cur[0].offsetHeight;
                $talkBox.css(`transform`, `translateY(${offset}px)`);
            }
            if (step >= $talkList.length - 1) {
                clearInterval(autoTimer);
                let delayTimer = setTimeout(()=> {
                    musicAudio.pause();
                    $messageBox.remove();
                    cubeRender.init();
                    clearTimeout(delayTimer);
                }, interval);
            }
        }, interval);
    });

    //=>控制文字及其打印机效果
    let textMove = function () {
        let text = $keyBordText.html();
        $keyBordText.css('display', 'block').html('');
        let timer = null,
            n = -1;
        timer = setInterval(()=> {
            if (n >= text.length) {
                clearInterval(timer);
                $keyBordText.html(text);
                $submit.css('display', 'block').tap(()=> {
                    $keyBordText.css('display', 'none');
                    $keyBord.css('transform', 'translateY(3.7rem)');
                    $plan.fire();
                });
                return;
            }
            n++;
            $keyBordText[0].innerHTML += text.charAt(n);
        }, 100);
    };

    return {
        init: function () {
            $messageBox.css('display', 'block');
            musicAudio.play();
            $plan.fire();
        }
    }
})(Zepto);

/*--CUBE--*/
$(document).on('touchstart touchmove', function (e) {
    e.preventDefault();
});
let cubeRender = (function () {
    let $cubeBox = $('.cubeBox'),
        $box = $cubeBox.find('.box');

    let touchBegin = function (e) {
        //=>this:box
        let point = e.changedTouches[0];
        $(this).attr({
            strX: point.clientX,
            strY: point.clientY,
            isMove: false,
            changeX: 0,
            changeY: 0
        });
    };

    let touching = function (e) {
        let point = e.changedTouches[0],
            $this = $(this);
        let changeX = point.clientX - parseFloat($this.attr('strX')),
            changeY = point.clientY - parseFloat($this.attr('strY'));
        if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10) {
            $this.attr({
                isMove: true,
                changeX: changeX,
                changeY: changeY
            });
        }
    };

    let touchEnd = function (e) {
        let point = e.changedTouches[0],
            $this = $(this);
        let isMove = $this.attr('isMove'),
            changeX = parseFloat($this.attr('changeX')),
            changeY = parseFloat($this.attr('changeY')),
            rotateX = parseFloat($this.attr('rotateX')),
            rotateY = parseFloat($this.attr('rotateY'));
        if (isMove === 'false') return;

        rotateX = rotateX - changeY / 3;
        rotateY = rotateY + changeX / 3;
        $this.css(`transform`, `scale(.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`).attr({
            rotateX: rotateX,
            rotateY: rotateY
        });
    };

    return {
        init: function () {
            $cubeBox.css('display', 'block');

            //=>事件绑定实现相关效果
            $box.attr({
                rotateX: -30,
                rotateY: 45
            }).on({
                touchstart: touchBegin,
                touchmove: touching,
                touchend: touchEnd
            });

            //=>每一个页面的点击操作
            $box.find('li').tap(function () {
                $cubeBox.css('display', 'none');
                let index = $(this).index();
                detailRender.init(index);
            });
        }
    }
})();

/*--DETAIL--*/
let detailRender = (function () {
    let $detailBox = $('.detailBox'),
        $cubeBox = $('.cubeBox'),
        $returnLink = $detailBox.find('.returnLink'),
        swipeExample = null;
    let $makisuBox = $('#makisuBox');

    let change = function (example) {
        let {slides:slideAry, activeIndex}=example;

        //=>PAGE1单独处理
        if (activeIndex === 0) {
            $makisuBox.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            });
            $makisuBox.makisu('open');
        } else {
            $makisuBox.makisu({
                selector: 'dd',
                overlap: 0,
                speed: 0
            });
            $makisuBox.makisu('close');
        }

        //=>给当前活动块设置ID,其它块移除ID
        [].forEach.call(slideAry, (item, index)=> {
            if (index === activeIndex) {
                item.id = 'page' + (activeIndex + 1);
                return;
            }
            item.id = null;
        });
    };

    return {
        init: function (index = 0) {
            $detailBox.css('display', 'block');

            //=>INIT SWIPER
            if (!swipeExample) {
                //=>RETURN
                $returnLink.tap(()=> {
                    $detailBox.css('display', 'none');
                    $cubeBox.css('display', 'block');
                });

                swipeExample = new Swiper('.swiper-container', {
                    effect: 'coverflow',
                    onInit: change,
                    onTransitionEnd: change
                });
            }

            index = index > 5 ? 5 : index;
            swipeExample.slideTo(index, 0);
        }
    }
})();

detailRender.init(1);

/*
 * 基于SWIPER实现每一个页面的动画
 * 1、滑到某一个页面的时候，给当前这个页面设置一个ID，例如：滑动到第二个页面，我们给其设置ID=PAGE2
 * 2、当滑出这个页面的时候，我们把之前设置的ID移除掉
 * 3、我们把当前页面中元素需要的动画效果全部写在指定的ID下
 *
 *  #page2 h2{
 *      animation:xxx 1s ...
 *  }
 *
 * 细节处理
 * 1、我们是基于ANIMATE.CSS帧动画库完成的动画
 * 2、我们让需要运动的元素初始样式：OPACITY=0（开始是隐藏的）
 * 3、当设置ID让其运动的时候，我们自己在动画公式完成的时候，让其透明度为1
 */