/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/BaseTypes/Class.js
 */

/**
 * Class: SuperMap.CartoLayer
 * Carto图层类，其属于矢量分块图层下的一个子图层
 */
SuperMap.CartoLayer=SuperMap.Class({
    /**
     * Property: tile
     * {<SuperMap.Tile.VectorImage>} Carto图层所属瓦片
     * */
    tile:null,

    /*
    * APIProperty: layerName
    * {String} Carto图层名
    * */
    layerName:null,

    /*
     * APIProperty: id
     * {String} Carto图层ID
     * */
    "id":null,

    /*
     * APIProperty: className
     * {String} Carto图层className
     * */
    "className":null,

    /**
     * Property:ugcLayerType
     * {String} UGC图层类型，对应服务端的图层类型，在矢量地图里主要有“VECTOR”和“THEME”两种
     * */
    "ugcLayerType":null,

    /*
     * Property: index
     * {Number} Carto图层在瓦片中的索引值，子图层的渲染顺序用的参照的这个index值
     * */
    index:0,

    /**
     * Property: originIndex
     * {Number} 这个索引表示本子图层在瓦片的cartoLayers属性中的索引
     * */
    originIndex:999,

    /**
     * Property: features
     * {Array} 此子图层下的所有要素集合
     * */
    features:null,

    /**
     * APIProperty: symbolizers
     * {Array} 符号集合，每一项都是一个CartoSymbolizer对象
     * */
    symbolizers:null,

    hightlightShader:null,

    /**
     * APIProperty: visible
     * {boolean} 值为true时图层可被渲染出来，false时不被渲染，默认为true
     * */
    visible:true,

    /**
     * Constructor: SuperMap.CartoLayer
     *  Carto图层类，其属于矢量分块图层下的一个子图层，此子图层其实是从服务端返回的recordset抽象出来的，
     *  主要是用于实现子图层的控制功能。Carto图层拥有id属性与className属性，这两个属性对应着CartoCSS中的id
     *  选择器中的id与类选择器中的类名。图层名默认为从服务端获取的图层名，也就是发布的数据中数据集名+"@"+数据源名
     *  而图层id与图层类名则默认将“@”符号替换为“__”,以在CartoCSS中使用。
     *
     *  Parameters:
     *  layerName - {String} 图层名
     *  tile - {<SuperMap.Tile.VectorImage>} 此Carto图层所属的瓦片
     *  options- {Object} 可选参数
     *
     *  Examples:
     *  (code)
     *   var recordSet=recordSets[i];             //recorSets为服务端返回的数据集
     *   var serverFeatures=recordSet.features;
     *   var layerName=recordSet.layerName;
     *   var cartoLayer=new SuperMap.CartoLayer(layerName,this,{originIndex:i});
     *   cartoLayer.addFeatures(serverFeatures);
     *  (end)
     * */
    initialize:function(layerName,tile,options){
        this.tile=tile;
        if(typeof layerName=="string"){
            this.layerName=layerName;
            var name=layerName.replace(/[@#]/gi,"__");
            this.id=name;
            this.className=name;
            this.index=0;
        }
        this.features=[];
        this.symbolizers=[];
        SuperMap.Util.extend(this, options);
    },

    /**
     * APIMethod: equals
     * 判断两个CartoLayer是否相等
     *
     * Parameters:
     * cartoLayer - {<SuperMap.CartoLayer>} 要比较carto图层
     * */
    equals:function(cartoLayer){
        if(!cartoLayer instanceof  SuperMap.CartoLayer){
            return false;
        }
        return cartoLayer.layerName===this.layerName&&cartoLayer.id===this.id&&cartoLayer.className===this.className;
    },

    /**
     * APIMethod: setIndex
     * 设置carto图层的index属性
     *
     * Parameters:
     * num - {Number} index值
     * */
    setIndex:function(num){
        if(!isNaN(num)){
            this.index=num;
        }
    },

    /**
     * APIMethod: addFeatures
     * 添加多个feature到Carto图层里
     *
     * Parameters:
     * features - {Array} feature集合
     * */
    addFeatures:function(features){
        if(features&&features.length>0){
            this.features=this.features.concat(features);
        }
    },

    /**
     * APIMethod: addFeature
     * 添加feature到Carto图层中
     *
     * Parameters:
     * faature - {Object} 矢量要素
     * */
    addFeature:function(feature){
        if(feature){
            this.features.push(feature);
        }
    },

    /**
     * APIMethod: getFeatureById
     * 通过要素id查找要素
     *
     * Parameters:
     * id - {number} 要素id
     *
     * Returns:
     * {Object} 查找到的要素，没找到返回null
     * */
    getFeatureById:function(id){
        for(var i= 0,len=this.features.length;i<len;i++){
             var feature=this.features[i];
            if(feature.id===id){
                return feature;
            }
        }
        return null;
    },

    /**
     * APIMethod: addSymbolizers
     * 添加多个carto符号到图层里
     *
     * Parameters:
     * symbolizers - {Array} Carto符号集合
     * */
    addSymbolizers:function(symbolizers){
        if(symbolizers&&symbolizers.length>0){
            this.symbolizers=this.symbolizers.concat(symbolizers);
        }
    },

    /**
     * APIMethod: addSymbolizer
     * 添加carto符号到图层里
     *
     * Parameters:
     * symbolizer - {SuperMap.CartoSymbolizer} carto符号
     * */
    addSymbolizer:function(symbolizer){
        if(symbolizer instanceof SuperMap.CartoSymbolizer){
            this.symbolizers.push(symbolizer);
        }
    },

    /**
     * APIMethod: redraw
     * 重绘此图层，也就是遍历其内的carto符号，然后调用它们的render方法时行重绘
     * */
    redraw:function(){
        if(this.visible){
            for(var i= 0,len=this.symbolizers.length;i<len;i++){
                var symbolizer=this.symbolizers[i];
                symbolizer.render();
            }
        }
    },

    /**
     * APIMethod: destroy
     * CartoLayer对象的析构函数，用于销毁此对象
     * */
    destroy:function(){
        this.tile=null;
        this.layerName=null;
        this.id=null;
        this.className=null;
        this.index=null;
        this.visible=false;
        for(var i=this.symbolizers.length-1;i>=0;i--){
            this.symbolizers[i].destroy();
        }
        this.symbolizers=null;
        this.features=null;
    },

    CLASS_NAME:"SuperMap.CatoLayer"
});