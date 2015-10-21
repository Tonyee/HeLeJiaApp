define(function (require, exports, module) {
    // 滚动插件
    var $ = require('zepto');
    var iScroll = require('iscroll'); // iscroll
    var showTip = require('./c_tips'); // 提示弹窗
    var scroller = $('#cScroller');


    var eClick = window.navigator.userAgent.toLowerCase().indexOf('mobile') != -1 ? 'tap' : 'click';
    var $picker = {
        scroller: scroller, // 滚动
        btn: $('.cBtnNum'), // 点击出现picker
        cMenu: $('#cMenu'), // 点击出现picker
        buy: $('.cBtnBuy'), // 点击出现picker
        li: scroller.find('li'),
        liH: scroller.find('li').offset().height,
        total: $('#type'), // 购买总数
        id: $('#id').val(), // 购物车id
        uid: $('#uid').val(), // 用户id
        price: $('#cPriceTotal'), // 总价
        price1: $('#cPriceTotal1'), // 总价
        cTotalPrice: $('#cTotalPrice'), // 总价
        cTotalS: $('#cTotalS'), // 多少蔬菜
        page: $('#c_page').val(), // 多少蔬菜
        tips: $('#cTips'), // 低于100元加收30运费提示
        limit: $('#limit'), // 钱数限制
        temp: null // 点击了哪个按钮
    };


    //判断用户是否登陆
    var LoginSign = "";

    //保存购物车当中商品id以及购物车数量和总价
    var saveCartProductIdAndCartInfo = "";

    $.ajax({
        url: '/control/Tool/IsLogin.ashx',
        type: 'get',
        contenType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (data2) {
            LoginSign = data2.returnMsg;
        }
    });


    //如果用户没有登陆,就获取cookie里面的值
    //如果用户登录了,就将用户购物车内的商品跟cookie里面的商品合并,再保存在cookie里面
    function getCartCookie() {
        //获取cookie
        strCookie = document.cookie;
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


    //将商品添加到购物车中
    function addProductToCart(pid, pnum) {
        $.ajax({
            url: '../../control/Order/AddProductToCart.ashx?pid=' + pid + '&pnum=' + pnum,
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


    //require('/Script/home/index.js');



    /**
	 * [onScrollMove iscroll插件]
	 */
    var myScroll = new iScroll('cScroller', {
        hScroll: false,
        vScrollbar: false,
        lockDirection: true,
        onScrollMove: function (e) {
            e.preventDefault();
        },
        onScrollEnd: function () {
            var n = this.y / $picker.li.offset().height;
            $picker.li.removeClass('cur'); // 删除li上的类
            var $curLi = $picker.li.eq(Math.ceil(Math.abs(n))).next(); // 选择目标点
            $curLi.addClass('cur'); // 给当前li加class
            if ($picker.temp && scroller.isShow) { // picker是显示的
                $picker.temp.val($curLi.text());
            }
        }
    })


    /**
	 * [_resetPos iscroll插件]
	 * @param  {[number]} time
	 * @return {[boolean]}
	 */
    myScroll._resetPos = function (time) {
        var that = this,
			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
			resetY = that.y >= 0 || that.maxScrollY > 0 ? 0 : that.y < that.maxScrollY ? that.maxScrollY : that.y;
        // 修改插件的方法 S
        var liHeight = $picker.li.offset().height;

        if (resetY % liHeight != 0) {
            resetY = parseInt(resetY - resetY % liHeight);
        }
        // 修改插件的方法 E
        if (resetX == that.x && resetY == that.y) {
            if (that.moved) {
                if (that.options.onScrollEnd) that.options.onScrollEnd.call(that); // Execute custom code on scroll end
                that.moved = false;
            }
            return;
        }
        that.scrollTo(resetX, resetY, time || 0);
    }




    /**
	 * [点击按钮定位picker]
	 * @return {[type]}
	 */
    $picker.btn.live(eClick, function () {
        var $this = $(this);
        $this.defValue = $this.val();
        $picker.temp = $this;
        showScroller($this); // 显示picker
    })


    /**
	 * [改变窗口大小的时候隐藏picker]
	 * @return {[type]}
	 */
    $(window).on('resize', function () {
        hideScroller(); // 隐藏picker
    })

    /**
	 * [hideScroller 显示picker]
	 * @return {[type]} [boolean]
	 */

    function showScroller($obj) {
        var $parent = $obj.parents('li');
        var h = Number($parent.height());
        var showNum = 3;

        // 为了每个li的高度为整数
        if (h % showNum != 0) {
            h = h - h % showNum;
        }

        // 设置picker的高度
        scroller.css({
            right: 'auto',
            left: $parent.offset().left + $parent.offset().width - scroller.width(),
            top: $parent.offset().top,
            height: h,
            zIndex: '100!important'
        })

        $picker.li.css({
            height: h / showNum,
            lineHeight: h / showNum + 'px'
        });

        myScroll.scrollTo(0, -($obj.val() - 1) * h / showNum, 0, false)
        myScroll.refresh();
        scroller.isShow = true;
        return true;
    }

    /**
	 * [hideScroller 隐藏picker]
	 * @return {[type]} [boolean]
	 */

    function hideScroller() {
        scroller.css({
            right: '-100em',
            top: '-100em'
        });
        scroller.isShow = false;
        return false;
    }

    /**
	 * [点击的不是按钮也不是picker的时候隐藏picker]
	 * @param  {[type]} e
	 * @return {[type]}
	 */
    $(document).on(eClick, function (e) {
        var $target = $(e.target);
        if ($target.hasClass('cBtnNum') && (!$target.attr('disabled')) /* || ($target.parents('#cScroller').length > 0)*/) {
            // scroller.show();
        } else if ($target.hasClass('cBtnBuy') && $target.attr('disabled')) {
            cancelBuyGoods($target); // 取消购物
        } else if (($target.parents('#cScroller').length > 0) && (!$target.hasClass('end'))) {
            // 如果选中的是picker
            $picker.li.removeClass('cur');
            $target.addClass('cur');
            $picker.temp.val($target.text());
            hideScroller(); // 隐藏picker

            if ($target.val() != $picker.temp.val()) { // 如果选择的数据不等于之前的才去改购物车中数量
                var $parent = $picker.temp.parents('li');
                !scroller.moved && updateCar($parent.attr('cart_id'), $picker.temp.val(), $parent.attr('cart_price')); // 如果是显示的请求数据库改数量
            }
        } else {
            if (scroller.isShow) {
                hideScroller(); // 隐藏picker
                var $cur = scroller.find('.cur');
                // 如果点击的其他元素
                if ($cur.length > 0) {
                    $picker.temp.val($cur.text());
                };
                !scroller.moved && updateCar("-1", "-1", "-1"); // 如果是显示的请求数据库改数量
            }
        }
    })


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

    /**
	 * [updateCar 更新购物车]
	 * @return {[type]} [description]
	 */

    function updateCar(cid, cnum, price) { // 如果不是购物车页，或者购买数量不变都返回
        var cart_id = cid;
        if ($picker.temp.val() == $picker.temp.defValue) {
            return false;
        }
        switch ($picker.page) {
            case 'cart':
                //alert('123');
                //alert(document.cookie);
                /*cartAjax();*/
                //alert(cart_id);
                changeProductNum(cart_id, cnum, price);
                break;
            case 'index':
                //alert('123');
                /*indexAjax();*/
                //alert(cart_id);
                changeProductNum(cart_id, cnum, price);
                break;
        }

    }


    //根据id修改商品数量
    function changeProductNum(id, num, price) {
        var cookieArray = document.cookie;
        //记录商品id和商品数量,记录购物车里面的总价
        var pidmark = -1;
        var pnummark = -1;
        var cartTotalPrice = 0.00;

        cookieArray = cookieArray.split("; ");

        for (var i = 0; i < cookieArray.length; i++) {
            var pid = cookieArray[i].split("=");
            if (pid[0].indexOf("_productid") > 0 && pid[1] == id) {
                pidmark = id;
                //alert(id);
                if (pnummark != -1 && cartTotalPrice != 0.00) {
                    break;
                }
            }
            if (id + "_productnum" == pid[0]) {
                pnummark = pid[1];
                //alert(pid[1]);
                if (pidmark != -1 && cartTotalPrice != 0.00) {
                    break;
                }
            }

            if (pid[0] == "cartprice") {
                cartTotalPrice = pid[1];
                if (pnummark != -1 && pidmark != -1) {
                    break;
                }
            }
        }
        //判断cookie是否有该商品
        if (pidmark != -1 && pnummark != -1) {
            //减去原来购物车里面价格
            cartTotalPrice = accSub(cartTotalPrice, accMul(pnummark, price));
            //再加上
            cartTotalPrice = accAdd(cartTotalPrice, accMul(num, price));
            //刷新商品总价
            $('#pTotalPriceSign_' + pidmark).text(accMul(num, price));
            //判断用户是否登陆了,如果登陆了,将商品添加到购物车当中
            if (LoginSign != "SessionIsNull") {
                //addProductToCart(pidmark, num);
            }
            //修改该商品在cookie的数量
            document.cookie = pidmark + "_productnum=" + num;
            //修改cookie里面购物车总价
            document.cookie = "cartprice=" + cartTotalPrice;

            if (Number(cartTotalPrice) <= 0) {
                cartTotalPrice = "0";
            }

            //刷新购物车价格
            $('#cTotalPrice').text(cartTotalPrice);
            $('#cartTotalPriceSign').text(cartTotalPrice);
            //重置下cookie
            getCartCookie();
        }
    }




    /**
	 * [cartAjax  购物修改购物车数量]
	 * @return {[type]}
	 */

    /*function cartAjax() {
		var $parent = $picker.temp.parents('li');
		$.ajax({
				url: '/api/cart/setnum',
				type: 'POST',
				dataType: 'json',
				data: {
					id: $parent.attr('cart_id'),
					uid: $picker.uid,
					num: $picker.temp.val(),
					sku_id: $parent.attr('sku_id')
				},
				success: function(data) {
					if (data.result == 'succ') {
						// 调用android内部函数
						if(window.android) {
							window.android.android_reload();
						}

						$picker.cTotalS.html(data.info.num);
						$parent.find('em').html(data.info.goods_price)
						$picker.price.html('￥' + data.info.price);
						$picker.price1.html('￥' + data.info.price);
						if (data.info.price > $picker.limit.val()) {
							$picker.tips.hide();
						} else {
							$picker.tips.show();
						}
					} else {
						showTip(data.reason);
					}
				}
			})
			// console.log('cart')
	}
*/
    // shou页ajax
    /**
	 * [indexAjax 添加到购物车]
	 * @param  {[object]} 点击的按钮
	 * @return {[null]}
	 */

    function indexAjax($obj) {
        if (!$obj) {
            $obj = $picker.temp;
        }
        var $parent = $obj.parents('li');
        var $buyNum = $parent.find('.cBtnNum'); // 购买的数量
        var $cBtnBuy = $parent.find('.cBtnBuy'); // 已购买
        var $pic = $parent.find('.pic');   // 图片
        var $sku_id = $parent.attr('sku_id');

        if ($obj.hasClass('cBtnBuy') && $cBtnBuy.attr('disabled')) {
            return false;
        }

        if (!$obj.hasClass('cBtnCancel')) {
            buyAnimationLi($parent); // 购买蔬菜动画
        } else {

        }

        $pic.addClass('picBuy');
        if ($picker.uid == 0) { return false; }; // 为试一试而加
        /*$.ajax({
			url: '/api/cart/add',
			type: 'POST',
			dataType: 'json',
			data: {
				id: $parent.attr('cart_id'),
				uid: $picker.uid,
				num: $buyNum.val(),
				sku_id: $parent.attr('sku_id')
			},
			success: function(data) {
				if (data.result == 'succ') {
					$picker.total.html(data.info.num);
					$picker.cTotalPrice.html(data.info.price);

					$cBtnBuy.attr('disabled', 'disabled');
					// 绑定cart_id
					$parent.attr('cart_id', data.info.id)

					// 修改文字 
					var $siblings = $cBtnBuy.siblings();
					$siblings.html($siblings.attr('del'));
					
					function resetSku(json) {
						json.cart_id = data.info.id; // 修改购物车id
						json.num = $buyNum.val(); // 修改所有数据的购买量
						// 自己加的属性
						json.picClass = 'picBuy'; // 已购买
						json.inputAttr = 'disabled'; // 已购买
					};

					function findQPSku() {
						var t = null;
						if(window.oSku_id[$sku_id]) {
							resetSku(window.oSku_id[$sku_id]);
						} else {
							t = setTimeout(findQPSku, 30)
						}
					};
					
					(function init() {
						if($picker.cMenu.find('.cur').attr('cat_id') == 0) {
							resetSku(window.oTjSku_id[$sku_id]);
							findQPSku();
						} else {
							resetSku(window.oSku_id[$sku_id]);
							if(window.oTjSku_id[$sku_id]) {
								resetSku(window.oTjSku_id[$sku_id]);
							}
						}
					})();

				} else {
					$pic.removeClass('picBuy');
					$cBtnBuy.removeAttr('disabled');// 如果失败移除disabled
					showTip(data.reason);
				}
			}
		})*/
    }
    /**
	 * [点击购买]
	 * @return {[type]} [false 退出此函数]
	 */
    ~function () {
        if ($picker.buy.length == 0) {
            return false;
        } // 如果是首页

        $picker.buy.live(eClick, function () {
            var $this = $(this);
            indexAjax($this);
        })
    }();

    function buyAnimationLi($obj) {
        var $ani = $obj.clone();
        $obj.parent().append($ani);
        $ani.css({
            'position': 'absolute',
            'top': $obj.position().top,
            'left': $obj.position().left
        })
        var dis = distance($ani, $picker.total); // 两元素之间的距离
        $ani.animate({
            background: '#fff',
            zIndex: 9999999,
            translate: dis.left + 'px, ' + dis.top + 'px',
            scaleX: 0,
            scaleY: 0
        }, 800, 'ease-out', function () {
            $(this).remove();
            $ani = null;
        })
    }

    /**
	 * [buyAnimation 两个对象之间的距离]
	 * @param  {[type]} $obj1 [zepto对象]
	 * @param  {[type]} $obj2 [zepto对象]
	 * @return {[type]}      [Object]
	 */

    function distance($obj1, $obj2) {
        var a = $obj2.offset().left + $obj2.offset().width / 2 - $obj1.offset().left - $obj1.offset().width / 2;
        var b = $obj2.offset().top + $obj2.offset().height / 2 - $obj1.offset().top - $obj1.offset().height / 2;
        return {
            left: a,
            top: b
        };
    }

    /**
	 * [取消购买某个物品]
	 * @return {[type]} [null]
	 */

    /*function cancelBuyGoods($obj) {
		var $parent = $obj.parents('li');
		var sku_id = $parent.attr('sku_id');
		var id = $parent.attr('cart_id');
		$parent.removeAttr('cart_id'); 	// delete cart_id
		$.ajax({
			url: '/api/cart/delete',
			type: 'POST',
			dataType: 'json',
			data: {
				uid: $picker.uid, // 商品名称
				sku_id: sku_id, //
				id: id //
			},
			success: function(data) {
				if (data.result == 'succ') {
					
					// 修改按钮信息
					var $siblings = $obj.siblings('span');
					$siblings.html($siblings.attr('buy'));

					// 修改页面数据
					$picker.total.html(data.info.num);
					$picker.cTotalPrice.html(data.info.price);

					// 删除class
					$parent.find('.pic').removeClass('picBuy'); // move picBuy
					$obj.removeAttr('disabled'); // delete disabled

					try{
						// 删除全品sku
						delete window.oSku_id[sku_id].picClass; // 已购买
						delete window.oSku_id[sku_id].inputAttr; // 已购买

						// 删除推荐sku
						delete window.oTjSku_id[sku_id].picClass; // 已购买
						delete window.oTjSku_id[sku_id].inputAttr; // 已购买
					} catch(e) {
						// console.log(e);
					}

				} else {
					showTip(data.reason);
				}
			}
		})
	}*/
})