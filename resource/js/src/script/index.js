define(function (require, exports) {
    var lazyImg = require('app/ln/c_lazy') //异步加载图片

    $.extend({
        getUrlVars: function () {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getUrlVar: function (name) {
            return $.getUrlVars()[name];
        }
    });



    function showTip(txt) {
        var message = $('<p style="background: rgba(0,0,0,0.5); position: fixed; z-index: 9999999; max-width: 80%; left: 50%; top: 50%; text-align: center;border-radius: 10px;padding: 10px; color: #fff" id="tips">' + txt + '</p>');
        $('body').append(message);

        message.css({
            'margin-left': -message.width() / 2,
            'margin-top': -message.height() / 2
        });

        window.setTimeout(function () {
            message.remove();
        }, 1000);
    }

    /**
                 ** 加法函数，用来得到精确的加法结果
                 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
                 ** 调用：accAdd(arg1,arg2)
                 ** 返回值：arg1加上arg2的精确结果
                 **/
    function accAdd(arg1, arg2) {
        var r1, r2, m, c;
        try {
            r1 = arg1.toString().split(".")[1].length;
        }
        catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        }
        catch (e) {
            r2 = 0;
        }
        c = Math.abs(r1 - r2);
        m = Math.pow(10, Math.max(r1, r2));
        if (c > 0) {
            var cm = Math.pow(10, c);
            if (r1 > r2) {
                arg1 = Number(arg1.toString().replace(".", ""));
                arg2 = Number(arg2.toString().replace(".", "")) * cm;
            } else {
                arg1 = Number(arg1.toString().replace(".", "")) * cm;
                arg2 = Number(arg2.toString().replace(".", ""));
            }
        } else {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", ""));
        }
        return (arg1 + arg2) / m;
    }


    /**
     ** 减法函数，用来得到精确的减法结果
     ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
     ** 调用：accSub(arg1,arg2)
     ** 返回值：arg1加上arg2的精确结果
     **/
    function accSub(arg1, arg2) {
        var r1, r2, m, n;
        try {
            r1 = arg1.toString().split(".")[1].length;
        }
        catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        }
        catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
        n = (r1 >= r2) ? r1 : r2;
        return ((arg1 * m - arg2 * m) / m).toFixed(n);
    }


    /**
     ** 乘法函数，用来得到精确的乘法结果
     ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
     ** 调用：accMul(arg1,arg2)
     ** 返回值：arg1乘以 arg2的精确结果
     **/
    function accMul(arg1, arg2) {
        var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length;
        }
        catch (e) {
        }
        try {
            m += s2.split(".")[1].length;
        }
        catch (e) {
        }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    }

    var $bottomTools = $('.bottom_tools');

    //回到顶部按钮
    $(function () {
        $('#scrollUp').click(function (e) {
            e.preventDefault();
            $('html,body').animate({ scrollTop: 0 });
        });

    });




    //判断用户是否登陆
    var LoginSign = "";

    //保存购物车当中商品id以及购物车数量和总价
    var saveCartProductIdAndCartInfo = "";

    //定义Cookie
    var strCookie = "";


    var getSign = true;
    var SHOWNUM = 10;
    var IsGetSign = true;
    var num = 2;


    /*********************************************用户未登陆时候添加购物车***************************************************/
    function saveCartWithNotLogin(productid, productnum, cartnum, cartprice) {
        //判断saveCartProductId是否有值
        if (saveCartProductIdAndCartInfo == "") {
            saveCartProductIdAndCartInfo = productid;
        }
        else {
            saveCartProductIdAndCartInfo += "," + productid;
        }


        //保存到cookie
        document.cookie = productid + "_productid=" + productid;
        document.cookie = productid + "_productnum=" + productnum;
        document.cookie = "cartnum=" + cartnum;
        document.cookie = "cartprice=" + cartprice;
        strCookie = document.cookie;
        return;
    }
    /************************************************************************************************************************/


    /*********************************************用户未登陆时候取消购物车***************************************************/
    function clearCartWithNotLogin(productid, productnum, cartnum, cartprice) {

        //清除指定cookie
        deleteProductidCookie(productid);
        deleteProductnumCookie(productid);
        //保存到cookie
        document.cookie = "cartnum=" + cartnum;
        document.cookie = "cartprice=" + cartprice;
        return;
    }
    /************************************************************************************************************************/

    //如果用户没有登陆,就获取cookie里面的值
    //如果用户登录了,就将用户购物车内的商品跟cookie里面的商品合并,再保存在cookie里面
    function getCartCookie() {
        //获取cookie
        strCookie = document.cookie;
        //alert(strCookie);
        //切割cookie
        var arrCookie = strCookie.split("; ");
        //购物车信息
        var cartnum = "";
        var carprice = "";
        //商品数量
        var saveProductnum = "";



        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if (arr[0].indexOf("_productid") > 0) {
                if (saveCartProductIdAndCartInfo == "") {
                    saveCartProductIdAndCartInfo = arr[1];
                    for (var j = 0; j < arrCookie.length; j++) {
                        var arr2 = arrCookie[j].split("=");
                        if (arr2[0] == arr[1] + "_productnum") {
                            saveProductnum = arr2[1];
                            break;
                        }
                    }
                }
                else {
                    saveCartProductIdAndCartInfo += "," + arr[1];
                    for (var j = 0; j < arrCookie.length; j++) {
                        var arr2 = arrCookie[j].split("=");
                        if (arr2[0] == arr[1] + "_productnum") {
                            saveProductnum += "," + arr2[1];
                            break;
                        }
                    }
                }
            }
            if (arr[0] == "cartnum") {
                cartnum = "cartnum=" + arr[1];
            }
            if (arr[0] == "cartprice") {
                carprice = "carprice=" + arr[1];
            }
        }
        //将信息拼接
        saveCartProductIdAndCartInfo = (saveCartProductIdAndCartInfo.split('_').length > 0 ? saveCartProductIdAndCartInfo.split('_')[0] : saveCartProductIdAndCartInfo) + "_" + cartnum + "&" + carprice + "|" + saveProductnum;
        return saveCartProductIdAndCartInfo == "_&" ? "" : saveCartProductIdAndCartInfo;
    }

    $.ajax({
        url: '/control/Tool/IsLogin.ashx',
        type: 'get',
        contenType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (data2) {
            LoginSign = data2.returnMsg;
            if (LoginSign == "SessionIsNull") {

            }
            else {
                //判断用户是否登陆了
                //如果是则获取用户购物车内商品信息
                if (LoginSign != "SessionIsNull") {

                    //显示用户余额
                    $('#userMoney').text(LoginSign);
                    //显示用户积分
                    $('#userPoints').text(data2.uPoints);

                    //如果是首次登陆,就获取用户添加过购物车的商品和未添加的商品进行合并
                    if (data2.isFristLogin) {
                        //strCookie = document.cookie;
                        //getUserCartInfo(strCookie);
                    }
                }
                $("#cMine").attr("style", "display:none");
                $("#cMine2").attr("style", "display:block; background: url(../resource/img/mine3.png) no-repeat center center; width: 2.8em; height: 2.8em;");
            }

        },
        complete: function (xhr, status) {
            //显示产品
            showProductAction();
            return;
        }
    });




    //左侧栏显示
    $('#cMine2').click(function () {
        $('#cFixedMenuBoxIndex2').toggle();
        if ($('#cFixedMenuIndex2').hasClass('cMenuOff')) {
            $('#cFixedMenuIndex2').removeClass('cMenuOff');
            $('#cFixedMenuIndex2').addClass('cMenuOn');
        } else if ($('#cFixedMenuIndex2').hasClass('cMenuOn')) {
            $('#cFixedMenuIndex2').removeClass('cMenuOn');
            $('#cFixedMenuIndex2').addClass('cMenuOff');
        }
    })

    //左侧栏关闭
    $('#cFixedClosed2').click(function () {
        $('#cFixedMenuBoxIndex2').hide();
        $('#cFixedMenuIndex2').removeClass('cMenuOn');
        $('#cFixedMenuIndex2').addClass('cMenuOff');
    })


    //新品预定关闭 
    $('#cFixedClosed1').click(function () {
        hiddenProductBook();
        return;
    });

    //关闭
    $('#cFixedClosed').click(function () {
        return;
    });




    //显示产品
    function showProductAction() {
        //显示首页所有产品信息,如果是选择显示我的菜篮,则显示我的菜篮
        if ($.getUrlVar("IsMyBasket") != null) {
            //去除导航中所有样式
            $('.mSign').removeClass('cur');
            //选中我的菜篮样式
            $("#m3").addClass('cur');
            //显示我的菜篮
            menu("2")
        }
        else {
            //显示首页
            menu("1");
        }
    }

    //滚动加载
    function scrollShowProduct(classname, shownum, sign) {
        $(window).unbind();
        var range = 50;             //距下边界长度/单位px 
        var elemt = 500;           //插入元素高度/单位px
        var maxnum = 100;            //设置加载最多次数
        var maxnum = 100;            //设置加载最多次数

        var bitransDelay = (function () {
            var timer = 0;
            return function (callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();

        var totalheight = 0;
        bitransDelay(function () {
            $(window).scroll(function (e) {
                var scrollHeight = $(document).height();
                var scrollTop = $(window).scrollTop();
                var $windowHeight = $(window).innerHeight();
                scrollTop > 50 ? $("#scrollUp").fadeIn(200).css("display", "block") : $("#scrollUp").fadeOut(200);
                $bottomTools.css("bottom", scrollHeight - scrollTop > $windowHeight ? 100 : $windowHeight + scrollTop + 100 - scrollHeight);

                var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
                totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
                if (($(document).height() - range) <= totalheight + 400 && num != maxnum && getSign && IsGetSign) {
                    IsGetSign = false;
                    classname(num, shownum, $("#typeSign").val(), $("#arrayNumSign").val(), 1);
                    num++;
                }
                return;
            });
        }, 1000);
        //显示所有产品
        classname("1", shownum, $("#typeSign").val(), $("#arrayNumSign").val(), sign);
    }


    //点击搜索
    $('#cSearchBtn').click(function () {
        //将原本的typeSign记录下来
        $("#searchSign").val($("#typeSign").val());
        //将点击类型改成-1
        $("#typeSign").val("-1");

        var cSearchVal = $('#cSearch2').val();
        if (cSearchVal == "") {
            showTip("请输入搜索内容");
        }
        $.ajax({
            url: '/control/Product/SearchProduct.ashx?cSearchVal=' + cSearchVal,
            type: 'get',
            async: "false",      //ajax同步
            dataType: "json",
            success: function (data) {
                if (data.Message == "NetworkError") {
                    alert("网络异常");
                    return;
                }
                //搜索不出商品
                if (data.Status == "0" || data.Status == 0) {
                    //显示新品预定界面,隐藏不必要界面
                    $('#cSearchInfo').attr("style", "display:block");
                    $('#cQuickMenu').attr("style", "display:none");
                    $('#cMenuDiv').attr("style", "display:none");
                    $('#cScList').attr("style", "display:none");

                    return;
                }
                //清空clearfix下的子元素
                $('#clearfix').empty();
                //遍历查询出来的商品
                ergodicProduct(data);
                return;
            }
        });
    });

    //实时测试输入文本
    $('#cSearch2').bind('input propertychange', function () {
        if ($('#cSearchInfo').attr("style").indexOf("block") > 0) {
            hiddenProductBook();
        }

        return;
    });


    //搜索返回
    $("#ExitsSearch").click(function () {
        hiddenProductBook();
        return;
    });


    //去除导航选中样式
    $('.mSign').click(function () {
    	
    	if($(this).hasClass('m4')){
    		return false;
    	}
    	
        $('.mSign').removeClass('cur');
    });

    //新品预定确定
    $('#cBtnMS').click(function () {
        addBookNewProduct($('#cPM').val(), $('#cGG').val(), $('#cSL').val(), $('#cMS').val());
        return;
    });

    //设置数组
    var array_0;
    var array_1;
    var array_2;
    var array_product;

    //遍历类型
    //二级导航
    function menu(e) {

        //获取导航有多少子元素
        var menuLen = $("#cMenu2 >li").length;

        //初始化menu的点击事件
        $("#cMenu2 li").each(function (i) {
            
        	productTypeClick("li_" + $(this).attr("typeid"), i);

        });

        //初始化数组
        if (menuLen >= 1) {
            //初始化一维数组
            array_0 = new Array(menuLen - 1);
            array_1 = new Array(menuLen - 1);
            array_2 = new Array(menuLen - 1);

            //初始化二维数组
            for (var j = 0; j < menuLen * 2; j++) {
                array_0[j] = new Array();
                array_1[j] = new Array();
                array_2[j] = new Array();
            }
        }

        //判断是显示全部商品,还是现实我的菜篮
        if (e == "1") {
            //全部商品
            NavBtnClick("1", 0);
        }
        else {
            //我的菜篮
            NavBtnClick("3", 1);
        }

        //异步加载产品
        asyncGetProduct();
    }

    //商品分类
    $("#m1").click(function () {
        NavBtnClick("1", 1);
    });

    //应季商品
    $("#m2").click(function () {
        NavBtnClick("2", 1);
    });

    //我的菜篮
    $("#m3").click(function () {
        NavBtnClick("3", 1);
    });

    //商品分类，应季商品，我的菜篮事件
    function NavBtnClick(e, sign) {
        $("#m" + e).addClass('cur');
        //清空clearfix下的子元素
        if (sign == 1) {
            $('#clearfix').empty();
        }
        
        
        // tangqy add
        var html = '';
        if(e=='1'){
        	html = '<li class="clearfix li" sku_id="88" cart_price="3.4" cart_id="243" alldataidex="0"><div id="pic_243" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150617/T50x65_201506172150584916992.jpg"></div><div class="txt"><h3>西红柿(精品)  果形圆润，色泽鲜红/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.4</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_243" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_243" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.37" cart_id="27" alldataidex="0"><div id="pic_27" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152111472034677.jpg"></div><div class="txt"><h3>油麦菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.37</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_27" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_27" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="3.43" cart_id="45" alldataidex="0"><div id="pic_45" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152125236785294.jpg"></div><div class="txt"><h3>茼蒿/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.43</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_45" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_45" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.55" cart_id="22" alldataidex="0"><div id="pic_22" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150728/T50x65_201507281318565538750.jpg"></div><div class="txt"><h3>精品香菜(大叶)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.55</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_22" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_22" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.53" cart_id="24" alldataidex="0"><div id="pic_24" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152046447566652.jpg"></div><div class="txt"><h3>菠菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.53</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_24" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_24" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.25" cart_id="25" alldataidex="0"><div id="pic_25" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152109170650095.jpg"></div><div class="txt"><h3>大油菜(普通)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.25</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_25" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_25" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="2" cart_id="26" alldataidex="0"><div id="pic_26" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152110009313425.jpg" alt=""></div><div class="txt"><h3>小油菜(精品)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>2</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_26" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_26" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.2" cart_id="28" alldataidex="0"><div id="pic_28" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152112409223273.jpg" alt=""></div><div class="txt"><h3>散叶生菜/大叶生菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.2</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_28" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_28" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.6" cart_id="42" alldataidex="0"><div id="pic_42" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152124041084269.jpg" alt=""></div><div class="txt"><h3>蒿子杆/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.6</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_42" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_42" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="0.9" cart_id="36" alldataidex="0"><div id="pic_36" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152120453462019.jpg" alt=""></div><div class="txt"><h3>圆白菜(普通)（3斤起订，请注意起订量）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>0.9</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_36" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_36" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
        } else if(e=='2'){
        	html = '<li class="clearfix li" sku_id="88" cart_price="4.75" cart_id="52" alldataidex="0"><div id="pic_52" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152130076495728.jpg"></div><div class="txt"><h3>木耳(鲜 精品小个散装）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>4.75</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_52" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_52" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="2.05" cart_id="70" alldataidex="0"><div id="pic_70" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152145364845882.jpg"></div><div class="txt"><h3>地耳(湿) /斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>2.05</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_70" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_70" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="4.75" cart_id="193" alldataidex="0"><div id="pic_193" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152352167347453.jpg"></div><div class="txt"><h3>鲜香菇(精品)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>4.75</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_193" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_193" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="50" cart_id="185" alldataidex="0"><div id="pic_185" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152348287190607.jpg"></div><div class="txt"><h3>金针菇(华绿) （150g×34/包)/件</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>50</em> 元/件<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_185" class="cBtnNum" type="button" value="1"><span>件</span></p><p class="p2"><input id="pro_185" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="19" cart_id="190" alldataidex="0"><div id="pic_190" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152349465158392.jpg"></div><div class="txt"><h3>平菇（优质）（4斤）/盒</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>19</em> 元/盒<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_190" class="cBtnNum" type="button" value="1"><span>盒</span></p><p class="p2"><input id="pro_190" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="4.45" cart_id="192" alldataidex="0"><div id="pic_192" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152351318186697.jpg"></div><div class="txt"><h3>鲜香菇(普通)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>4.45</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_192" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_192" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="38" cart_id="168" alldataidex="0"><div id="pic_168" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152320103274656.jpg" alt=""></div><div class="txt"><h3>大葱(粗)(约20斤)/捆</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>38</em> 元/捆<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_168" class="cBtnNum" type="button" value="1"><span>捆</span></p><p class="p2"><input id="pro_168" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="0.85" cart_id="171" alldataidex="0"><div id="pic_171" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152323116383667.jpg" alt=""></div><div class="txt"><h3>白洋葱/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>0.85</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_171" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_171" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.25" cart_id="172" alldataidex="0"><div id="pic_172" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150728/T50x65_201507281317298663750.jpg" alt=""></div><div class="txt"><h3>红洋葱/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.25</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_172" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_172" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="3.88" cart_id="173" alldataidex="0"><div id="pic_173" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150921/T50x65_201509211503058759765.jpg" alt=""></div><div class="txt"><h3>大蒜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.88</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_173" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_173" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
        } else if(e=='3'){
        	html = '<li class="clearfix li" sku_id="88" cart_price="7.05" cart_id="144" alldataidex="0"><div id="pic_144" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152235563269577.jpg"></div><div class="txt"><h3>节瓜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>7.05</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_144" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_144" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="12.55" cart_id="142" alldataidex="0"><div id="pic_142" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152235213412393.jpg"></div><div class="txt"><h3>苜蓿菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>12.55</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_142" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_142" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.95" cart_id="148" alldataidex="0"><div id="pic_148" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152243111879314.jpg"></div><div class="txt"><h3>小白冬瓜/迷你冬瓜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.95</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_148" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_148" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="8.5" cart_id="147" alldataidex="0"><div id="pic_147" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152242125391950.jpg"></div><div class="txt"><h3>丝瓜尖/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>8.5</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_147" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_147" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="2.85" cart_id="146" alldataidex="0"><div id="pic_146" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152241082839564.jpg"></div><div class="txt"><h3>广茄/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>2.85</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_146" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_146" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="25.95" cart_id="132" alldataidex="0"><div id="pic_132" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152229154443769.jpg"></div><div class="txt"><h3>马家沟芹菜   (约3.5斤）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>25.95</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_132" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_132" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="5.95" cart_id="123" alldataidex="0"><div id="pic_123" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152223554373705.jpg" alt=""></div><div class="txt"><h3>罗马生/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>5.95</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_123" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_123" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.5" cart_id="124" alldataidex="0"><div id="pic_124" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152224323158695.jpg" alt=""></div><div class="txt"><h3>九层塔/鲜香叶/罗勒叶/ 两</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.5</em> 元/两<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_124" class="cBtnNum" type="button" value="1"><span>两</span></p><p class="p2"><input id="pro_124" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="9.5" cart_id="119" alldataidex="0"><div id="pic_119" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152221053384290.jpg" alt=""></div><div class="txt"><h3>紫苏叶(鲜)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>9.5</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_119" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_119" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="5.3" cart_id="120" alldataidex="0"><div id="pic_120" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152221545749890.jpg" alt=""></div><div class="txt"><h3>银芽/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>5.3</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_120" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_120" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
        }
        $('#clearfix').html(html);
        
        
        
        
        //初始化滚动参数
        initScorllPara();
        //改变导航clickSign
        $('#clickSign').val(e);
        //记录切换的类型编号
        $("#typeSign").val(getMenuFirstTypeId());
        //记录array的编号
        $("#arrayNumSign").val("0");
        //分页显示所有商品
        ////////scrollShowProduct(showAllProductType, SHOWNUM, sign);
        //选中“全部”
        productTypeClickFirst();
    }

    //最新动态
    $("#m4").click(function () {
        //$("#m4").addClass('cur');
    	showTip("暂无动态");
    });

    //获取二级导航的第一个类型ID
    function getMenuFirstTypeId() {
        return $("#cMenu2 >li:first-child").attr("typeid");
    }

    //去除导航选中样式并选择第一个导航
    function clearNavCSS() {
        $('.mSign').removeClass('cur');
        $("#m1").addClass('cur');
    }



    //显示首页所有产品数据
    function showAllProduct(pn, ps) {
        if (array_0[0][pn - 1] != null) {
            ergodicProduct(array_0[0][pn - 1]);
            IsGetSign = true;
            return;
        } else {
            $.ajax({
                url: "/control/Product/index.ashx?IsAll=1&productId=118&pageNum=" + pn + "&pageSize=" + ps,
                type: 'get',
                contenType: "application/json; charset=utf-8",
                dataType: "json",
                async: false,
                success: function (data) {
                    if (data.Message == "NetworkError") {
                        showTip("网络不给力..请刷新页面！");
                        return;
                    }
                    //判断能否拉出数据
                    if (data.Status == "0") {
                        getSign = false;
                        return;
                    }
                    //遍历商品
                    array_product = data;
                    array_0[0][pn - 1] = array_product;
                    ergodicProduct(data);

                    return;
                },
                complete: function (xhr, status) {
                    IsGetSign = true;
                    return;
                }
            });
        }
    }

    //遍历每个产品类型下的商品
    function showAllProductType(pn, ps, productTypeId, e, sign) {
        //productTypeId == -1是否是搜索
        if (productTypeId == "-1") {
            return;
        }
        var clickSignNum = $('#clickSign').val();
        var IsAll = $("#li_" + productTypeId).attr("allSign");
        //我的菜篮
        if (clickSignNum == 3) {
            if (array_2[e][pn - 1] == "nil") {
                return;
            }
            if (array_2[e][pn - 1] != null) {
                ergodicProduct(array_2[e][pn - 1]);
                IsGetSign = true;
                return;
            }
            else {
                $.ajax({
                    url: "/control/Product/MyBasket.ashx?IsAll=" + IsAll + "&categroyId=" + productTypeId + "&pageNum=" + pn + "&pageSize=" + ps,
                    type: 'get',
                    contenType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if (data.Message == "NetworkError") {
                            showTip("网络不给力..请刷新页面！");
                            return;
                        }
                        if (data.Status == 0) {
                            //showTip("商品已经显示完:)");
                            array_product = "nil";
                            array_2[e][pn - 1] = array_product;
                            getSign = false;
                            return;
                        }
                        //遍历商品
                        array_product = data;
                        array_2[e][pn - 1] = array_product;
                        ergodicProduct(data);
                        return;
                    },
                    complete: function (xhr, status) {
                        IsGetSign = true;
                        return;
                    }
                });
            }
        }
            //应季推荐
        else if (clickSignNum == 2) {
            if (array_1[e][pn - 1] == "nil") {
                return;
            }
            if (array_1[e][pn - 1] != null) {
                ergodicProduct(array_1[e][pn - 1]);
                IsGetSign = true;
                return;
            }
            else {
                $.ajax({
                    url: "/control/Product/RecommendProduct.ashx?IsAll=" + IsAll + "&categroyId=" + productTypeId + "&pageNum=" + pn + "&pageSize=" + ps,
                    type: 'get',
                    contenType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if (data.Message == "NetworkError") {
                            showTip("网络不给力..请刷新页面！");
                            return;
                        }
                        if (data.Status == 0) {
                            //showTip("商品已经显示完:)");
                            array_product = "nil";
                            array_1[e][pn - 1] = array_product;
                            getSign = false;
                            return;
                        }
                        //遍历商品
                        array_product = data;
                        array_1[e][pn - 1] = array_product;
                        ergodicProduct(data);
                        return;
                    },
                    complete: function (xhr, status) {
                        IsGetSign = true;
                        return;
                    }
                });
            }
        }
            //商品
        else if (clickSignNum == 1) {
            if (array_0[e][pn - 1] == "nil") {
                return;
            }
            if (array_0[e][pn - 1] != null) {
                ergodicProduct(array_0[e][pn - 1]);
                IsGetSign = true;
                return;
            }
            else {
                var indexRequest = $.ajax({
                    url: "/control/Product/index.ashx?IsAll=" + IsAll + "&productId=" + productTypeId + "&pageNum=" + pn + "&pageSize=" + ps,
                    type: 'get',
                    contenType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    timeout: 3000,
                    success: function (data) {
                        if (data.Message == "NetworkError") {
                            showTip("网络不给力..请刷新页面！");
                            return;
                        }
                        if (data.Status == 0) {
                            //showTip("商品已经显示完:)");
                            array_product = "nil";
                            array_0[e][pn - 1] = array_product;
                            getSign = false;
                            return;
                        }
                        //遍历商品
                        array_product = data;
                        array_0[e][pn - 1] = array_product;
                        if (sign == 0) {
                            $('#clearfix').empty();
                        }
                        ergodicProduct(data);
                        return;
                    },
                    complete: function (xhr, status) {
                        if (status == 'timeout') {//超时,status还有success,error等值的情况
                            indexRequest.abort(); //取消请求
                            showTip("网络不给力>_<");
                        }
                        IsGetSign = true;
                        return;
                    }
                });
            }
        }
    }

    //异步加载读取产品
    function asyncGetProduct() {
        asyncLoadProduct(1, SHOWNUM, 1);
    }

    //异步加载数据
    function asyncLoadProduct(pn, ps, sign) {
        var getAllProduct = $.ajax({
            url: "/control/Product/asyncGetAllProduct.ashx?pageNum=" + pn + "&pageSize=" + ps,
            type: 'get',
            contenType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            success: function (data) {
                if (data.Message == "NetworkError") {
                    showTip("网络不给力..请刷新页面！");
                    return;
                }
                if (data.Status == -1) {
                    showTip("网络不给力..请刷新页面！");
                    return;
                }
                for (var t = 0; t < data.Result.length; t++) {
                    if (t % 3 == 0) {
                        array_0[parseInt(t / 3)][pn - 1] = data.Result[t] == null ? "nil" : data.Result[t];
                    } else if (t % 3 == 1) {
                        array_1[parseInt(t / 3)][pn - 1] = data.Result[t] == null ? "nil" : data.Result[t];
                    }
                    else {
                        array_2[parseInt(t / 3)][pn - 1] = data.Result[t] == null ? "nil" : data.Result[t];
                    }
                }
                return;
            },
            complete: function (xhr, status) {
                //如果状态为成功时候,就重新调用自己
                if (status == "success") {
                    //预加载
                    if (sign < 3) {
                        asyncLoadProduct(++pn, ps, ++sign);
                    }
                }
                if (status == 'timeout') {//超时,status还有success,error等值的情况
                    getAllProduct.abort(); //取消请求
                    //showTip("网络不给力>_<");
                }
                return;
            }
        });
    }

    //产品字符串
    function ProductStr(productid, imgUrl, productName, shortdescription, lowestsaleprice, IsBuy, productNum, unit) {
        var picBuy = "";
        var disabled = 'cBtnBuyCart';
        var buyStr = "直接购买";
        if (IsBuy == "1") {
            picBuy = "picBuy";
            disabled = "cBtnCancel";
            buyStr = "取消购买";
        }


        var listStr = "";
        listStr = "<li class='clearfix li' sku_id='88' cart_price='" + lowestsaleprice + "' cart_id='" + productid + "' alldataidex='0'>";
        listStr += "<div id='pic_" + productid + "' class='pic " + picBuy + "'>";
        listStr += "<img width='100%' img-src='http://110.172.215.228:8800" + imgUrl + "' alt=''>";
        listStr += "</div>";
        listStr += "<div class='txt'>";
        listStr += "<h3>" + productName + "</h3>";
        listStr += "<div class='d1'></div>";
        listStr += "<div class='d1'>" + shortdescription + "</div>";
        listStr += "<div class='d2'>";
        listStr += "<span class='tit'>单价：</span>";
        listStr += "<p><em>" + lowestsaleprice + "</em> 元/" + unit + "<br></p>";
        listStr += "</div>";
        listStr += "</div>";
        listStr += "<div class='btnWrap'>";
        listStr += "<p class='p1'><input id='buyNum_" + productid + "' class='cBtnNum' type='button' value='" + productNum + "'><span>" + unit + "</span></p>";
        listStr += "<p class='p2'><input id='pro_" + productid + "' class='cBtnBuy " + disabled + "' type='button' value='取消'><span buy='直接购买' del='取消购买'>" + buyStr + "</span></p></div></li>"
        return listStr;
    }

    //遍历商品,根据data
    function ergodicProduct(data) {
        //将异步获取的数据,进行赋值
        if (data.length != null) {
            data.Result = data;
        }
        //获取购物车cookie
        saveCartProductIdAndCartInfo = "";
        saveCartProductIdAndCartInfo = getCartCookie();

        //判断cookie是否有数据
        if (saveCartProductIdAndCartInfo != "") {
            //剪切出购物车信息
            var cartInfo = saveCartProductIdAndCartInfo.split("_")[1];
            var cartnum = cartInfo.split('&')[0];
            var cartprice = cartInfo.split('&')[1].toString().split('|')[0];

            //购物车栏,显示数量和价格
            $('#type').text(Number(cartnum.split('=')[1]) <= 0 ? "0" : cartnum.split('=')[1]);
            $('#cTotalPrice').text(Number(cartprice.split('=')[1]) <= 0 ? "0" : cartprice.split('=')[1]);
        }

        //alert(saveCartProductIdAndCartInfo);

        //获取saveCartProductIdAndCartInfo里面的商品ID
        var CartProductId = "";
        if (saveCartProductIdAndCartInfo != "") {
            CartProductId = saveCartProductIdAndCartInfo.split('_')[0];
        }
        //获取saveCartProductIdAndCartInfo里面的商品数量
        var CartProductNum = "";
        if (saveCartProductIdAndCartInfo != "") {
            CartProductNum = saveCartProductIdAndCartInfo.split('|')[1];
        }
        //alert(CartProductNum);

        //遍历商品
        for (var i = 0; i < data.Result.length; i++) {
            var pid = data.Result[i]._productid;
            //判断是否购买过
            var flag = false;
            //记录购买过商品的数量
            var pnum = "1";


            //判断是否购买过
            for (var j = 0; j < CartProductId.split(',').length; j++) {
                if (CartProductId.split(',')[j] == pid) {
                    flag = true;
                    pnum = CartProductNum.split(',')[j];
                    break;
                }
            }
            //遍历添加购买过样式
            if (flag) {
                $('#clearfix').append(ProductStr(pid, data.Result[i]._thumbnailurl1.replace('{0}', 'T50x65_'), data.Result[i]._productname, data.Result[i]._shortdescription, data.Result[i]._lowestsaleprice, "1", pnum, data.Result[i]._unit));
            }
                //遍历不同商品
            else {
                $('#clearfix').append(ProductStr(pid, data.Result[i]._thumbnailurl1.replace('{0}', 'T50x65_'), data.Result[i]._productname, data.Result[i]._shortdescription, data.Result[i]._lowestsaleprice, "0", "1", data.Result[i]._unit));
            }
            //商品点击购买或取消事件事件
            productClickBuyOrCancel(data.Result[i]._productid, data.Result[i]._lowestsaleprice);

        }

        lazyImg();
    }


    //商品点击购买或取消事件事件
    function productClickBuyOrCancel(productid, lowestsaleprice) {
        $("#pro_" + productid).click(function () {
            //判断样式,如果样式包含了购买样式,就进行购买商品,
            if ($("#pro_" + productid).hasClass("cBtnBuyCart")) {
                //改变购买样式
                $("#pro_" + productid).removeClass("cBtnBuyCart");
                $("#pro_" + productid).addClass("cBtnCancel");
                $("#pic_" + productid).addClass("picBuy");
                //获取当前购物车商品数量
                var cartNum = Number($("#type").text());
                //将购物车商品数量增加1
                cartNum = cartNum + 1;
                $("#type").text(cartNum);

                //获取当前购物车商品总价
                var cartPrice = Number($("#cTotalPrice").text());


                /********************************将购物车商品总价增加*********************************/
                var ProductNum = Number($("#buyNum_" + productid).val());//获取商品个数
                //判断商品数量是否小于1
                if (Number(lowestsaleprice) <= 0) {
                    lowestsaleprice = "100";
                }
                if (ProductNum <= 0) {
                    ProductNum == 1;
                }
                //总价
                cartPrice = accAdd(cartPrice, accMul(ProductNum, lowestsaleprice));//
                $("#cTotalPrice").text(cartPrice);
                /**************************************************************************************/


                /**********************************判断是否登陆,若登陆,添加到购物车,没登陆,添加到cookie***************************************/
                saveCartWithNotLogin(productid, ProductNum, cartNum, cartPrice);
                if (LoginSign != "SessionIsNull") {
                    //addProductToCart(productid, ProductNum);
                }
                /*****************************************************************************************************************************/
            }
                //否者,就进行取消购买时间
            else {
                //去除取消样式
                $("#pro_" + productid).removeClass("cBtnCancel");
                $("#pic_" + productid).removeClass("picBuy");
                $("#pro_" + productid).addClass("cBtnBuyCart");
                //获取当前购物车商品数量
                var cartNum = Number($("#type").text());
                //将购物车商品数量减1
                cartNum = cartNum - 1;
                if (cartNum <= 0) {
                    cartNum = 0;
                }
                $("#type").text(cartNum);

                //获取当前购物车商品总价
                var cartPrice = Number($("#cTotalPrice").text());

                /********************************将购物车商品总价减掉*********************************/
                var ProductNum = Number($("#buyNum_" + productid).val());//获取商品个数
                //判断商品数量是否小于1
                if (Number(lowestsaleprice) <= 0) {
                    lowestsaleprice = "100";
                }
                if (ProductNum <= 0) {
                    ProductNum == 1;
                }
                //总价
                cartPrice = accSub(cartPrice, accMul(ProductNum, lowestsaleprice));//
                if (cartNum == 0 || cartNum == "0") {
                    cartPrice = 0;
                }
                if (cartPrice <= 0) {
                    cartPrice = 0;
                }
                $("#cTotalPrice").text(cartPrice);
                /**************************************************************************************/

                /**********************************判断是否登陆,若登陆,添加到购物车,没登陆,添加到cookie***************************************/
                clearCartWithNotLogin(productid, "1", cartNum, cartPrice);
                if (LoginSign != "SessionIsNull") {
                    //deleteCartProductByPids(productid);
                }
                /*****************************************************************************************************************************/
            }
        });
    }



    //添加预订商品
    function addBookNewProduct(Name, Specifications, Number, Remark) {
        //判断用户是否登陆
        if (LoginSign == "SessionIsNull") {
            alert("请先登录");
            window.location = "/Web/passport/login.html";
            return;
        }
        /**判断是否为空**/
        if (Name.replace(" ", "") == "") {
            showTip("请输入商品名称");
            return;
        }
        if (Specifications.replace(" ", "") == "") {
            showTip("请输入商品规格");
            return;
        }
        if (Number.replace(" ", "") == "") {
            showTip("请输入商品数量");
            return;
        }
        /****************/
        $.ajax({
            url: '/control/Product/AddNewBookProduct.ashx',
            type: 'post',
            contenType: "application/json; charset=utf-8",
            dataType: "json",
            data: { "Name": Name, "Specifications": Specifications, "Number": Number, "Remark": Remark },
            success: function (data) {
                if (data.Message == "userId_Is_Null") {
                    alert("请先登录");
                    window.location = "/Web/passport/login.html";
                    return;
                }
                showTip(data.Message);
                if (data.Message.indexOf("成功") > 0) {
                    //$('#cFixedClosed1').click();
                }
                return;
            }
        });
    }

    //产品类型点击事件
    function productTypeClick(id, e) {
        $('#' + id).click(function () {
            //清空选中样式
            $('.productTypeC').removeClass('cur');
            //加上选中样式
            $('#' + this.id).addClass('cur');
            //清空clearfix下的子元素
            $('#clearfix').empty();
            //初始化滚动参数
            initScorllPara();
            //记录切换的类型编号
            $("#typeSign").val(this.id.split('_')[1].toString().replace(" ", ""));
            //记录array的编号
            $("#arrayNumSign").val(e);
            //加载数据
            //scrollShowProduct(showAllProductType, SHOWNUM, 1);
            
            
            var html = '';
            if(e=='0') {
            	html = '<li class="clearfix li" sku_id="88" cart_price="3.4" cart_id="243" alldataidex="0"><div id="pic_243" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150617/T50x65_201506172150584916992.jpg"></div><div class="txt"><h3>西红柿(精品)  果形圆润，色泽鲜红/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.4</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_243" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_243" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.37" cart_id="27" alldataidex="0"><div id="pic_27" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152111472034677.jpg"></div><div class="txt"><h3>油麦菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.37</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_27" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_27" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="3.43" cart_id="45" alldataidex="0"><div id="pic_45" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152125236785294.jpg"></div><div class="txt"><h3>茼蒿/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.43</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_45" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_45" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.55" cart_id="22" alldataidex="0"><div id="pic_22" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150728/T50x65_201507281318565538750.jpg"></div><div class="txt"><h3>精品香菜(大叶)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.55</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_22" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_22" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.53" cart_id="24" alldataidex="0"><div id="pic_24" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152046447566652.jpg"></div><div class="txt"><h3>菠菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.53</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_24" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_24" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.25" cart_id="25" alldataidex="0"><div id="pic_25" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152109170650095.jpg"></div><div class="txt"><h3>大油菜(普通)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.25</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_25" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_25" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="2" cart_id="26" alldataidex="0"><div id="pic_26" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152110009313425.jpg" alt=""></div><div class="txt"><h3>小油菜(精品)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>2</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_26" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_26" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.2" cart_id="28" alldataidex="0"><div id="pic_28" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152112409223273.jpg" alt=""></div><div class="txt"><h3>散叶生菜/大叶生菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.2</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_28" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_28" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.6" cart_id="42" alldataidex="0"><div id="pic_42" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152124041084269.jpg" alt=""></div><div class="txt"><h3>蒿子杆/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.6</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_42" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_42" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="0.9" cart_id="36" alldataidex="0"><div id="pic_36" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152120453462019.jpg" alt=""></div><div class="txt"><h3>圆白菜(普通)（3斤起订，请注意起订量）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>0.9</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_36" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_36" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
            } else if(e=='1') {
            	html = '<li class="clearfix li" sku_id="88" cart_price="3.4" cart_id="243" alldataidex="0"><div id="pic_243" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150617/T50x65_201506172150584916992.jpg"></div><div class="txt"><h3>西红柿(精品)  果形圆润，色泽鲜红/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.4</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_243" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_243" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.37" cart_id="27" alldataidex="0"><div id="pic_27" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152111472034677.jpg"></div><div class="txt"><h3>油麦菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.37</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_27" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_27" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="3.43" cart_id="45" alldataidex="0"><div id="pic_45" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152125236785294.jpg"></div><div class="txt"><h3>茼蒿/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.43</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_45" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_45" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.55" cart_id="22" alldataidex="0"><div id="pic_22" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150728/T50x65_201507281318565538750.jpg"></div><div class="txt"><h3>精品香菜(大叶)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.55</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_22" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_22" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.53" cart_id="24" alldataidex="0"><div id="pic_24" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152046447566652.jpg"></div><div class="txt"><h3>菠菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.53</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_24" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_24" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.25" cart_id="25" alldataidex="0"><div id="pic_25" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152109170650095.jpg"></div><div class="txt"><h3>大油菜(普通)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.25</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_25" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_25" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="2" cart_id="26" alldataidex="0"><div id="pic_26" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152110009313425.jpg" alt=""></div><div class="txt"><h3>小油菜(精品)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>2</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_26" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_26" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.2" cart_id="28" alldataidex="0"><div id="pic_28" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152112409223273.jpg" alt=""></div><div class="txt"><h3>散叶生菜/大叶生菜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.2</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_28" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_28" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="1.6" cart_id="42" alldataidex="0"><div id="pic_42" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152124041084269.jpg" alt=""></div><div class="txt"><h3>蒿子杆/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>1.6</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_42" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_42" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="0.9" cart_id="36" alldataidex="0"><div id="pic_36" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150615/T50x65_201506152120453462019.jpg" alt=""></div><div class="txt"><h3>圆白菜(普通)（3斤起订，请注意起订量）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>0.9</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_36" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_36" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
            } else if(e=='2') {
            	html = '<li class="clearfix li" sku_id="88" cart_price="129" cart_id="281" alldataidex="0"><div id="pic_281" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081001278471953.jpg"></div><div class="txt"><h3>大烹大豆油（20L*1桶）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>129</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_281" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_281" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="145" cart_id="1045" alldataidex="0"><div id="pic_1045" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150716/T50x65_201507161701145198281.jpg"></div><div class="txt"><h3>福临门大豆油(5L* 4桶) /箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>145</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1045" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_1045" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="148" cart_id="1046" alldataidex="0"><div id="pic_1046" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150716/T50x65_201507161702434729531.jpg"></div><div class="txt"><h3>绿宝大豆油(5L* 4桶) /箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>148</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1046" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_1046" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="124" cart_id="278" alldataidex="0"><div id="pic_278" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507080953095112578.jpg"></div><div class="txt"><h3>汇福大豆油（5L*4桶） /箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>124</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_278" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_278" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="121" cart_id="280" alldataidex="0"><div id="pic_280" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150928/T50x65_201509281723064548907.jpg"></div><div class="txt"><h3>汇福大豆油（20L*1桶）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>121</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_280" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_280" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="128" cart_id="1056" alldataidex="0"><div id="pic_1056" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150716/T50x65_201507161721127385781.jpg"></div><div class="txt"><h3>假日棕榈油(20L*1桶) /箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>128</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1056" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_1056" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="149" cart_id="795" alldataidex="0"><div id="pic_795" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081038050034453.jpg" alt=""></div><div class="txt"><h3>金龙鱼大豆油（5L*4桶）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>149</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_795" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_795" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="138" cart_id="1048" alldataidex="0"><div id="pic_1048" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150716/T50x65_201507161705279104531.jpg" alt=""></div><div class="txt"><h3>火鸟大豆油(5L* 4桶) /箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>138</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1048" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_1048" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="130" cart_id="1044" alldataidex="0"><div id="pic_1044" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150716/T50x65_201507161659049104531.jpg" alt=""></div><div class="txt"><h3>元宝大豆油(5L* 4桶)/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>130</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1044" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_1044" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="128" cart_id="1052" alldataidex="0"><div id="pic_1052" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150716/T50x65_201507161712210510781.jpg" alt=""></div><div class="txt"><h3>益海嘉里元宝餐饮专用一级大豆油(10L* 2桶)/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>128</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1052" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_1052" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
            } else if(e=='3') {
            	html = '<li class="clearfix li" sku_id="88" cart_price="20" cart_id="378" alldataidex="0"><div id="pic_378" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081042454194609.jpg"></div><div class="txt"><h3>猪耳朵（熟）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>20</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_378" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_378" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="18.5" cart_id="380" alldataidex="0"><div id="pic_380" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081047525464140.jpg"></div><div class="txt"><h3>猪耳朵（真空包装）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>18.5</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_380" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_380" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="4.5" cart_id="384" alldataidex="0"><div id="pic_384" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081054312798125.jpg"></div><div class="txt"><h3>猪肺 熟食 (个约500g)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>4.5</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_384" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_384" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="18.5" cart_id="379" alldataidex="0"><div id="pic_379" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081044361323515.jpg"></div><div class="txt"><h3>猪肝真空包装（熟）（约2斤/袋）（按实际重量收费）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>18.5</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_379" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_379" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="54" cart_id="386" alldataidex="0"><div id="pic_386" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081057220200469.jpg"></div><div class="txt"><h3>牛腱子（真空包装）（按照实际重量收款）（单价27元*2斤）(约2斤)/袋</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>54</em> 元/袋<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_386" class="cBtnNum" type="button" value="1"><span>袋</span></p><p class="p2"><input id="pro_386" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="4.25" cart_id="549" alldataidex="0"><div id="pic_549" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081057396440703.jpg" alt=""></div><div class="txt"><h3>白玉鸡蛋豆腐/块</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>4.25</em> 元/块<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_549" class="cBtnNum" type="button" value="1"><span>块</span></p><p class="p2"><input id="pro_549" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="3.9" cart_id="646" alldataidex="0"><div id="pic_646" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081136178950469.jpg" alt=""></div><div class="txt"><h3>高碑店豆腐丝 /斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.9</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_646" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_646" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="3.5" cart_id="1030" alldataidex="0"><div id="pic_1030" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150713/T50x65_201507131142360508125.jpg" alt=""></div><div class="txt"><h3>豆皮（千张）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.5</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1030" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_1030" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="4.25" cart_id="1032" alldataidex="0"><div id="pic_1032" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150713/T50x65_201507131147150820625.jpg" alt=""></div><div class="txt"><h3>白玉韧豆腐 （360g）/盒</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>4.25</em> 元/盒<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1032" class="cBtnNum" type="button" value="1"><span>盒</span></p><p class="p2"><input id="pro_1032" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="3.31" cart_id="1029" alldataidex="0"><div id="pic_1029" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150713/T50x65_201507131137080976875.jpg" alt=""></div><div class="txt"><h3>白玉北豆腐/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>3.31</em> 元/盒<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_1029" class="cBtnNum" type="button" value="1"><span>盒</span></p><p class="p2"><input id="pro_1029" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
            } else if(e=='4') {
            	html = '<li class="clearfix li" sku_id="88" cart_price="45.42" cart_id="518" alldataidex="0"><div id="pic_518" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150707/T50x65_201507072151031587187.jpg"></div><div class="txt"><h3>肖老五火锅牛油  （5斤）/袋</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>45.42</em> 元/袋<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_518" class="cBtnNum" type="button" value="1"><span>袋</span></p><p class="p2"><input id="pro_518" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="39.92" cart_id="519" alldataidex="0"><div id="pic_519" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150707/T50x65_201507072151180493437.jpg"></div><div class="txt"><h3>牧哥牛油 （5斤）/袋</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>39.92</em> 元/袋<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_519" class="cBtnNum" type="button" value="1"><span>袋</span></p><p class="p2"><input id="pro_519" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="13.42" cart_id="435" alldataidex="0"><div id="pic_435" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150707/T50x65_201507072124182212187.jpg"></div><div class="txt"><h3>良姜/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>13.42</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_435" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_435" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="57.32" cart_id="436" alldataidex="0"><div id="pic_436" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081130062397734.jpg"></div><div class="txt"><h3>青麻椒粒（精品）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>57.32</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_436" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_436" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="54" cart_id="437" alldataidex="0"><div id="pic_437" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081131012466094.jpg"></div><div class="txt"><h3>花椒粒 (四川精品)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>54</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_437" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_437" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="58" cart_id="438" alldataidex="0"><div id="pic_438" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081132049731719.jpg"></div><div class="txt"><h3>麻椒粒（普通）/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>58</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_438" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_438" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="66" cart_id="439" alldataidex="0"><div id="pic_439" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081132517075469.jpg" alt=""></div><div class="txt"><h3>麻椒粒 (精品A级)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>66</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_439" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_439" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="110" cart_id="441" alldataidex="0"><div id="pic_441" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20151008/T50x65_201510081204502547656.jpg" alt=""></div><div class="txt"><h3>广味源胡椒粉（454g*20袋）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>110</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_441" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_441" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="52" cart_id="442" alldataidex="0"><div id="pic_442" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150707/T50x65_201507072125562055937.jpg" alt=""></div><div class="txt"><h3>大红袍花椒粒 /斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>52</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_442" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_442" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="45.6" cart_id="444" alldataidex="0"><div id="pic_444" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150708/T50x65_201507081138067739531.jpg" alt=""></div><div class="txt"><h3>花椒 (散装)/斤</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>45.6</em> 元/斤<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_444" class="cBtnNum" type="button" value="1"><span>斤</span></p><p class="p2"><input id="pro_444" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
            } else if(e=='5') {
            	html = '<li class="clearfix li" sku_id="88" cart_price="75" cart_id="857" alldataidex="0"><div id="pic_857" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092241261479765.jpg"></div><div class="txt"><h3>一次性餐盒520# （8包）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>75</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_857" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_857" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="80" cart_id="859" alldataidex="0"><div id="pic_859" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092242560386015.jpg"></div><div class="txt"><h3>塑料白色方餐盒450# （8包）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>80</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_859" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_859" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="120" cart_id="860" alldataidex="0"><div id="pic_860" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092243131323515.jpg"></div><div class="txt"><h3>塑料白色方餐盒600# （8包）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>120</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_860" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_860" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="135" cart_id="861" alldataidex="0"><div id="pic_861" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092244085854765.jpg"></div><div class="txt"><h3>塑料餐盒圆桶300# （450个）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>135</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_861" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_861" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="122" cart_id="862" alldataidex="0"><div id="pic_862" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092244344761015.jpg"></div><div class="txt"><h3>塑料餐盒圆桶450# （450个）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>122</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_862" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_862" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="150" cart_id="863" alldataidex="0"><div id="pic_863" class="pic "><img width="100%" alt="" src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092245196167265.jpg"></div><div class="txt"><h3>塑料餐盒圆桶500# （450个）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>150</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_863" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_863" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="90" cart_id="864" alldataidex="0"><div id="pic_864" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150820/T50x65_201508201630082382109.jpg" alt=""></div><div class="txt"><h3>白色无图纸碗 1000# /箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>90</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_864" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_864" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="70" cart_id="865" alldataidex="0"><div id="pic_865" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092246456323515.jpg" alt=""></div><div class="txt"><h3>透明小碗  360#（1080个）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>70</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_865" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_865" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="150" cart_id="866" alldataidex="0"><div id="pic_866" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092247124604765.jpg" alt=""></div><div class="txt"><h3>圆透明碗1000# （300套）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>150</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_866" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_866" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li><li class="clearfix li" sku_id="88" cart_price="170" cart_id="867" alldataidex="0"><div id="pic_867" class="pic "><img width="100%" img-src="http://110.172.215.228:8800/Upload/Shop/Images/ProductThumbs/20150709/T50x65_201507092247259136015.jpg" alt=""></div><div class="txt"><h3>圆透明碗1500# （200套）/箱</h3><div class="d1"></div><div class="d1"></div><div class="d2"><span class="tit">单价：</span><p><em>170</em> 元/箱<br></p></div></div><div class="btnWrap"><p class="p1"><input id="buyNum_867" class="cBtnNum" type="button" value="1"><span>箱</span></p><p class="p2"><input id="pro_867" class="cBtnBuy cBtnBuyCart" type="button" value="取消"><span buy="直接购买" del="取消购买">直接购买</span></p></div></li>';
            }
            $('#clearfix').html(html);
            
            
            return;
        });
        return;
    }

    //产品类型样式清空选回第一个
    function productTypeClickFirst() {
        //清空选中样式
        $('.productTypeC').removeClass('cur');
        //加上选中样式
        $('.firstC').addClass('cur');
    }

    //隐藏新品预定按钮
    function hiddenProductBook() {
        //将原来的typeSign赋值
        $("#typeSign").val($("#searchSign").val());
        $('#cQuickMenu').attr("style", "display:block");
        $('#cMenuDiv').attr("style", "display:block");
        $('#cScList').attr("style", "display:block");
        $('#cSearchInfo').attr("style", "display:none");
        return;
    }


    //删除deleteProductidCookie
    function deleteProductidCookie(name) {
        var date = new Date();
        date.setTime(date.getTime() - 10000);
        document.cookie = name + "_productid=v; expires=" + date.toGMTString();
    }

    //删除deleteProductnumCookie
    function deleteProductnumCookie(name) {
        var date = new Date();
        date.setTime(date.getTime() - 10000);
        document.cookie = name + "_productnum=v; expires=" + date.toGMTString();
    }

    //获取用户购物车内商品信息
    function getUserCartInfo(cookie) {
        //将本地cookie记录添加到购物车
        AddCookieToCart(cookie);

        $.ajax({
            url: '/control/Order/GetUserCartInfoByUid.ashx',
            type: 'get',
            contenType: "application/json; charset=utf-8",
            async: false,
            dataType: "json",
            success: function (data) {

                //将购物车中的数据导到Cookie上
                if (data.Status != 0) {
                    CartPaitCookie(cookie, data);
                }

            }
        });
    }

    //将本地cookie记录添加到购物车
    function AddCookieToCart(cookie) {
        if (cookie == null || cookie == "" || cookie == "cartnum=0; cartprice=0") {
            return;
        }
        //切割cookie
        var arrCookie = cookie.split("; ");
        //将cookie记录添加到购物车当中
        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if (arr[0].indexOf("_productid") > 0) {
                var pid = arr[1];
                var pnum = 1;
                for (var j = 0; j < arrCookie.length; j++) {
                    var arr2 = arrCookie[j].split("=");
                    if (arr2[0] == pid + "_productnum") {
                        pnum = arr2[1];
                        break;
                    }
                }
                addProductToCart(pid, pnum);
            }
        }

    }

    //本地Cookie记录跟购物车做配对
    function CookiePaitCart(cookie, data) {
        if (cookie == null || cookie == "" || cookie == "cartnum=0; cartprice=0") {
            return;
        }
        //alert(cookie);
        //切割cookie
        var arrCookie = cookie.split("; ");
        //购物车信息
        //var cartnum = "";
        //var carprice = "";
        //商品数量
        //var saveProductnum = "";


        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if (arr[0].indexOf("_productid") > 0) {
                //如果本地跟购物车有相同的,就将本地该商品数量更新到购物车上
                if (arr[1] == data._productid) {
                    var pid = data._productid;
                    var pnum = arrCookie[i + 1].split("=")[1];
                    //当数量不一样时候,就更新购物车上的数量
                    if (pnum != data._quantity) {
                        changeCartProductNum(pid, pnum);
                    }
                }
                    //如果购物车中没有该商品,就将该商品添加到购物车当中
                else {
                    var pid = arr[1];
                    var pnum = arrCookie[i + 1].split("=")[1];
                    addProductToCart(pid, pnum);
                }
            }

        }

    }

    //将购物车中的数据导到Cookie上
    function CartPaitCookie(cookie, data) {
        if (data.Result == null) {
            data.Result = data;
        }
        //清空cookie
        if (cookie != "") {
            var productIdCookieArray = cookie.split('; ');
            for (var i = 0; i < productIdCookieArray.length; i++) {
                if (productIdCookieArray[0].indexOf("_productid") > 0) {
                    deleteProductidCookie(productIdCookieArray[1]);
                    deleteProductnumCookie(productIdCookieArray[1]);
                }
            }
        }

        //购物车商品数量
        var cartTotalNumSign = 0;
        //购物车商品总价
        var cartTotalPriceSign = 0.0;

        //将购物车的数据导到cookie里
        for (var i = 0; i < data.Result.length; i++) {
            cartTotalNumSign += 1;
            cartTotalPriceSign = accAdd(cartTotalPriceSign, accMul(data.Result[i]._adjustedprice, data.Result[i]._quantity));
            saveCartWithNotLogin(data.Result[i]._productid, data.Result[i]._quantity, cartTotalNumSign, cartTotalPriceSign);
        }
    }

    //更新购物车当中的数量
    function changeCartProductNum(pid, pnum) {
        $.ajax({
            url: '/control/Order/UpdateCartProductNum.ashx?pid=' + pid + '&pnum=' + pnum,
            type: 'get',
            contenType: "application/json; charset=utf-8",
            async: false,
            dataType: "json",
            success: function (data) {
                //当更新成功时候,
                if (data.Status == "1") {

                }
            }
        });
    }

    //将商品添加到购物车中
    function addProductToCart(pid, pnum) {
        $.ajax({
            url: '/control/Order/AddProductToCart.ashx?pid=' + pid + '&pnum=' + pnum,
            type: 'get',
            contenType: "application/json; charset=utf-8",
            async: false,
            dataType: "json",
            success: function (data) {
                //当添加成功时候,
                if (data.Status == "1") {

                } else {
                    alert("网络不给力,商品添加失败");
                    productClickBuyOrCancel(pid, pnum);
                }
            },
            complete: function (xhr, status) {
                //如果状态为成功时候,就重新调用自己
                if (status != "success") {
                    alert("网络不给力,商品添加失败");
                    productClickBuyOrCancel(pid, pnum);
                }
                return;
            }
        });
    }

    //删除购物车商品
    function deleteCartProductByPids(pids) {
        $.ajax({
            url: '/control/Order/DeleteCartProduct.ashx?pids=' + pids,
            type: 'get',
            contenType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function (data) {
                if (data.Message == "userId_Is_Null") {
                    alert("请先登录");
                    window.location = "/Web/passport/login.html";
                    return;
                }
                if (data.Message.indexOf("成功") > 0) {
                    //$('#cFixedClosed1').click();
                }
                return;
            }
        });
    }


    //重新初始化滚动加载参数
    function initScorllPara() {
        getSign = true;
        IsGetSign = true;
        num = 2;
    }

    //个人中心我的订购
    $("#MyOrder").click(function () {
        //关闭左边侧栏
        $('#cFixedClosed2').click();
        //点击我的订购
        $("#m1").click();
    });

    //个人中心我的菜篮
    $("#MyBasket").click(function () {
        //关闭左边侧栏
        $('#cFixedClosed2').click();
        //点击我的订购
        $("#m3").click();
    });

    //用户退出
    $('#ExitBtn').click(function () {
        $.getJSON("/control/Tool/ClearSession.ashx?SessionKey=userid", function (data) {

        });
    });
    
    
    // 加入购物车
    $('#cScList .buy-btn').click(function(){
    	showTip('已加入购物车');
    	return false;
    })
})