module("CartoCSS");

test("testCartoCSS_constructorDefault",function(){
    var cartoCss=new SuperMap.CartoCSS();
    equals(cartoCss.cartoStr,"","Property:cartoStr");
    equals(cartoCss.shaders,null,"Property:shaders");
    cartoCss.destroy();
});

test("testCartoCSS_constructor",function(){
    var cartoCssStr="@color:#123;";
    var cartoCss=new SuperMap.CartoCSS(cartoCssStr);
    equals(cartoCss.cartoStr,cartoCssStr,"Property:cartoStr");
    ok(cartoCss.shaders,"Property:shaders");
    cartoCss.destroy();
});

test("testCartoCSS_getShaders",function(){
    var cartoCssStr="@color:#123;";
    var cartoCss=new SuperMap.CartoCSS(cartoCssStr);
    var ruleSets=cartoCss.parse(cartoCssStr);
    equals(ruleSets.rules.length,1,"Method:parse");
    var shaders=cartoCss.toShaders();
    equals(shaders.length,0,"Method:toShaders");
    cartoCss.destroy();
});

test("testCartoCSS_destructor",function(){
    var cartoCss=new SuperMap.CartoCSS();
    cartoCss.destroy();
    equals(cartoCss.cartoStr,null,"Property:cartoStr");
    equals(cartoCss.shaders,null,"Property:shaders");
});

/*test("testCartoCSS_Tree_function",function(){
    var r=255,g=255,b=255,a=1;
    var funcs=SuperMap.CartoCSS.Tree.functions;

});*/
