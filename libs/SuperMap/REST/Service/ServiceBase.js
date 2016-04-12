/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/Ajax.js
 * @requires SuperMap/Util.js
 */

/**
 * Class: SuperMap.ServiceBase
 * 服务基类。
 * 抽象类，查询、量算等服务类均继承该类。
 */
SuperMap.ServiceBase = SuperMap.Class({

    /**
     * APIProperty: url
     * {String} 服务访问地址。
     */
    url: null,

    /**
     * Property: isInTheSameDomain
     * {Boolean}
     */
    isInTheSameDomain: null,

    /**
     * Constructor: SuperMap.ServiceBase
     * 服务基类构造函数。
     *
     * Parameters:
     * url - {String} 服务访问地址。
     */
    initialize: function(url) {
        if(!url){
            return false;
        }
        var me = this;
        me.url = url;
        me.isInTheSameDomain = SuperMap.Util.isInTheSameDomain (me.url);
    },

    /**
     * APIMethod: destroy
     * 释放资源，将引用资源的属性置空。
     */
    destroy: function () {
        var me = this;
        me.url = null;
        me.isInTheSameDomain = null;
    },

    /**
     * APIMethod: request
     * 该方法用于向服务发送请求。
     *
     * Parameters:
     * options - {Object} 参数。
     *
     * Allowed options properties:
     * method - {String} 请求方式，包括GET，POST，PUT， DELETE。
     * url - {String}  发送请求的地址。
     * params - {Object} 作为查询字符串添加到url中的一组键值对，
     *     此参数只适用于GET方式发送的请求。
     * data - {String } 发送到服务器的数据。
     * success - {Function} 请求成功后的回调函数。
     * failure - {Function} 请求失败后的回调函数。
     * scope - {Object} 如果回调函数是对象的一个公共方法，设定该对象的范围。
     * isInTheSameDomain - {Boolean} 请求是否在当前域中。
     */
    request: function(options) {
        var me = this;
        options.url = options.url || me.url;

        //为url添加安全认证信息片段
        if (SuperMap.Credential.CREDENTIAL) {
            //当url中含有?，并且?在url末尾的时候直接添加token *网络分析等服务请求url会出现末尾是?的情况*
            //当url中含有?，并且?不在url末尾的时候添加&token
            //当url中不含有?，在url末尾添加?token
            var endStr = options.url.substring(options.url.length - 1, options.url.length);
            if (options.url.indexOf("?") > -1 && endStr=== "?") {
                options.url += SuperMap.Credential.CREDENTIAL.getUrlParameters();
            } else if (options.url.indexOf("?") > -1 && endStr !== "?") {
                options.url += "&" + SuperMap.Credential.CREDENTIAL.getUrlParameters();
            } else {
                options.url += "?" + SuperMap.Credential.CREDENTIAL.getUrlParameters();
            }
        }

        options.isInTheSameDomain = me.isInTheSameDomain;
        SuperMap.Util.committer(options);
    },

    CLASS_NAME: "SuperMap.ServiceBase"
});