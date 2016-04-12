module("CartoLayer");

test("testCartoLayer_constructorDefault",function(){
    var cartoLayer=new SuperMap.CartoLayer();
    equals(cartoLayer.tile,null,"Property:tile");
    equals(cartoLayer.layerName,null,"Property:layerName");
    equals(cartoLayer.id,null,"Property:id");
    equals(cartoLayer.className,null,"Property:className");
    equals(cartoLayer.index,0,"Property:index");
    cartoLayer.destroy();
});

test("testCartoLayer_constructor",function(){
    var layerName="CartoLayer@Carto";
    var nLayerName=layerName.replace(/[@#]/gi,"__");
    var cartoLayer=new SuperMap.CartoLayer(layerName,null,{});
    equals(cartoLayer.tile,null,"Property:tile");
    equals(cartoLayer.layerName,layerName,"Property:layerName");
    equals(cartoLayer.id,nLayerName,"Property:id");
    equals(cartoLayer.className,nLayerName,"Property:className");
    equals(cartoLayer.index,0,"Property:index");
});

test("testCartoLayer_destructor",function(){
    var cartoLayer=new SuperMap.CartoLayer();
    cartoLayer.destroy();
    equals(cartoLayer.tile,null,"Property:tile");
    equals(cartoLayer.layerName,null,"Property:layerName");
    equals(cartoLayer.id,null,"Property:id");
    equals(cartoLayer.className,null,"Property:className");
    equals(cartoLayer.index,null,"Property:index");
});