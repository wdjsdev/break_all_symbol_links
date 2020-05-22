#target Illustrator
function breakAllSymbolLinks()
{
	var valid = true;
	var scriptName = "break_all_symbol_links";

	function getUtilities()
	{
		var result = [];
		var utilPath = "/Volumes/Customization/Library/Scripts/Script_Resources/Data/";
		var ext = ".jsxbin"

		//check for dev utilities preference file
		var devUtilitiesPreferenceFile = File("~/Documents/script_preferences/dev_utilities.txt");

		if(devUtilitiesPreferenceFile.exists)
		{
			devUtilitiesPreferenceFile.open("r");
			var prefContents = devUtilitiesPreferenceFile.read();
			devUtilitiesPreferenceFile.close();
			if(prefContents === "true")
			{
				utilPath = "~/Desktop/automation/utilities/";
				ext = ".js";
			}
		}

		if($.os.match("Windows"))
		{
			utilPath = utilPath.replace("/Volumes/","//AD4/");
		}

		result.push(utilPath + "Utilities_Container" + ext);
		result.push(utilPath + "Batch_Framework" + ext);

		if(!result.length)
		{
			valid = false;
			alert("Failed to find the utilities.");
		}
		return result;

	}

	var utilities = getUtilities();
	for(var u=0,len=utilities.length;u<len;u++)
	{
		eval("#include \"" + utilities[u] + "\"");	
	}

	if(!valid)return;
	
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