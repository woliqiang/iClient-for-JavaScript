module("CartoSymbolizer");

test("testCartoSymbolizer_constructorDefault",function(){
    var symbol=new SuperMap.CartoSymbolizer();
    equals(symbol.cartoLayer,null,"Property:cartoLayer");
    ok(symbol.isForLayer,"Property:isForLayer");
    equals(symbol.feature,null,"Property:feature");
    equals(symbol.shaderer,null,"Property:shaderer");
    symbol.destroy();
});

test("testCartoSymbolizer_constructor",function(){
    var cartoLayer=new SuperMap.CartoLayer();
    var feature={},shaderer={};
    var symbol=new SuperMap.CartoSymbolizer(cartoLayer,feature,shaderer,{});
    equals(symbol.cartoLayer,cartoLayer,"Property:cartoLayer");
    ok(!symbol.isForLayer,"Property:isForLayer");
    equals(symbol.feature,feature,"Property:feature");
    equals(symbol.shaderer,shaderer,"Property:shaderer");
    symbol.destroy();
});
test("testCartoSymbolizer_destructor",function(){
    var symbol=new SuperMap.CartoSymbolizer();
    symbol.destroy();
    equals(symbol.cartoLayer,null,"Property:cartoLayer");
    equals(symbol.feature,null,"Property:feature");
    equals(symbol.shaderer,null,"Property:shaderer");
});