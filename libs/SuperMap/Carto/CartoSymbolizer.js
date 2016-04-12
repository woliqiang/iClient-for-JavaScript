/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/BaseTypes/Class.js
 */

/**
 * Class: SuperMap.CartoSymbolizer
 * CartoCSS符号类，其保存了渲染几何图形所需要的渲染信息
 */
SuperMap.CartoSymbolizer=SuperMap.Class({
    /**
     * Property: context
     * {CanvasRenderingContext2D} 绘制Canvas上下文,此值将会传递给CartoRenderer
     * */
    context:null,

    /**
     * Property: hitContext
     * {CanvasRenderingContext2D} 用于要素选择的Canvas上下文,此值将会传递给CartoRenderer
     * */
    hitContext:null,

    /**
     * Property: feature
     * {Object} Carto符号对应的一个要素，也可以为空
     * */
    feature:null,

    /**
     * Property: shaderer
     * {Object} 着色器对象，其拥有shader或者style属性，分别用于保存来自CartoCSS和服务端返回的渲染风格信息
     * */
    shaderer:null,

    hightlightShader:null,

    /**
     * Property: layer
     * {<SuperMap.Layer.TiledVectorLayer>} 此Carto符号所属的矢量分块图层
     * */
    layer:null,

    /**
     * Property: cartoLayer
     * {<SuperMap.CartoLayer>} 此Carto符号所属的Carto图层
     * */
    cartoLayer:null,

    /**
     * Property: cartoRenderer
     * {<SuperMap.CartoRenderer>} 符号系统的渲染器
     * */
    cartoRenderer:null,

    /**
     * Property: isForLayer
     * {Boolean} 此值如果为true，则此符号类将应用于cartoLayer里的所有要素，否则只应用于
     * 其自身的要素，默认为false
     * */
    isForLayer:false,

    /**
     * Constructor: SuperMap.CartoSymbolizer
     * Carto符号系统的符号类，此符号类的主要功能就是将来自CartoCSS的一套style和来自服务端的style
     * 转化为Canvas绘制用的style，并将这个style赋到faeture上，供渲染器类进行渲染。相同的要素也可以
     * 拥有多个不同的符号，多个基本符号组合成一个复杂的符号
     *
     * Parameters:
     * cartoLayer - {<SuperMap.CartoLayer>} 此符号对象所属的Carto图层
     * feature - {Object} 此符号类所对应的要素对象
     * shaderer - {Object} 渲染器信息
     * options - {Object} 可选参数
     *
     * Examples:
     * (code)
     *  var symbol=new SuperMap.CartoSymbolizer(cartoLayer,feature,{shader:shader},
     *  {
     *      layer:layer,              //此图层指的是TiledVectorLayer
     *      context:context,          //用于绘制显示要素的Canvas上下文
     *      hitContext:hitContext     //用于要素选择的Canvas上下文
     *  });
     *  symbol.render();
     * (end)
     * */
    initialize:function(cartoLayer,feature,shaderer,options){
        this.cartoLayer=cartoLayer;
        this.isForLayer=!feature;
        this.feature=feature;
        this.shaderer=shaderer;
        SuperMap.Util.extend(this,options);

        //判断是否设置了renderer，没有则通过渲染器列表判断支持情况。
        if (!this.cartoRenderer) {
            this.cartoRenderer=new SuperMap.CartoRenderer(this.context,this.hitContext,options);
        }

    },

    /**
     * APIMethod: destroy
     * 符号类析构函数
     * */
    destroy:function(){
        this.context=null;
        this.shader=null;
        this.cartoLayer=null;
        this.cartoRenderer=null;
        this.feature=null;
    },

    /**
     * APIMethod: fromCartoStyle
     * 此函数的功能就是将从CartoCSS中解析出来的style转化为Canvas绘制时用到的style
     * 并对未赋值的style属性赋予默认值
     *
     * Parameters:
     * feature - {Object} 矢量要素对象
     * shader - {Object} 从CartoCSS解析出来的渲染器
     * zoom - {Number} 地图当前的缩放级别
     * */
    fromCartoStyle:function(type,attributes,shader,zoom){
        var style={},temp_style={};

        this.transformCartoStyle(temp_style,type,attributes,shader,zoom,true);

        //设置默认值
        var canvasStyle=SuperMap.CartoRenderer._expandCanvasStyle[type];
        for(var prop in canvasStyle){
            if(prop in temp_style){
                style[prop]=temp_style[prop]
            }else{
                var val=canvasStyle[prop];
                style[prop]=val;
            }
        }
        return style;
    },

    /**
     * Method: transformCartoStyle
     * 将CartoCSS的style转化为canvas的style
    * */
    transformCartoStyle:function(style,type,attributes,shader,zoom,filter){
        if(!shader)return;
        style=style||{};
        var cartoStyleMap= SuperMap.CartoSymbolizer._cartoStyleMap[type];
        var fontSize,fontName;
        for(var i= 0,len=shader.length;i<len;i++){
            //console.log("setcartostyle inside");
            var _shader=shader[i];
            var prop=cartoStyleMap[_shader.property];
            var value=_shader.getValue(attributes,zoom,filter);
            if((value!=null||value!=undefined)&&prop){
                if(prop==="fontSize"){
                    //斜杠后面为行间距，默认为0.5倍行间距
                    fontSize = value+"px/"+value*0.5+"px ";
                    style.textHeight=value;
                }else if(prop==="fontName"){
                    fontName=value;
                }else{
                    if(prop==="globalCompositeOperation"){
                        value=SuperMap.CartoSymbolizer._compOpMap[value];
                        if(!value||value==="")continue;
                    }
                    style[prop]=value;
                }

            }
        }
        if(fontSize||fontName){
            fontSize=fontSize||"10px ";
            fontName=fontName||"sans-serif";
            style.font=fontSize+fontName;
        }
    },

    /**
     * APIMethod: fromServerStyle
     * 此函数用来将来自服务端的style属性转化在Canvas绘制时用到的style
     *
     * Parameters:
     * feature - {Object} 矢量要素对象
     * style - {Object} 从服务端获取的风格信息
     * */
    fromServerStyle:function(type,style){
        var new_style=null;
        if(type==="POINT"){
            new_style={};

            var symbolParameters = {
            	"transparent": true,
                "resourceType": "SYMBOLMARKER",
                "picWidth": Math.ceil(style.markerSize*SuperMap.DOTS_PER_INCH*SuperMap.INCHES_PER_UNIT["mm"]),
                "picHeight": Math.ceil(style.markerSize*SuperMap.DOTS_PER_INCH*SuperMap.INCHES_PER_UNIT["mm"]),
                "style": JSON.stringify(style)
            };
            var imageUrl = SuperMap.Util.urlAppend(this.layer.url + "/symbol.png", SuperMap.Util.getParameterString(symbolParameters));
            new_style.pointFile=imageUrl;
        }else if(type==="TEXT"){
            new_style={};
            var fontStr = "";
            //设置文本是否使用粗体
            fontStr+=style.bold?"bolder ":"normal ";
            //设置文本是否倾斜
            fontStr+=!!style.italic?"italic ":"normal ";
            //设置文本的尺寸（对应fontHeight属性）和行高，行高iserver不支持，默认5像素
            //固定大小的时候单位是毫米
            var text_h=style.fontHeight*SuperMap.DOTS_PER_INCH*SuperMap.INCHES_PER_UNIT["mm"]*0.9;    //毫米转像素
            fontStr+= text_h +"px/5px ";

            //设置文本字体类型
            //在桌面字体钱加@时为了解决对联那种形式，但是在canvas不支持，并且添加了@会导致
            //字体大小被固定，这里需要去掉
            if(style.fontName.indexOf("@"))
            {
                fontStr+= style.fontName.replace(/@/g,"");
            }
            else
            {
                fontStr+= style.fontName
            }
            new_style.font=fontStr;
            new_style.textHeight=text_h;

            //设置对齐方式
            var alignStr=style.align.replace(/TOP|MIDDLE|BASELINE|BOTTOM/,"");
            new_style.textAlign=alignStr.toLowerCase();
            var baselineStr=style.align.replace(/LEFT|RIGHT|CENTER/,"");
            if(baselineStr==="BASELINE")baselineStr="alphabetic";
            new_style.textBaseline = baselineStr.toLowerCase();

            /*//首先判定是否需要绘制阴影，如果需要绘制，阴影应该在最下面
            if(style.shadow)
            {

                //桌面里面的阴影没有做模糊处理，这里统一设置为0,
                new_style.shadowBlur=0;
                //和桌面统一，往右下角偏移阴影，默认3像素
                new_style.shadowOffsetX=3;
                new_style.shadowOffsetY=3;
                //颜色取一个灰色，调成半透明
                new_style.shadowColor="rgba(50,50,50,0.5)";
            }else{
               new_style.shadowOffsetX=0;
               new_style.shadowOffsetY=0;
            }*/
            new_style.haloRadius=style.outline?1:0;
            new_style.backColor="rgba("+style.backColor.red+","+style.backColor.green+","+style.backColor.blue+",1)";
            new_style.foreColor ="rgba("+style.foreColor.red+","+style.foreColor.green+","+style.foreColor.blue+",1)";
        }else{
            new_style={};

            //目前只实现桌面系统默认的几种symbolID，非系统默认的面用颜色填充替代，线则用实线来替代
            var fillSymbolID=style["fillSymbolID"]>7?0:style["fillSymbolID"];
            var lineSymbolID=style["lineSymbolID"]>5?0:style["lineSymbolID"];
            for(var attr in style){
                var obj=SuperMap._serverStyleMap[attr];
                var canvasStyle=obj.canvasStyle;
                if(canvasStyle&&canvasStyle!=""){
                    var type=obj.type;
                    switch(type){
                        case "number":
                            var value=style[attr];
                            if(obj.unit){
                                //将单位转换为像素单位
                                value=value*SuperMap.DOTS_PER_INCH*SuperMap.INCHES_PER_UNIT[obj.unit]*2.5;
                            }
                            new_style[canvasStyle]=value;
                            break;
                        case "color":
                            var color=style[attr];
                            var backColor=style["fillBackColor"];
                            var value,alpha=1;
                            if(canvasStyle==="fillStyle"){
                                if(fillSymbolID===0||fillSymbolID===1){
                                    //当fillSymbolID为0时，用颜色填充，为1是无填充，即为透明填充，alpha通道为0
                                    alpha=1-fillSymbolID;
                                    value="rgba("+color.red+","+color.green+","+color.blue+","+alpha+")";
                                }else{
                                    //当fillSymbolID为2~7时，用的纹理填充,但要按照前景色修改其颜色
                                   try{
                                       var tempCvs=document.createElement("canvas");
                                       tempCvs.height=8;
                                       tempCvs.width=8;
                                       var tempCtx=tempCvs.getContext("2d");
                                       var image=new Image();
                                       tempCtx.drawImage(this.layer.fillImages["System "+fillSymbolID],0,0);
                                       var imageData=tempCtx.getImageData(0,0,tempCvs.width,tempCvs.height);
                                       var pix=imageData.data;
                                       for(var i= 0,len=pix.length;i<len;i+=4){
                                           var r=pix[i],g=pix[i+1],b=pix[i+2],a=pix[i+3];
                                           //将符号图片中的灰色或者黑色的部分替换为前景色，其余为后景色
                                           if(r<225&&g<225&&b<225){
                                               pix[i]=color.red;
                                               pix[i+1]=color.green;
                                               pix[i+2]=color.blue;
                                           }else if(backColor){
                                               pix[i]=backColor.red;
                                               pix[i+1]=backColor.green;
                                               pix[i+2]=backColor.blue;
                                           }
                                       }
                                       tempCtx.putImageData(imageData,0,0);
                                       image.src=tempCvs.toDataURL();

                                       value=this.context.createPattern(image,"repeat");
                                   }catch(e){
                                       throw Error("cross-origin");
                                   }
                                }
                            }else if(canvasStyle==="strokeStyle"){
                                if(lineSymbolID===0||lineSymbolID===5){
                                    //对于lineSymbolID为0时，线为实线，为lineSymbolID为5时，为无线模式，即线为透明，即alpha通道为0
                                    alpha=lineSymbolID===0?1:0;
                                }else{
                                    //以下几种linePattern分别模拟了桌面的SymbolID为1~4几种符号的linePattern
                                    var linePattern=[1,0];
                                    switch(lineSymbolID){
                                        case 1:
                                            linePattern=[9.7,3.7]
                                            break;
                                        case 2:
                                            linePattern=[3.7,3.7];
                                            break;
                                        case 3:
                                            linePattern=[9.7,3.7,2.3,3.7];
                                            break;
                                        case 4:
                                            linePattern=[9.7,3.7,2.3,3.7,2.3,3.7];
                                            break;
                                        default:
                                            break
                                    }
                                    new_style.lineDasharray=linePattern;
                                }
                                value="rgba("+color.red+","+color.green+","+color.blue+","+alpha+")";
                            }
                            new_style[canvasStyle]=value;
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        if(!new_style.globalAlpha)new_style.globalAlpha=1;
        return new_style;
    },

    /**
     * APIMethod: render
     * 此函数将渲染信息的类型来给选择相应的渲染风格，比如服务端的style会被转化为Canvas绘制时用的style，
     * 假如Shaderer拥有shader属性,则优先使用shader转化过来style，否则直接使用服务端style转化过来的style，
     * 转化出来的风格style会直接赋给feature的style属性，供CartoRenderer的drawFeature函数对要素进行渲染。
     * 假如这个要素在矢量分块图层的高亮显示表中，这个要素将会被标上高亮显示的标签
     * */
    render:function(){
        //将渲染器的canvas上下文换为本符号的上下文
        this.cartoRenderer.context=this.context;
        this.cartoRenderer.hitContext=this.hitContext;

        var zoom= this.layer.map.getZoom();
        if(this.isForLayer){
            if(this.cartoLayer.features.length<1)return;
            var style;
            for(var i= 0,len=this.cartoLayer.features.length;i<len;i++){
                var feature=this.cartoLayer.features[i],type=feature.geometry.type,attributes=feature.attributes||{};
                attributes.featureID=feature.id;
                if(this.shaderer&&this.shaderer.shader){
                    style=this.fromCartoStyle(type,attributes,this.shaderer.shader,zoom);
                }else if(this.shaderer&&this.shaderer.style){
                    if(type==="TEXT"){
                        var text_style=feature.geometry.textStyle;
                        style=this.fromServerStyle(type,text_style);
                    }else{
                        style=this.fromServerStyle(type,this.shaderer.style);
                    }
                }else{
                    style=this.fromCartoStyle(type,attributes,null,zoom);
                }

                //检查是否要高亮显示要素
                if((this.layer.currentHightlightShader&&this.checkHightlightInfo())||this.layer.wholeHightligthtShader){
                    var hlShader=this.layer.currentHightlightShader||this.layer.wholeHightligthtShader;
                    var filter=hlShader.featureFilter&&hlShader.featureFilter(feature.id);
                    feature.renderType="hightlight";
                    this.transformCartoStyle(style,type,attributes,hlShader,zoom,filter);
                }
                feature.layerIndex=this.cartoLayer.originIndex;
                this.cartoRenderer.drawFeature(feature,style);
            }
        }else{
            var feature=this.feature,style=feature.style||{},type=feature.geometry.type,attributes=feature.attributes||{};
            attributes.featureID=feature.id;
            //检查是否要高亮显示要素
            if((this.layer.currentHightlightShader&&this.checkHightlightInfo())||this.layer.wholeHightligthtShader){
                var hlShader=this.layer.currentHightlightShader||this.layer.wholeHightligthtShader;
                var filter=hlShader.featureFilter&&hlShader.featureFilter(feature.id);
                feature.renderType="hightlight";
                this.transformCartoStyle(style,type,attributes,hlShader,zoom,filter);
            }else{
                feature.renderType="normal";
                style=this.fromServerStyle(feature.geometry.type,this.shaderer.style);
            }
            feature.layerIndex=this.cartoLayer.originIndex;
            this.cartoRenderer.drawFeature(feature,style);
        }
    },

    /**
     * Method: checkHightlightInfo
     * 检查此要素是否位于矢量分块图层的高亮显示列表当中，是的话就返回true，否则返回false
     * */
    checkHightlightInfo:function(){
        var hlFeatureInfoes=this.layer.hightlightFeatureInfoes;
        if(!hlFeatureInfoes)return false;

        for(var i=hlFeatureInfoes.length-1;i>=0;i--){
            var hlFeatureInfo=hlFeatureInfoes[i];
            if(!hlFeatureInfo||!hlFeatureInfo.cartoLayer)continue;
            if(hlFeatureInfo.cartoLayer.id===this.cartoLayer.id)return true;
        }
        return false;
    },

    CLASS_NAME:"SuperMap.CartoSymbolizer"
});

/**
 * CartoCSS中的style属性名与Canvas的style属性名的对应表
 * */
SuperMap.CartoSymbolizer._cartoStyleMap={
    "TEXT":{
        //前两个属性值组成font
        "text-size":"fontSize",
        "text-face-name":"fontName",

        "text-align":"textAlign",
        "text-vertical-alignment":"textBaseline",
        /*expand*/
        "text-halo-radius":"haloRadius",
        "text-halo-color":"backColor",
        "text-fill":"foreColor",
        "text-opacity":"globalAlpha",
        "text-dx":"offsetX",
        "text-dy":"offsetY",
        "text-comp-op":"globalCompositeOperation"
    },
    /*expand*/
    "POINT":{
        "point-file":"pointFile",
        "point-fill":"fillStyle",
        "point-radius":"pointRadius",
        "point-halo-radius":"pointHaloRadius",
        "point-halo-color":"pointHaloColor",
        "point-dx":"offsetX",
        "point-dy":"offsetY",
        "point-opacity":"globalAlpha",
        "point-comp-op":"globalCompositeOperation"
    },
    "LINE":{
        "line-color":"strokeStyle",
        "line-width":"lineWidth",
        "line-cap":"lineCap",
        "line-join":"lineJoin",
        "line-miterlimit":"miterLimit",
        "line-dash-offset":"lineDashOffset",
        /*expand*/
        "line-opacity":"globalAlpha",
        "line-dasharray":"lineDasharray",
        "line-offset":"offset",
        "line-comp-op":"globalCompositeOperation"
    },
    "REGION":{
        /*包括LINE的部分，用以设置面的外围边界*/
        "line-color":"strokeStyle",
        "line-width":"lineWidth",
        "line-cap":"lineCap",
        "line-join":"lineJoin",
        "line-miterlimit":"miterLimit",
        "line-dash-offset":"lineDashOffset",
        /*expand*/
        "line-opacity":"lineOpacity",
        "line-dasharray":"lineDasharray",

        /*以下为面的特性*/
        "polygon-fill":"fillStyle",
        "polygon-dx":"offsetX",
        "polygon-dy":"offsetY",
        "polygon-opacity":"polygonOpacity",
        "polygon-comp-op":"globalCompositeOperation"
    }
};

/**
 * 服务端传过来的style属性名与Canvas的style属性名的对应表
 * */
SuperMap._serverStyleMap={
    fillBackOpaque:{
        canvasStyle:"",
        type:"bool",
        defaultValue:true
    },
    lineWidth:{
        canvasStyle:"lineWidth",
        type:"number",
        unit:"mm",
        defaultValue:0.1
    },
    fillBackColor:{
        canvasStyle:"",
        type:"color",
        defaultValue:"rgb(0,0,0)"
    },
    markerWidth:{
        canvasStyle:"",
        type:"number",
        unit:"mm",
        defaultValue:""
    },
    markerAngle:{
        canvasStyle:"",
        type:"number",
        unit:"degree",
        defaultValue:""
    },
    fillForeColor:{
        canvasStyle:"fillStyle",
        type:"color",
        defaultValue:"rgb(0,0,0)"
    },
    foreColor:{
        canvasStyle:"fillStyle",
        type:"color",
        defaultValue:"rgb(0,0,0)"
    },
    markerSize:{
        canvasStyle:"markerSize",
        type:"number",
        unit:"mm",
        defaultValue:2.4
    },
    fillGradientOffsetRatioX:{
        canvasStyle:"",
        type:"number",
        defaultValue:0
    },
    fillGradientOffsetRatioY:{
        canvasStyle:"",
        type:"number",
        defaultValue:0
    },
    lineColor:{
        canvasStyle:"strokeStyle",
        type:"color",
        defaultValue:"rgb(0,0,0)"
    },
    fillOpaqueRate:{
        canvasStyle:"",
        type:"number",
        defaultValue:100
    },
    markerHeight:{
        canvasStyle:"",
        type:"number",
        unit:"mm",
        defaultValue:0
    },
    fillGradientMode:{
        canvasStyle:"",
        type:"string",
        defaultValue:"NONE"
    },
    fillSymbolID:{
        canvasStyle:"",
        type:"number",
        defaultValue:0
    },
    fillGradientAngle:{
        canvasStyle:"",
        type:"number",
        unit:"degree",
        defaultValue:0
    },
    markerSymbolID:{
        canvasStyle:"",
        type:"number",
        defaultValue:0
    },
    lineSymbolID:{
        canvasStyle:"",
        type:"number",
        defaultValue:0
    }
};

/**
 * Canvas中的globalCompositeOperation属性值与CartoCSS中的CompOp属性值对照表
 * */
SuperMap.CartoSymbolizer._compOpMap={
    "clear":"",
    "src":"",
    "dst":"",
    "src-over":"source-over",
    "dst-over":"destination-over",
    "src-in":"source-in",
    "dst-in":"destination-in",
    "src-out":"source-out",
    "dst-out":"destination-out",
    "src-atop":"source-atop",
    "dst-atop":"destination-atop",
    "xor":"xor",
    "plus":"lighter",
    "minus":"",
    "multiply":"",
    "screen":"",
    "overlay":"",
    "darken":"",
    "lighten":"lighter",
    "color-dodge":"",
    "color-burn":"",
    "hard-light":"",
    "soft-light":"",
    "difference":"",
    "exclusion":"",
    "contrast":"",
    "invert":"",
    "invert-rgb":"",
    "grain-merge":"",
    "grain-extract":"",
    "hue":"",
    "saturation":"",
    "color":"",
    "value":""
}