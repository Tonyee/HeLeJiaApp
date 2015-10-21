
function showTip(txt) {
    var message = $('<p style="background: rgba(0,0,0,0.5); position: fixed; z-index: 9999999; max-width: 80%; left: 50%; top: 50%; text-align: center;border-radius: 10px;padding: 10px; color: #fff" id="tips">' + txt + '</p>');
    // var mes = message.get(0);
    // mes.style.WebkitTransform = 'translate(-50%, -50%)';
    // mes.style.MozTransform = 'translate(-50%, -50%)';
    // mes.style.msTransform = 'translate(-50%, -50%)';
    // mes.style.OTransform = 'translate(-50%, -50%)';
    // mes.style.transform = 'translate(-50%, -50%)';
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

//判断用户是否登陆
var LoginSign = "";

//获取是否登陆
$.getJSON("/control/Tool/GetSession.ashx?SessionKey=uid", function (data) {
    LoginSign = data.returnSession;
    if (LoginSign == "SessionIsNull") {


    }
    else {
        $("#cMine").attr("style", "display:none");
        $("#cMine2").attr("style", "display:block; background: url(../resource/img/mine3.png) no-repeat center center; width: 2.8em; height: 2.8em;");
    }
});

//保存购物车当中商品id以及购物车数量和总价
var saveCartProductIdAndCartInfo = "";
//保存原有cookie
var saveProductNumSign = "";
//购物车商品总价
var cartTotalPrice = 0.0;

//如果用户没有登陆,就获取cookie里面的值

function getCartCookie() {
    //获取cookie
    var strCookie = document.cookie;

    saveAutoCookie = strCookie;
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
            }
            else {
                saveCartProductIdAndCartInfo += "," + arr[1];
            }
        }
        if (arr[0].indexOf("_productnum") > 0) {
            if (saveProductnum == "") {
                saveProductnum = arr[1];
                saveProductNumSign = arr[0] + "=" + arr[1];
            }
            else {
                saveProductnum += "," + arr[1];
                saveProductNumSign += "," + arr[0] + "=" + arr[1];
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

//遍历购物车列表
function ergodicCartList() {
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

    //获取saveCartProductIdAndCartInfo里面的商品ID
    var CartProductId = "";
    if (saveCartProductIdAndCartInfo != "") {
        CartProductId = saveCartProductIdAndCartInfo.split('_')[0];
    }

    //调用显示购物车列表接口
    if (CartProductId != "") {
        $.ajax({
            url: '/control/Order/ShowCartList.ashx?pid=' + CartProductId,
            type: 'get',
            async: "false",      //ajax同步
            dataType: "json",
            success: function (data) {
                if (data.Message == "NetworkError") {
                    showTip("网络异常");
                    return;
                }
                for (var i = 0; i < data.Result.length; i++) {
                    $('#cartListSign').append(cartListStr(data.Result[i]));
                    //取消购买事件
                    cancelBuyProductEve(data.Result[i]._productid);
                }
                //alert(cartTotalPrice);
                if (Number(cartTotalPrice) <= 0) {
                    cartTotalPrice = "0";
                }
                //显示购物车总价
                $("#cartTotalPriceSign").text(cartTotalPrice);
            }
        });
    }
}


//购物车列表字符串
function cartListStr(data) {
    var buyNum = "1";//购买数量
    var productTotalPrice = "100";//单个商品总价
    var buyNumArray = saveProductNumSign.split(',');//切割cookie
    for (var i = 0; i < buyNumArray.length; i++) {
        if (buyNumArray[i].split('_')[0] == data._productid) {
            buyNum = buyNumArray[i].split('=')[1];   //获取购买数量
            productTotalPrice = accMul(buyNum, data._lowestsaleprice);//获取单个商品总价
            cartTotalPrice = accAdd(cartTotalPrice, productTotalPrice); //购物车总价
        }
    }
    var ListStr = "";
    list = "<li id='li_" + data._productid + "' class='clearfix li' sku_id='4294' cart_price='" + data._lowestsaleprice + "' cart_id='" + data._productid + "'>";
    list += "<div id='pic_" + data._productid + "' class='pic'> <img width='100%' img-src='http://110.172.215.228:8800" + data._thumbnailurl1.replace('{0}', 'T50x65_') + "' alt=''> </div>";
    list += '<div class="txt">';
    list += '<h3>' + data._productname + '</h3>';
    list += '<div class="d2"> <span>单价：</span> ' + data._lowestsaleprice + '元/' + data._unit + ' </div>';
    list += '<div class="d4"> <span>总价：</span><em id="pTotalPriceSign_' + data._productid + '">' + productTotalPrice + '</em>元 ';
    list += '</div>';
    list += '</div>';
    list += '<div class="btnWrap">';
    list += '<p class="p1">';
    //list += '<input class="cBtnRemark" type="button" id="rm_' + data._productid + '" value="备注">';
    //list += '<span succ="修改备注" def="添加备注">添加备注</span> </p>';
    list += '<p class="p2">';
    list += '<input id="buyNum_' + data._productid + '" class="cBtnNum" type="button" value="' + buyNum + '">';
    list += '<span>' + data._unit + '</span> </p>';
    list += '</div>';
    list += '<a href="javascript:;" id="del_' + data._productid + '" class="cDel"></a>';
    list += '<div class="cRemarkBuy" >';
    list += '<div class="btnSel">';
    list += '<input class="confim" type="button" value="确定">';
    list += '<input class="cancel" type="button" value="取消">';
    list += '</div>';
    list += '<textarea placeholder="特别要求"></textarea>';
    list += '</div>';
    list += '</li>';
    return list;
}

//调用方法
ergodicCartList();

//防止多次触发
var clickId = "";

//取消购买事件
function cancelBuyProductEve(pid) {
    $('#pic_' + pid).click(function () {
        if (clickId == pid) {
            return;
        }
        //记录上次点击的ID，防止多次触发
        clickId = pid;
        //触发取消购买方法
        cancelBuyProduct(pid);
    });

    $("#del_" + pid).click(function () {
        if (clickId == pid) {
            return;
        }
        //记录上次点击的ID，防止多次触发
        clickId = pid;
        //触发取消购买方法
        cancelBuyProduct(pid);
    });
}

//取消购买执行方法
function cancelBuyProduct(pid) {
    //重置一下cookie
    getCartCookie();
    //如果用户登录了,就删除购物车中的商品
    if (LoginSign != "SessionIsNull") {
        //deleteCartProductByPids(pid);
    }
    //商品在购物车列消失
    $("#li_" + pid).fadeOut(500);
    //将该商品从cookie上删除
    if (saveCartProductIdAndCartInfo != "" || saveCartProductIdAndCartInfo != null || saveCartProductIdAndCartInfo != "_&|") {
        var cartnum = saveCartProductIdAndCartInfo.split('_')[1].split('&')[0].split('=')[1].toString(); //获取原本购物车数量
        var cartprivate = saveCartProductIdAndCartInfo.split('&')[1].split('|')[0].split('=')[1].toString();//获取原本购物车价格

        //获取取消商品后,购物车数量和购物车价格
        cartnum = cartnum - 1;
        cartprivate = accSub(cartprivate, Number($('#pTotalPriceSign_' + pid).text()));

        clearCartWithNotLogin(pid + "", cartnum, cartprivate);

        if (Number(cartprivate) <= 0) {
            cartprivate = "0";
        }

        //更新购物车总价
        $("#cartTotalPriceSign").text(cartprivate);
        //重置cookie
        getCartCookie();
    }
    else {
        alert("网络异常>_<");
        return;
    }

}

/*********************************************用户未登陆时候取消购物车***************************************************/
function clearCartWithNotLogin(productid, cartnum, cartprice) {
    if (productid.indexOf(",") > 0) {
        var idArray = productid.split(',');
        for (var i = 0; i < idArray.length; i++) {
            //清除指定cookie
            deleteProductidCookie(idArray[i]);
            deleteProductnumCookie(idArray[i]);
        }
    }
    else {
        deleteProductidCookie(productid);
        deleteProductnumCookie(productid);
    }
    //保存到cookie
    document.cookie = "cartnum=" + cartnum;
    document.cookie = "cartprice=" + cartprice;
    return;
}
/************************************************************************************************************************/

//点击清空按钮事件
$('#clearCart').click(function () {

});

//新品预定确定
$('#cBtnMS1').click(function () {
    addBookNewProduct($('#cPM').val(), $('#cGG').val(), $('#cSL').val(), $('#cMS').val());
    return;
});

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
                return false;
            }
            if (data.Message.indexOf("成功") > 0) {
                return true;
            }
            return false;
        }
    });
}

//将商品添加到购物车中单
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

            }
        }
    });
}

//显示数量
$(function () {
    $("input[name=type]").click(function () {
        showCont();
    });
});
function showCont() {
    switch ($("input[name=type]:checked").attr("id")) {
        case "rZX":
            $("#zfType").slideDown();
            break;
        case "DF":
            $("#zfType").slideUp();
            break;
        default:
            break;
    }
}

