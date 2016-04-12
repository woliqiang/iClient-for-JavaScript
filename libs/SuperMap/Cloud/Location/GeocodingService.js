/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/Util.js
 */

/**
 * Class: SuperMap.Cloud.GeocodingService
 * SQL 查询服务类。
 * 在一个或多个指定的图层上查询符合 SQL 条件的空间地物信息。
 * 
 * Inherits from:
 *  - <SuperMap.REST.QueryService> 
 */
SuperMap.Cloud.GeocodingService = SuperMap.Class(SuperMap.ServiceBase, {
    /**
     * Constant: EVENT_TYPES
     * {Array(String)}
     *
     * 此类支持的事件类型:
     * .0.
     * .0
     * - *processCompleted* 服务端返回分析结果触发该事件。
     * - *processFailed* 服务端分析失败触发该事件。
     */
    EVENT_TYPES: ["processCompleted", "processFailed"],

    /**
     * APIProperty: events
     * {<SuperMap.Events>} 在 GetLayersInfoService 类中处理所有事件的对象，支持两种事件 processCompleted 、processFailed ，服务端成功返回查询结果时触发 processCompleted 事件，服务端返回查询结果失败时触发 processFailed 事件。
     */
    events: null,

    /**
     * APIProperty: eventListeners
     * {Object} 监听器对象，在构造函数中设置此参数（可选），对 PathAnalystService 支持的两个事件 processCompleted 、processFailed 进行监听，相当于调用 SuperMap.Events.on(eventListeners)。
     */
    eventListeners: null,

    /**
     * Property: lastResult
     * {Array(<PathAnalystResult>)}服务端返回的结果数据。
     */
    lastResult: null,

    /**
     * Constructor: SuperMap.Cloud.GeocodingService
     * 路径导航分析服务类构造函数。
     *
     * Parameters:
     * url - {String} 分析服务提供者地址url。
     * 如 http://beta.isupermap.com/iserver/services/navigation/rest/navigationanalyst/China/pathanalystresults。
     *
     * Allowed options properties:
     * eventListeners - {Object} 需要被注册的监听器对象。
     */
    initialize: function(url,options) {
        SuperMap.ServiceBase.prototype.initialize.apply(this, arguments);
        if (options) {
            SuperMap.Util.extend(this, options);
        }
        var me = this;
        me.events = new SuperMap.Events(
            me, null, me.EVENT_TYPES, true
        );
        if(me.eventListeners instanceof Object) {
            me.events.on(me.eventListeners);
        }
    },

    /**
     * APIMethod: destroy
     * 释放资源,将引用资源的属性置空。
     */
    destroy: function() {
        SuperMap.ServiceBase.prototype.destroy.apply(this, arguments);
        var me = this;
        me.EVENT_TYPES = null;
        me.lastResult = null;
        if(me.events){
            me.events.un(me.eventListeners);
            me.events.listeners = null;
            me.events.destroy();
            me.events = null;
            me.eventListeners = null;
        }
    },

    /**
     * APIMethod: processAsync
     * 发送路径导航分析请求到服务端。
     *
     * Parameters:
     * params - {Array(<SuperMap.Cloud.GeocodingParameter>)} 分析请求参数，由 PathAnalystParameter 对象组成的数组。
     */
    processAsync: function(params) {
        if(!params){
            return;
        }
        var me = this;
        if(me.isInTheSameDomain){
            me.url += ".json?";
        }else{
            me.url += ".jsonp?";
        }
        //参数封装，以利于传输
        me.request({
            method: "GET",
            params:params.toObject(),
            scope: me,
            success: me.pathAnalystComplete,
            failure: me.pathAnalystError
        });

    },

    /**
     * Method: pathAnalystComplete
     * 分析成功，执行此方法。
     *
     * Parameters:
     * result - {Object} 服务端返回的导航路径分析结果。
     */
    pathAnalystComplete: function(result) {
        var me = this,
            geocodingResult;
        geocodingResult = SuperMap.Util.transformResult(result);

        me.lastResult = SuperMap.Cloud.GeocodingResult.fromJson(result);
        geocodingEvt = new SuperMap.Cloud.GeocodingEventArgs(geocodingResult, result);
        me.events.triggerEvent("processCompleted", geocodingEvt);
    },

    /**
     * Method: pathAnalystError
     * 路径导航分析失败，执行此方法。
     *
     * Parameters:
     * result -  {Object} 服务器返回的结果对象。
     */
    pathAnalystError: function(result) {
        var me = this,
            error = null,
            serviceException = null,
            qe = null;
        result = SuperMap.Util.transformResult(result);
        error = result.error;
        if (!error) {
            return;
        }
        serviceException = SuperMap.ServiceException.fromJson(error);
        qe = new SuperMap.ServiceFailedEventArgs(serviceException, result);
        me.events.triggerEvent("processFailed", qe);
    },
    CLASS_NAME: "SuperMap.Cloud.GeocodingService"
});
