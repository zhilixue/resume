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
            //=>当第三条完全展示后立即调取出键盘(STEP===2 && 当前LI显示的动画已经完成)
            if (step === 2) {
                //=>transitionend:当前元素正在运行的CSS3过渡动画已经完成,就会触发这个事件(有几个元素样式需要改变,就会被触发执行几次)
                $cur.one('transitionend', ()=> {
                    //=>one:JQ中的事件绑定方法,想要实现当前事件只绑定一次,触发一次后,给事件绑定的方法自动移除
                    $keyBord.css('transform', 'translateY(0)')
                        .one('transitionend', textMove);
                });
                clearInterval(autoTimer);
                return;
            }

            //=>从第五条开始,每当展示一个LI,都需要让UL整体上移
            if (step >= 4) {
                offset += -$cur[0].offsetHeight;
                $talkBox.css(`transform`, `translateY(${offset}px)`);
            }

            //=>已经把LI都显示了:结束动画,进入到下一个区域即可
            if (step >= $talkList.length - 1) {
                clearInterval(autoTimer);

                //=>进入到下一个环节之前给设置一个延迟:
                //让用户把最后一条数据读取完整
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
                //=>打印机效果完成:让发送按钮显示(并且给其绑定点击事件)
                clearInterval(timer);
                $keyBordText.html(text);

                $submit.css('display', 'block').tap(()=> {
                    $keyBordText.css('display', 'none');
                    $keyBord.css('transform', 'translateY(3.7rem)');
                    $plan.fire();//=>此时计划表中只有一个方法,重新通知计划表中的这个方法执行
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
let cubeRender = (function () {
    return {
        init: function () {

        }
    }
})();

messageRender.init();
