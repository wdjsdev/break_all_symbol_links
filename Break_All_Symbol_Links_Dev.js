function breakAllSymbolLinks()
{
	var valid = true;
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var aB = docRef.artboards;
	var swatches = docRef.swatches;
	var obj = {};
	var arr = [];
	var curItem;

	docRef.selection = null;

	for(var l = 0, len = layers.length;l<len;l++)
	{
		breakLinksOnCurrentGarment(layers[l]);
	}

	function breakLinksOnCurrentGarment(parentLayer)
	{

		var ppLay = getPPLay(parentLayer);
		if(!ppLay)
		{
			return;
		}


		for(var x=0,len = ppLay.layers.length;x<len;x++)
		{
			var curLay = ppLay.layers[x];
			for(var y=0,yLen = curLay.pageItems.length;y<yLen;y++)
			{
				curItem = curLay.pageItems[y];
				dig(curItem);
			}
		}
	}


	function dig(item)
	{
		if(item.typename === "SymbolItem")
		{
			item.moveToBeginning(curItem);
			var name = item.name;
			item.breakLink();
			docRef.selection[0].name = name;
			removeHidden(docRef.selection[0]);
			docRef.selection = null;
		}
		else if(item.typename === "GroupItem")
		{
			for(var x=item.pageItems.length-1;x>=0;x--)
			{
				dig(item.pageItems[x]);
			}
		}
	}

	function removeHidden(group)
	{
		for(var x = group.pageItems.length-1;x>=0;x--)
		{
			if(group.pageItems[x].hidden)
			{
				group.pageItems[x].remove();
			}
		}
	}
	
}
breakAllSymbolLinks();