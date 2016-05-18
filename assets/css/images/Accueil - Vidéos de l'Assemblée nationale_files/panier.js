/*************************************************/
/* Gestion panier                                */
/*************************************************/

var panier = null;
var selectedId = "";

function panierOuvrir()
{
	panier = new folder(0,0,"panier");
	panier.fromCookie(GetCookie("VNpanier"));
	
    var listPanierContent = "";
	var panierItems = panier.getMediaList();

    selectedId = "";
	if (panierItems != null)
		for (var index = 0; index < panierItems.length; index++)
		{
			listPanierContent += '<li id="panierItem' + index + '"><a href="#"><img src="' + panierItems[index].Thumbnail + '" border="0" onclick="panierSelection('+index+')"/></a>';
			listPanierContent += '<a class="isel" href="#" onclick="panierSelection('+index+')">Sélectionner la séquence : ' + getShortDate(panierItems[index].Date) + '</a>';
			listPanierContent += '<p>'+((panierItems[index].Name.length > 105) ? (panierItems[index].Name.substring(0,105) + '...') :  panierItems[index].Name ) + '</p>';
			listPanierContent += '<p>'+((panierItems[index].Description.length > 105) ? (panierItems[index].Description.substring(0,105) + '...') :  panierItems[index].Description ) + '</p></li>';
		}
    
    if (listPanierContent !== "")
    {
        document.getElementById("listePanier").innerHTML = "<ul>"+listPanierContent+"</ul>";
		panierSelection(0);
    }
    else
    {
        document.getElementById("listePanier").innerHTML = '<p style="margin:20px">Panier vide</p>';
    }
}

function panierSelection(index)
{
	var itemId = "panierItem" + index;
	
	// double-clic -> demarrage de la video
	if (selectedId == itemId)
	{
		var item = panier.getMediaList()[index];
		parent.window.location = getLink(item.Id, item.synchroId, item.Date, item.Name);
		return;
	}

	// simple clic -> simple sélection
    if (selectedId !== "")
	{
		document.getElementById(selectedId).style.border = 'none';
		jqselectedId="#" + selectedId;
		jQuery(jqselectedId).html(jQuery(jqselectedId).html().replace(/Séquence sélectionnée \: /,"Sélectionner la séquence : "));
		jQuery(jqselectedId).removeClass('sel');
	}
    document.getElementById(itemId).style.border = '1px solid #A91526';
	jqitemId="#" + itemId;
	jQuery(jqitemId).addClass('sel');
	jQuery(jqitemId).html(jQuery(jqitemId).html().replace(/Sélectionner la séquence \: /,"Séquence sélectionnée : "));
	
	// mise a jour du lien de telechargement sur mobile et tablette
	if ($('#downloadBasketButton').attr('target') != undefined)
	{
		var item = panier.getMediaList()[index];
		$('#downloadBasketButton').attr('href', item.urlToDownload);
	}
    
    selectedId = itemId;
}

function panierSupprimerSequence()
{
    if (selectedId !== "")
    {
        var index = parseInt(selectedId.substring(10),10);
        panier.removeMedia(index);
		SetCookie("VNpanier", panier.toCookie(), 1);
    }
    panierOuvrir();
}

function panierVider()
{
	panier = new folder(0,0,"panier");
	SetCookie("VNpanier", panier.toCookie(), 1);
    panierOuvrir();
}

function panierTelecharger()
{
	var panierItems = panier.getMediaList();
	if (panierItems != null && panierItems.length > 0)
	{
		var index = 0;
		if (selectedId !== "")
		{
			index = parseInt(selectedId.substring(10),10);
		}
		var item = panierItems[index];
		
		$.ajax(
		{
			type: "GET",
			url: 'php/testurl.php?checkUrl='+item.urlToDownload,
			cache: false,
			async: false,
			dataType: "text",
			success: function(text)
			{
				if (text=='true')
				{
					var cmd = "document.getElementById(\'downloadFilename\').value =\"" + item.urlToDownload + "\";document.forms[\'downloadForm\'].submit();";
					setTimeout(cmd,500);
				}
				else
				{
					jQuery('#monpanier').modal('hide');
					$('#tcin').val(item.tcin);
					$('#tcout').val(item.tcout);
					jQuery('#mailForm').modal('show');
				}
			},
			error: function(msg) 
			{
				//console.log('error:'+msg);
			}
		});
	}
}

// Ajoute une sequence au panier
function panierAjouter(seq)
{
	var panier = new folder(0,0,"panier");
	panier.fromCookie(GetCookie("VNpanier"));

	if (seq.synchro != 0)
	{
		// on verifie que la sequence n'est pas deja dans le panier
		var checkIndex = 0;
		var mediaList = panier.getMediaList();
		if (mediaList != null)
			while(checkIndex < mediaList.length)
			{
				if ((mediaList[checkIndex].Id == seq.id)
					&& ((mediaList[checkIndex].synchroId == seq.synchro)))
				{
					return;
				}
				checkIndex++;
			}
	}
	
	var newMedia = new media (seq.id, seq.name, seq.libelle, seq.thumbnail, seq.date, seq.date, seq.date, "", "", seq.url, "");
	newMedia.urlToDownload = seq.url;
	newMedia.synchroId = seq.synchro;
	newMedia.tcin = seq.tcin;
	newMedia.tcout = seq.tcout;
    panier.addMedia2(newMedia);
	
	SetCookie("VNpanier", panier.toCookie(), 1);
	jQuery('#ajouterPanier').modal('show');
}

function SetCookie(name, value, days) {
     var expire = new Date ();
     expire.setTime (expire.getTime() + (24 * 60 * 60 * 1000) * days);
     document.cookie = name + "=" + escape(value) + "; expires=" +expire.toGMTString();
}
function GetCookie(name) {
     var startIndex = document.cookie.indexOf(name);
     if (startIndex != -1) {
          var endIndex = document.cookie.indexOf(";", startIndex);
          if (endIndex == -1) endIndex = document.cookie.length;
          return unescape(document.cookie.substring(startIndex+name.length+1, endIndex));
     }
     else {
          return null;
     }
}
function DeleteCookie(name) {
     var expire = new Date ();
     expire.setTime (expire.getTime() - (24 * 60 * 60 * 1000));
     document.cookie = name + "=; expires=" + expire.toGMTString();
}
