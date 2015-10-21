define(function(require, exports) {
    var $ = require('zepto');
    //var mustache = require('mustache');
    var showTip = require('./c_tips'); // 提示
    var lazyImg = require('./c_lazy') // 模拟picker选择
    var cookie = require('cookie') // cookie
    require('./c_picker'); // 模拟picker选择


    var eClick = window.navigator.userAgent.toLowerCase().indexOf('mobile') != -1 ? 'tap' : 'click';
    var $sls = {
        // logo: $('#cSlogo'), // logo
        // cSearchBtns: $('#cSearchBtns'), // 搜索按钮
        // mine: $('#cMine'), // 我的按钮
        // menuClosed: $('#cFixedClosed'), // 关闭菜单
        search: $('#cSearch'), // 搜索框
        cScList: $('#cScList'), // 页面内容
        cScListUl: $('#cScList>ul'), // 页面内容
        cScListTmp: $('#cScListTmp').html(), // 页面内容
        menu: $('#cFixedMenu'), // 我的菜单内容
        menuBox: $('#cFixedMenuBox'), // 我的菜单内容
        cSubMenu: $('#cMenu'), // 我的菜单内容
        cSubMenu2: $('#cMenu2'),//我的菜单内容
        cM1: $("#m1"),//商品分类
        cM2: $('#m2'),//应季商品
        cM3: $('#m3'),//我的菜篮
        cSubMenuLi: $('#cMenu > li'), // 我的菜单内容
        cFixedLoading: $('#cFixedLoading'), // 加载
        uid: $('#uid').val(), // uid
        add: $('#cAddTypeLink'), // 增加菜品
        cNoLoginTip: $('#cNoLoginTip'), // 未登录提示
        cFixedHeadWrap: $('#cFixedHeadWrap'), // 头部
        cIndexDataloading: $('#cIndexDataloading'), // 未登录提示
        cSearchBtns: $('#cSearchBtns'), // 搜索按钮
        trunTypes: $('#trunTypes') // 返回分类
    };
    var allData = []; // 所有商品集合
    window.oSku_id = {}; // 所有数据的sku_id索引
    window.oTjSku_id = {}; // 推荐sku_id索引
    var oDataType = {}; // 所有商品分类
    var tempObj = {}; //临时对象
    var pageCount = 1; // 默认加载出来的第一页
    var pageCountSearch = 1; // 搜索的时候
    var indexDataPage = 1;
    var tempKeyWordArr = [];
    var triggerTimer = null;
    var allDataLoaded = false;

    

    /**
     * [Search 头部搜索]
     */
    var Search = {
        menu: $sls.cSubMenu,
        head: $sls.cFixedHeadWrap,
        fixed: $sls.cFixedHeadWrap.find('.cFixedHead'),
        fixedClass: 'cHeadSearch',
        inp: $sls.search,
        inpParent: $sls.search.parent(),
        inpParentClass: 'cSearchIng',
        btnTypes: $('#trunTypes'),
        btnSearch: $('#cSearchBtns'),
        isFocus: false,
        fnFocus: function() {
            this.isFocus = true;
            this.inp.val('');
            this.menu.find('li').removeClass('cur');
            this.inpParent.addClass(this.inpParentClass); // 输入框变宽
            hideAddTYPE();
        },
        fnBlur: function() {
            this.isFocus = false;
            this.inpParent.removeClass(this.inpParentClass); // 输入框变窄
            if (this.inp.val() == '') {
                this.fixed.addClass(this.fixedClass);
                this.menu.find('li').eq(0).trigger(eClick);
            }
        },
        fnKeyUp: function() {
            if (this.inp.val() != '') {
                this.btnTypes.show();
                this.btnSearch.hide();
            }
        },
        fnTrunTypes: function() {
            this.inp.val('');
            this.btnTypes.hide();
            this.btnSearch.show();
            this.fixed.removeClass(this.fixedClass);
        },
        fnBtnSearch: function() {
            this.fixed.addClass(this.fixedClass);
            this.inpParent.addClass(this.inpParentClass); // 输入框变窄
        },
        fnHideSearch: function() {
            if (this.isFocus) {
                return false;
            }
            if (this.inp.val() == '') {
                this.inpParent.addClass(this.inpParentClass); // 输入框变窄
                this.fixed.removeClass(this.fixedClass);
            }
        },
        init: function() {
            var $this = this;
            // focus
            $this.inp.on('focusin', function() {
                    $this.fnFocus();
                    return false;
                })
                // blur
            $this.inp.on('focusout', function() {
                    $this.fnBlur();
                    return false;
                })
                // keyup
            $this.inp.on('keyup', function() {
                $this.fnKeyUp();
            })

            // 返回一级分类
            $this.btnTypes.on(eClick, function() {
                $this.fnTrunTypes();
                $this.menu.find('li').eq(0).trigger(eClick);
                return false;
            })

            // 搜索按钮
            $this.btnSearch.on(eClick, function() {
                $this.fnBtnSearch();
                return false;
            })

            $(window).on('scroll', function() {
                $this.fnHideSearch();
            });
        }
    };
    Search.init();

    /**
     * [分类切换]
     * @return {[type]}
     */
    $sls.cSubMenu.on(eClick, 'li', function() {
        var $this = $(this);
        $this.siblings('li').removeClass('cur');
        $this.addClass('cur');
        hideAddTYPE();
        pageCount = 0;
        window.scrollTo(0, 0);
        Search.fnTrunTypes();
        changePage(++pageCount, $this);
        return false;
    })
    


    /**
     * [hideAddTYPE 判断显示还是隐藏addtype按钮]
     * @return {[type]} [description]
     */

    function hideAddTYPE() {
        if ($sls.cSubMenu.find('li').eq(0).hasClass('cur')) {
            $sls.add.hide();
        } else {
            $sls.add.show();
        }
    }

    (function() {
        /*getAllData();*/
        $sls.cFixedLoading.show(); //显示loading
        hideAddTYPE(); // 隐藏添加种类
    })();



    function fnIndexStopLoading() {
        $sls.cFixedLoading.hide(); // 隐藏loading
        // if (window.android) {
        //  window.android.stopload();
        // }
    }

    // 点击加载时取消滑动事件
    $sls.cFixedLoading.on('touchstart', function(e) {
        e.preventDefault && e.preventDefault();
    })

    ~ function setCatId0() {
        try {
            oDataType.cat_id_0 = cg_value;
            // console.log(cg_value)
            $.each(cg_value, function(i, item) {
                window.oTjSku_id[item.sku_id] = item;
            });
        } catch (e) {

        }
    }();

    // 分类
    var MyCategory = {
        datas: oDataType,
        // 一级分类
        types: function(item) {
            if (!item.cat_id) {
                return false;
            }
            var parentCatId = item.cat_id,
                s = 'parent_cat_id_' + parentCatId;
            if (!this.datas[s]) {
                this.datas[s] = [];
            }
            var types = this.datas[s];
            types && (types[types.length] = item);
        },
        // 二级分类
        subTypes: function(item) {
            if (!item.child_cat_id) {
                return false;
            }
            var childCatId = item.child_cat_id,
                s = 'cat_id_' + childCatId;

            if (!this.datas[s]) {
                this.datas[s] = [];
            }
            var types = this.datas[s];
            types && (types[types.length] = item);
        },
        // 常购
        isRecommond: function(item) {
            if (!item.is_recommond) {
                return false;
            }
            var is_recommond = item.is_recommond,
                s = 'parent_cat_id_is_recommond';
            if (!this.datas[s]) {
                this.datas[s] = [];
            }
            var types = this.datas[s];
            types && (types[types.length] = item);
            // 排序
            types.sort(function(a, b) {
                return a.recommond_sort - b.recommond_sort;
            })
        },
        hasCookieRecommond: function() {
            var s = 'parent_cat_id_is_recommond';
            this.datas[s] = cg_value;
        },
        init: function(item) {
            if (!item) {
                return false;
            }
            var $item = item;
            this.item = $item;
            this.types($item);
            this.subTypes($item);
            this.isRecommond($item);
        }
    };

    function setGoodsType(arr) {
        [].forEach.call(arr, function(item, i) {
            MyCategory.init(item);
            // 设置sku_id,并定位到单个数组
            oSku_id[item.sku_id] = item;
        })

        // oDataType.cat_id_0.sort(function(a, b) {
        //     return a.sort - b.sort;
        // })
        // console.log(oDataType)
        return oDataType;
    }





    noLogin(function() {
        $sls.add.hide(); // 隐藏增加品类
    })

    /**
     * [eleInScreen 元素是否在屏幕中]
     * @param  {[type]} $ele [*zepto 对象]
     * @return {[type]}      [boolean]
     */

    function eleInScreen($ele) {
        if ($ele && $ele.length > 0) {
            if ($ele.offset().top < $(window).scrollTop() + $(window).height()) {
                return true;
            } else {
                return false;
            }
        }
    }


    /**
     * [isLogin 根据uid来判断用户是否登录]
     * @return {Boolean} [是否登录]
     */

    function isLogin() {
        if ($.trim($sls.uid) == 0) {
            return false;
        } else {
            return true;
        }
    }
    /**
     * [hasLogin 用户已经登录]
     * @param  {[function]}  callBack [callback]
     * @return {Boolean}          [是否登录]
     */

    function hasLogin(callBack) {
        if (isLogin()) {
            callBack && callBack();
            return true;
        } else {
            return false;
        }
    }

    /**
     * [noLogin 用户未登录]
     * @param  {[function]} callBack [callback]
     * @return {[Boolean]}          [是否登录]
     */

    function noLogin(callBack) {
        if (!isLogin()) {
            callBack && callBack();
            return true;
        } else {
            return false;
        }
    }

    /**
     * [stopTimer 停止获取数据]
     * @return {[type]} [description]
     */
    function stopTimer() {
        if(triggerTimer){
            clearTimeout(triggerTimer);
        }
    }

    /**
     * [changePage 数据分类，并分页]
     * @param  {[Number]} * n
     * @param  {[Object]} $obj
     * @return {[null]}
     */

    function changePage(n, $obj) {
        var t = null;
        if (!$obj) {
            $obj = $sls.cSubMenu.find('.cur');
        }

        // 第一个li的cat_id为parent_cat_id
        if ($obj.index($sls.cSubMenu.find('li')) == 0) {
            var arr = oDataType['parent_cat_id_' + $obj.attr('cat_id')] || []; // 从哪一类数组中选取
        } else {
            var arr = oDataType['cat_id_' + $obj.attr('cat_id')]; // 从哪一类数组中选取
        }

        if (!arr || arr.length == 0) { // 当前分类还未加载
            stopTimer();
            triggerTimer = setTimeout(function() {
                !allDataLoaded && $obj.trigger(eClick);
            }, 1000)
        } else {
            stopTimer();
        }

        tempObj.data = turnPage(arr, n); // 为了使用一个模板然后分页
        // console.log(n);
        // console.log(tempObj.data.length)
        if (tempObj.data.length == 0) {
            return false;
        }

        if (n == 1) {
            $sls.cScListUl.html(mustache.to_html($sls.cScListTmp, tempObj))
        } else {
            $sls.cScListUl.append(mustache.to_html($sls.cScListTmp, tempObj))
        }
        tempObj.data = null;
        lazyImg(); // 同时加载图片
    }


    /**
     * [turnPage 分页取数据]
     * @param  {[Array]} arr
     * @param  {[Number]} n
     * @return {[Array]}
     */

    function turnPage(arr, n) {
        if (!arr || arr.length < 1) {
            return false;
        }
        var onePage = 12; // 一页12条数据
        var newArr = [];
        for (var i = (onePage * (n - 1)); i < onePage * n; i++) {
            if (arr[i]) {
                newArr.push(arr[i]);
            }
        }
        return newArr;
    }

    /**
     * [输入区域]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    $sls.search.on('input', function(e) {
        var $this = $(this);
        enterText($this.val());
    })

    /**
     * [enterText 检索搜索的菜品]
     * @param  {[String]} str [input内容]
     * @return {[type]}     [description]
     */

    function enterText(str) {
        if (str.toString() == '') {
            return false;
        }
        tempKeyWordArr = [];

        var re = new RegExp(str, 'i');
        for (var i = 0; i < allData.length; i++) {
            if (re.test(allData[i].keyword)) {
                tempKeyWordArr[tempKeyWordArr.length] = allData[i];
            }
        }
        pageCountSearch = 1;
        changePageSearch(tempKeyWordArr, pageCountSearch);
    }

    /**
     * [changePageSearch description]
     * @param  {[type]} arr [description]
     * @param  {[type]} n   [description]
     * @return {[type]}     [description]
     */


    // ios 调用
    window.android_index_search = function(str) {
        enterText(str);
    }
})
