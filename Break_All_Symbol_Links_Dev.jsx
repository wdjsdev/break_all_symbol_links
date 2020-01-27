function breakAllSymbolLinks()
{
	var valid = true;
	var scriptName = "break_all_symbol_links";

	//Production Utilities
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	// //Dev Utilities
	// eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Utilities_Container.js\"");
	// eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Batch_Framework.js\"");

	if(!valid)
	{
		return;
	}
	
	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var aB = docRef.artboards;
	var swatches = docRef.swatches;
	var obj = {};
	var arr = [];
	var curItem;
	var curSymbols = [];

	docRef.selection = null;

	for(var l = 0, masterLen = layers.length;l<masterLen;l++)
	{
		breakLinksOnCurrentGarment(layers[l]);
	}

	alert("Symbol Links Successfully Broken");

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
			// for(var y=0,yLen = curLay.pageItems.length;y<yLen;y++)
			for(var y = curLay.pageItems.length - 1; y>=0; y--)
			{
				curItem = curLay.pageItems[y];
				dig(curItem);
			}
			// for(var y=curSymbols.length-1;y>=0;y--)
			// {
			// 	curSymbols[y].group.moveToBeginning(curSymbols[y].parent);
			// }
			// curSymbols = [];
			
		}
	}


	function dig(item)
	{
		if(item.typename === "SymbolItem")
		{
			// item.moveToBeginning(curItem);
			var name = item.name;
			item.breakLink();
			if(docRef.selection.length)
			{
				docRef.selection[0].name = name;
				removeHidden(docRef.selection[0]);
				curSymbols.push({parent:curItem,group:docRef.selection[0]});
			}
			
			docRef.selection = null;
		}
		else if(item.typename === "GroupItem")
		{
			for(var d=item.pageItems.length-1;d>=0;d--)
			{
				dig(item.pageItems[d]);
			}
		}
	}

	function removeHidden(group)
	{
		if(group.typename !== "GroupItem")
		{
			return;
		}
		for(var rh = group.pageItems.length-1;rh>=0;rh--)
		{
			if(group.pageItems[rh].hidden)
			{
				group.pageItems[rh].remove();
			}
		}
	}
	
}
breakAllSymbolLinks();