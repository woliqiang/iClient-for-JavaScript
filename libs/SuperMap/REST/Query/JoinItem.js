/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/REST.js
 */

/**
 * Class: SuperMap.REST.JoinItem
 * 连接信息类。
 * 该类用于定义矢量数据集与外部表的连接信息。
 * 外部表可以为另一个矢量数据集（其中纯属性数据集中没有空间几何信息）
 * 所对应的 DBMS(Database Management System，数据库管理系统)表，
 * 也可以是用户自建的业务表。需要注意的是，矢量数据集与外部表必须属于同一数据源。
 * 用于连接两个表的字段的名称不一定相同，但类型必须一致。
 */
SuperMap.REST.JoinItem = SuperMap.Class({
    
    /** 
     * APIProperty: foreignTableName
     * {String} 外部表的名称。
     * 如果外部表的名称是以“表名@数据源名”命名方式，则该属性只需赋值表名。
     * 例如：外部表 Name@changchun，Name 为表名，changchun 为数据源名称，则该属性的赋值应为：Name。 
     */
    foreignTableName: null,
    
    /** 
     * APIProperty: joinFilter 
     * {String} 矢量数据集与外部表之间的连接表达式，即设定两个表之间关联的字段。
     * 例如，将房屋面数据集（Building）的 district 字段与房屋拥有者的纯属性数据集（Owner）的 region 字段相连接，
     * 两个数据集对应的表名称分别为 Table_Building 和 Table_Owner，
     * 则连接表达式为 Table_Building.district = Table_Owner.region。
     * 当有多个字段相连接时，用 AND 将多个表达式相连。 
     */
    joinFilter: null,
    
    /** APIProperty: joinType
     * {<SuperMap.REST.JoinType>} 两个表之间连接类型。
     * 连接类型决定了对两个表进行连接查询后返回的记录的情况。 
     */
    joinType: null,
    
    /**
     * Constructor: SuperMap.REST.JoinItem
     * 连接信息类构造函数。
     * 下面以SQL查询说明joinItem的使用方法：
     * (start code)
     *   function queryBySQL() {         
     *       // 设置与外部表的连接信息
     *       var joinItem = new SuperMap.REST.JoinItem({ 
     *           foreignTableName: "foreignTable", 
     *           joinFilter: "foreignTable.CONTINENT = Countries.CONTINENT", 
     *           joinType: "LEFTJOIN" 
     *       })
     *       var queryParam, queryBySQLParams, queryBySQLService;
     *       // 设置查询参数，在查询参数中添加joinItem关联条件信息
     *       queryParam = new SuperMap.REST.FilterParameter({
     *            name: "Countries@World",
     *            joinItems: [joinItem]
     *         }),
     *       queryBySQLParams = new SuperMap.REST.QueryBySQLParameters({
     *             queryParams: [queryParam]
     *         }),
     *       queryBySQLService = new SuperMap.REST.QueryBySQLService(url, {
     *             eventListeners: { "processCompleted": processCompleted, "processFailed": processFailed}
     *         });
     *       queryBySQLService.processAsync(queryBySQLParams);
     *  }
     *  function processCompleted(queryEventArgs) {//todo}
     *  function processFailed(e) {//todo}
     * (end)
     *
     * Parameters:
     * options - {Object} 参数。
     *
     * Allowed options properties:
     * foreignTableName - {String} 外部表的名称。
     * joinFilter - {String} 矢量数据集与外部表之间的连接表达式，即设定两个表之间关联的字段。
     * joinType - {<SuperMap.REST.JoinType>} 两个表之间连接类型。
     */
    initialize: function(options) {
        if (options) {
            SuperMap.Util.extend(this, options);
        }
    },
    
    /**
     * APIMethod: destroy
     * 释放资源，将引用资源的属性置空。 
     */
    destroy: function() {
        var me = this;
        me.foreignTableName = null;
        me.joinFilter = null;
        me.joinType = null;
    },
    
    /**
     * Method: toServerJSONObject
     * 转换成对应的 JSON 格式对象。
     */
    toServerJSONObject: function(){
        var dataObj = {};
        dataObj = SuperMap.Util.copyAttributes(dataObj, this);
        //joinFilter基本是个纯属性对象，这里不再做转换
        return dataObj;
    },
    
    CLASS_NAME: "SuperMap.REST.JoinItem"
});