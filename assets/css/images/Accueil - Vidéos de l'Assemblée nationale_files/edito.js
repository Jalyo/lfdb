	// requete Ajax pour recuperation de l edito
	var reqEdito = null;
	var docXmlEdito = null;

	// Template de fichier XML pour l edito : edito_aaaammjj.xml (annee, mois, jour)
	var configEditoTemplate = "../../../../live/xml/edito";
	
	// titre de l editorial
	var titre = "";
	// introduction de l editorial
	var introduction = "";
	// contenu des diffusions
	var listeDiffusion = new Array();
		
	// parsing de l edito : lecture du fichier edito_aaaammjj.xml ou edito.xml si absent
	function parseEdito(withoutDate)
	{
		// lecture XML
		reqEdito  = getHttpRequest();

		reqEdito.onreadystatechange = function ()
		{       
			if (reqEdito.readyState == 4)
			{
				if (reqEdito.status == 200)
				{
					if (FFBrowser)
					{
						// declaration pour Mozilla et FF
						docXmlEdito = document.implementation.createDocument('', '', null);
						var parser = new DOMParser();
						docXmlEdito = parser.parseFromString(reqEdito.responseText, "text/xml");
						parseXML();
					}
					else if (IEBrowser)
					{
						// declaration pour IE
						docXmlEdito = new ActiveXObject("Microsoft.XMLDOM");  
						docXmlEdito.loadXML(reqEdito.responseText);          
						parseXML();
					}
				}   
				else    
				{
					if (withoutDate == undefined)
						parseEdito(true);
					else
						console.log("Problème lors de la récupération de l'édito : " + reqEdito.status + " - " + reqEdito.statusText);
				}   
			} 
		}; 

		var url = configEditoTemplate;
		var previewEdito = extractUrlParams()["previewEdito"];
		if (typeof(previewEdito) != "undefined"){
			url += "_" + previewEdito + "_temp.xml";
		}
		else{
			if (withoutDate == undefined)
				url = 'php/getedito.php';
			else
				url += ".xml";
		}
		reqEdito.open("GET", url + "?" + new Date() * Math.random(), true); 
		reqEdito.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
		reqEdito.send(null);  
	}

	// Parse le fichier xml editorial
    function parseXML()
	{
		// element racine du xml
		var config = docXmlEdito.documentElement;
		// nombre de diffusions
		var lenDiff = 0;

		if (config.tagName == "editorial")
		{
			for (var i = 0; i < config.childNodes.length; i++)
			{
				if (config.childNodes[i].nodeType != 1) continue;
				switch (config.childNodes[i].tagName)
				{
					case "titre" :
						titre = config.childNodes[i].firstChild.nodeValue;
						break;
					case "introduction" :
						introduction = config.childNodes[i].firstChild.nodeValue;
						break;
					case "diffusion" :
						lenDiff = listeDiffusion.length;
						listeDiffusion[lenDiff] = new Array();
						
						for (var j = 0; j < config.childNodes[i].childNodes.length; j++)
						{
							var diff = config.childNodes[i].childNodes[j];
							if (diff.nodeType != 1) continue;
							if (diff.tagName != "point") {
								listeDiffusion[lenDiff][diff.tagName] = (diff.firstChild != null) ? diff.firstChild.nodeValue : "";
								// tag libelle : remplacement de la valeur ASSEMBLEE NATIONALE par Seance publique
								if ((diff.tagName == "libelle_court") && (listeDiffusion[lenDiff][diff.tagName] == "AN"))
									listeDiffusion[lenDiff]["libelle"] = "Séance publique";
							} else {
								// point a l'ordre du jour de la diffusion
								if (listeDiffusion[lenDiff][diff.tagName] == null)
									listeDiffusion[lenDiff][diff.tagName] = new Array();
								var no_point = 0;
								var libelle = "";
								for (var k = 0; k < diff.childNodes.length; k++)
								{
									var point = diff.childNodes[k];
									if (point.nodeType != 1) continue;
									if (point.tagName == "no_point")
										no_point = point.firstChild.nodeValue;
									else
										libelle = point.firstChild.nodeValue;
								}
								listeDiffusion[lenDiff][diff.tagName][no_point] = libelle;
							}
						}
						break;
					default:
				}
			}
		}
		
		traiteXMLConfig();
	}
