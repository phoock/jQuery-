$(document).ready(function() {
    (function($) {



        var pageSwitch = (function() {
            function pageSwitch(element, options) {
                var me = this;
                me.element = element;
                me.settings = $.extend(true, $.fn.pageSwitch.default, options || {});
                me.init();
            }
            pageSwitch.prototype = {
                init: function() {
                    var me = this;
                    me.selectors = me.settings.selectors;
                    me.sections = me.element.find(me.selectors.sections);
                    me.section = me.sections.find(me.selectors.section);
                    me.pages = me.section.length;
                    me.index = me.settings.index >= 0 && me.settings.index < me.pages ? me.settings.index : 0;
                    me.direction = me.settings.direction == "vertical" ? true : false;
                    me.canScroll = true;
                    if (me.settings.pagination) {
                        me._initPages()
                    };
                    if (!me.direction) {
                        me._initLayout()
                    }

                },
                //如果有分页码则初始化dom结构
                _initPages: function() {
                    var me = this;
                    var pageClass = me.selectors.pages.substring(1),
                        active = me.selectors.active.substring(1);
                    var htmlPage = "<ul class=" + pageClass + ">";
                    for (var i = 0; i < me.pages; i++) {
                        htmlPage += "<li></li>";
                    }
                    htmlPage += "</ul>";
                    me.element.append(htmlPage);
                    var $pagesUl = me.element.find(me.selectors.pages);
                    me.$pagesLi = $pagesUl.find("li");
                    if (me.direction) {
                        $pagesUl.addClass("vertical")
                    } else {
                        $pagesUl.addClass("horizontal");
                    }

                    me.$pagesLi.eq(me.index).addClass(active).siblings().removeClass(active);


                    // 初始化分页码以后绑定事件
                    me._initEvent();
                },
                _initEvent: function() {
                    //给pagination绑定点击事件
                    var me = this;
                    me.element.on("click", me.selectors.pages + " li", function(e) {
                        console.log("clickPages")
                        var liIndex = $(this).index();
                        me.index = liIndex;
                        me._scrollPage();
                    });

                    //绑定滚轮事件

                    me.element.on("mousewheel DOMMouseScroll", function(e) {
                        console.log("mousewheel")
                        e.preventDefault();
                        var delta = e.originalEvent.wheelDelta || -o.originalEvent.detail;
                        if (me.canScroll) {
                            if (delta > 0) {
                                me.prev();
                            } else if (delta < 0) {
                                me.next();
                            }
                        }
                    });



                    //绑定键盘事件
                    $(window).on("keydown", function(e) {
                        var keyCode = e.keyCode;
                        if (keyCode == 37 || keyCode == 38) {
                            me.prev();
                        } else if (keyCode == 39 || keyCode == 40) {
                            me.next();
                        }
                    });

                    //绑定resize事件
                    $(window).on("resize", function(e) {
                        me._scrollPage();
                    });

                    //支持CSS3动画的浏览器 动画结束以后
                    if (me.prefix) {
                        me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function() {
                            me.canScroll = true;
                            if (me.settings.callback && $.type(me.settings.callback) === "function") {
                                me.settings.callback();
                            }
                        })
                    }


                },

                //如果director是horizontal则重置sections和secton的宽度
                _initLayout: function() {
                    var me = this;
                    if (!me.director) {
                        var width = (me.pages * 100) + "%";
                        var cellWidth = (100 / me.pages).toFixed(2) + "%";
                        me.sections.width(width);
                        me.section.width(cellWidth).addClass("left");
                    }
                },

                _scrollPage: function() {
                    //通过transition：all 500ms ease；transform:translateX(-theValue)
                    //兼容：me.sections.animate({left:theValue},500ms,ease)

                    var me = this;
                    me.canScroll = false;
                    var dest = me.section.eq(me.index).position();
                    var _prefix = me.prefix;
                    var active = me.selectors.active.substring(1);
                    if (_prefix) {
                        var translate = me.direction? "translateY(-" + dest.top + "px)" : "translateX(-" + dest.left + "px)";
                        me.sections.css(_prefix + "transition", "all " + me.settings.duration + "ms " + me.settings.easing);
                        me.sections.css(_prefix + "transform", translate);
                    } else {
                        var translate = me.direction? {
                            top: "-" + dest.top + "px"
                        } : {
                            left: "-" + dest.left + "px"
                        };
                        me.sections.animate(translate, me.settings.duration, "swing", function() {
                            me.canScroll = true;
                            if (me.settings.callback && $.type(me.settings.callback) === "function") {
                                me.settings.callback();
                            }
                        })
                    }
                    me.$pagesLi.eq(me.index).addClass(active).siblings().removeClass(active);

                },


                // 共有方法
                next: function() {
                    var me = this;
                    if (me.index < me.pages - 1) {
                        me.index++
                    } else if (me.settings.loop) {
                        me.index = 0;
                    }
                    console.log("next")
                    me._scrollPage();
                },
                prev: function() {
                    var me = this;
                    if (me.index > 0) {
                        me.index--;
                    } else if (me.settings.loop) {
                        me.index = me.pages - 1;
                    }
                    console.log("prev")
                    me._scrollPage();
                },
                getScrollDistance: function() {
                    var me = this;
                    if (me.direction == "vertical") {
                        return me.element.height()
                    } else {
                        return me.element.width()
                    };
                },
                //判断浏览器内核
                prefix: (function(temp) {
                    var me = this;
                    var coreArr = ["webkit", "ms", "o", "Moz"];
                    for (var i in coreArr) {
                        var transition = coreArr[i] + "Transition";
                        if (temp.style[transition] !== undefined) {
                            return "-" + coreArr[i].toLowerCase() + "-"
                        }
                    }
                    return false;
                })(document.createElement("currentDom"))
            }
            return pageSwitch;
        })()
        //在jquery原型上添加方法pageSwtich
        $.fn.pageSwitch = function(options) {
            //返回对象，支持链式调用
            return this.each(function() {
                //实现单例模式
                var self = $(this),
                    instance = self.data("pageSwitch");
                if (!instance) {
                    instance = new pageSwitch(self, options);
                    self.data("pageSwitch", instance);
                }
            })
        }
        $.fn.pageSwitch.default = {
            selectors: {
                sections: ".sections",
                section: ".section",
                pages: ".pages",
                active: ".active"
            },
            index: 0,
            duration: 500,
            easing: "ease",
            pagination: true,
            loop: false,
            direction: "vertical",
            keyboard: true,
            callback: ""
        }
        $("#container").pageSwitch({
            direction:"vertical"
        })
        console.log($("#container").data("pageSwitch"))
    })(jQuery)


})
