module("Image");

test("TestImage_constructorDefault", function () {
    expect(10);
    var name="Image",
        url="Images/Day.jpg",
        bounds= new SuperMap.Bounds(-180, -90, 180, 90),

        layer=new SuperMap.Layer.Image(name,url,bounds);

    ok(layer instanceof SuperMap.Layer.Image, "layer instanceof SuperMap.Layer.Image");
    equals(layer.name, name, "name");
    equals(layer.CLASS_NAME, "SuperMap.Layer.Image", "CLASS_NAME");
    equals(layer.isBaseLayer, true, "isBaseLayer");
    equals(layer.extent, bounds, "extent");
    equals(layer.url, url, "url");
    //equals(layer.useCanvas, true, "useCanvas");           //测试时不一定都是支持canvas的浏览器
    equals(layer.changeDx, 0, "changeDx");
    equals(layer.changeDy, 0, "changeDy");
    equals(layer.memoryImg, null, "memoryImg");
    equals(layer.tile, null, "tile");
});
test("TestImage_destroy",function () {
    expect(9);
    var name="Image",
        url="Images/Day.jpg",
        bounds= new SuperMap.Bounds(-180, -90, 180, 90),

        layer=new SuperMap.Layer.Image(name,url,bounds);
    layer.destroy();
    ok(layer.url == null, "url");
    ok(layer.name == null, "name");
    ok(layer.useCanvas == true, "useCanvas");
    ok(layer.extent == null, "extent");
    ok(layer.changeDx == 0, "changeDx");
    ok(layer.changeDy == 0, "changeDy");
    ok(layer.memoryImg == null, "memoryImg");
    ok(layer.tile == null, "tile");
    ok(layer.isBaseLayer == true, "isBaseLayer");
});
