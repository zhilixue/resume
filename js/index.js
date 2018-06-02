let loadingRender = (function ($) {
    let $loadingBox = $('.loadingBox'),
        $run = $loadingBox.find('.run');

    //=>我们需要处理的图片
    let imgList = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course3.png", "img/zf_course5.png", "img/zf_course4.png", "img/zf_course2.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png",  "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png"];

    //=>控制图片加载进度
    let total = imgList.length-3,
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


let phoneRender=(function ($) {
    let $phoneBox=$('.phoneBox'),
        $time=$phoneBox.find(".time"),
        $listen=$phoneBox.find(".listen"),
        $listenTouch=$listen.find(".touch"),
        $detail=$phoneBox.find(".detail"),
        $detailTouch=$detail.find(".touch");

    let audioBell=$("#audioBell")[0];
    let audioSay=$("#audioSay")[0];
    let $phonePlan=$.Callbacks();
    $phonePlan.add(function () {
        $listen.remove();
        $detail.css('transform','translateY(0)')
    });
    //listen-touch

    $phonePlan.add(function () {
        audioBell.pause();
        audioSay.play();
        $time.css('display','block');
        let sayTimer=setInterval(()=>{
            let duration=audioSay.duration,
                current=audioSay.currentTime;
            let minute=Math.floor(current/60);

            let second=Math.floor(current-minute*60);
            minute<10?minute="0"+minute:null;
            second<10?second="0"+second:null;
            $time.html(`${minute}:${second}`)
            //播放结束
            if(current>duration){
                clearInterval(sayTimer)
                enterNext()
            }
        },1000)
    })

    $phonePlan.add(()=> {
        $detailTouch.tap(enterNext)
    })
    // 进入下一个区域
    let enterNext=function(){
        audioSay.pause();
        $phoneBox.remove();
        messageRender.init()
        
    }
    return{
        init:function () {
            $phoneBox.css('display', 'block');
            audioBell.play();
            $listenTouch.tap($phonePlan.fire)
        }
    }
})(Zepto)
// merssage
let messageRender=(function () {
    let $messageBox=$(".messageBox"),
        $talkBox=$messageBox.find(".talkBox"),
        $talkList=$talkBox.find("li"),
        $keyBord=$messageBox.find(".keyBord"),
        $keyBordText=$keyBord.find("span"),
        $submit=$keyBord.find(".submit"),
        musicAudio=$('#musicAudio')[0];
    let $plan=$.Callbacks()
    //控制消息列表逐条显示
    let step=-1,
        autoTimer=null,
        interval=1500,
        offset=0;
    $plan.add(()=>{
        autoTimer=setInterval(()=>{
            step++;
            let $cur= $talkList.eq(step);
            $cur.css({opacity:1,transform:"translateY(0)"})
            //当第三条完全展示之后立即调取键盘(dtep==2&当前li显示的动画已经完成)
            if(step===2){
                $cur.one("transitionend",()=>{
                   $keyBord.css("transform","translateY(0)").one("transitionend",textMove)
                })
                clearInterval(autoTimer)
            }
            if(step>=4){
                offset+=-$cur[0].offsetHeight
                $talkBox.css(
                    `transform`,`translateY(${offset}px)`
                )
            }
            if(step>=$talkList.length-1){
                clearInterval(autoTimer);
                let dalayTimer=setTimeout(()=>{
                    musicAudio.pause()
                    $messageBox.remove()
                    cubeRender.init();
                    clearTimeout(dalayTimer)
                },interval)
            }
        },interval)
    })
    //控制文字及其打印机
    let textMove=function(){
        let text=$keyBordText.html()
           $keyBordText.css("display","block").html("");
        let timer=null,
            n=-1;
        timer=setInterval(()=>{
            if(n>=text.length){
                //打印机效果完成,让发送按钮显示(并且给发送绑定事件)
                $keyBordText.html(text)
                $submit.css("display","block").tap(()=>{
                       $keyBordText.css("display","none")
                    $keyBord.css("transform","translateY(3.7rem)")
                    $plan.fire()//此时计划表中只有一个方法,从新通知
                })
                clearInterval(timer);

                return
            }
            n++;
            $keyBordText[0].innerHTML+=text.charAt(n)
        },500)
    }
    return {
        init:function () {
            $messageBox.css("display","block");
            musicAudio.play()
            $plan.fire()

        }
    }
})()
// cube
//只要在移动端实现滑动操作,都需要把浏览器默认滑动行为禁止掉
$(document).on('touchstart touchmove touchend',function (e) {
    e.preventDefault()
})
let cubeRender=(function ($) {
    let $cubeBox=$(".cubeBox"),
        $box=$cubeBox.find(".box")
    let touchBegin=function(e){
        let point=e.changedTouches[0];
        $(this).attr({
            strX:point.clientX,
            strY:point.clientY,
            isMove:false,
            changeX:0,
            changeY:0
        })
    }
    let touching=function(e){
        let point=e.changedTouches[0];
        let $this=$(this);
        let changeX=point.clientX-parseFloat($this.attr("strX")),
            changeY=point.clientY-parseFloat($this.attr("strY"));
        if(Math.abs(changeX)>10||Math.abs(changeY)>10){
            $this.attr({
                isMove:true,
                changeX:changeX,
                changeY:changeY
            })
        }
    }
    let touchEnd=function (e) {
        let point=e.changedTouches[0];
        $this=$(this);
        let isMove=$this.attr("isMove"),
            changeX=parseFloat($this.attr("changeX")),
            changeY=parseFloat($this.attr("changeY")),
            rotateX=parseFloat($this.attr("rotateX")),
            rotateY=parseFloat($this.attr("rotateY"));
        if(isMove=="false") return;
        rotateX=rotateX-changeY/3;
        rotateY=rotateY+changeX/3;
        $this.css(`transform`,`scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`).attr({
            rotateX:rotateX,
            rotateY:rotateY
        })
    }
    return{
        init:function(){
         $cubeBox.css("display","block")
            $box.attr({
                rotateX:-30,
                rotateY:45
            }).on({
                touchstart:touchBegin,
                touchmove:touching,
                touchend:touchEnd
            })
            $box.find('li').tap(function () {
                $cubeBox.css('display','none');
                let index=$(this).index();
                detailRender.init(index)
            })
        }
    }
})(Zepto)


let detailRender=(function () {
    let $detailBox=$(".detailBox");
    let $returnLink=$detailBox.find(".returnLink"),
        $cubeBox=$(".cubeBox");
    let swipeExample=null;
    let $makisuBox=$("#makisuBox")

    let change=function(example){
        let {slides:slideAry,activeIndex}=example;
       //page1单独的处理
        if(activeIndex==0){
            $makisuBox.makisu({
                slector:"dd",
                speed:0.5,
                overlap:.6
            })
            $makisuBox.makisu("open")
        } else{
            $makisuBox.makisu({
                slector:"dd",
                speed:0,
                overlap:0
            })
            $makisuBox.makisu("close")
        }
        //当前活动块设置id,其它块移除
        [].forEach.call(slideAry,(item,index)=>{
            if(index==activeIndex){
                item.id="page"+(activeIndex+1)
                return
            }
            item.id=null;
        })

    }

    return{
        init:function(index=0){
            $detailBox.css("display","block");
            //init swiper

            if(!swipeExample){

                $returnLink.tap(()=>{
                    $detailBox.css("display","none")
                    $cubeBox.css("display","block")
                })
                swipeExample=new Swiper(".swiper-container",{
                    effect:"coverflow",
                    onInit:change,
                    onTransitionEnd:change

                });
            }

            index=index>5?5:index;
            swipeExample.slideTo(index,0);//运动到指定索引的slide位置,第二个参数是SPEED,我们设置0让其立即运动到指定位置
        }
    }
})()
loadingRender.init()