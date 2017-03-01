

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});


//Function To Display Popup
function div_show(item) {
    var namediv=item.name; //addForm
    document.getElementById(namediv).style.display = "block";
    document.getElementById(namediv).style.zIndex = "1010";
};

//Function to Hide Popup
function div_hide(item){
    var namediv=item.name; //ex:addForm
    document.getElementById(namediv).style.display = "none";
    document.getElementById(namediv).style.zIndex = "1010";
};


function yourFunction(item){
    var action_src = "http://localhost:3000/search/" + document.getElementsByName("searchText")[0].value;
    item.href = action_src ;
    return true;
};

var playlistMem = "";

function showSongs(item) {
    var playlist="";
    if(item==="todelete" && playlistMem===""){
        playlist=playlistMem;
    }else{
        playlist = item.id;
    }
    playlistMem = playlist;
    var user = document.getElementById("username").name;
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
        } else {
        // code for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("songsList").innerHTML =this.responseText;
        }
    };
    xhttp.open("GET","/profile/"+playlist,true);
    xhttp.send();
    return true;
};

function create_list(item){
    var playlist = document.getElementById("addInput").value;
    if(playlist.indexOf(":")!=-1){
        alert("you cannot use \':\' in your playlist name!")
        return false;
    }
    if (playlist==="") {
        alert("Fill All Fields !");
    } else {
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
            } else {
            // code for IE6, IE5
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("playlistsList").innerHTML =this.responseText;
                alert("Playlist created correctly");
                document.getElementById("addInput").value="";
                document.getElementById("songsList").innerHTML = "";
                div_hide(item);
            }
            if (this.readyState == 4 && this.status == 500) {
                alert("Error occured: "+ this.responseText);
                document.getElementById("addInput").value="";
            }
        };
        xhttp.open("GET","/profile/create/"+playlist,true);
        xhttp.send();
    }

    return false;
}

function delete_list(item){
    var playlist = document.getElementById("deleteInput").value;
    if(playlist.indexOf(":")!=-1){
        alert("you cant delete playlists that arent yours!")
        return false;
    }
    if (playlist==="") {
        alert("Fill All Fields !");
    } else {
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
            } else {
            // code for IE6, IE5
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("playlistsList").innerHTML =this.responseText;
                alert("Playlist deleted correctly");
                document.getElementById("deleteInput").value="";
                document.getElementById("songsList").innerHTML = "";
                div_hide(item);
                
            }
            if (this.readyState == 4 && this.status == 500) {
                alert("Error occured: "+ this.responseText);
                document.getElementById("addInput").value="";
                
            }
        };
        xhttp.open("GET","/profile/delete/"+playlist,true);
        xhttp.send();
    }

    return false;
};

function rename_list(item){
    var renameOld = document.getElementById("renameOld").value;
    var renameNew = document.getElementById("renameNew").value;
    if(renameOld.indexOf(":")!=-1){
        alert("you cant rename playlists that arent yours!")
        return false;
    }
    if(renameNew.indexOf(":")!=-1){
        alert("you cannot use \':\' in your playlist name!")
        return false;
    }
    if (renameOld==="" || renameNew==="") {
        alert("Fill All Fields !");
    } else {
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
            } else {
            // code for IE6, IE5
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("playlistsList").innerHTML =this.responseText;
                alert("Playlist renamed correctly");
                document.getElementById("renameOld").value="";
                document.getElementById("renameNew").value="";
                document.getElementById("songsList").innerHTML = "";
                div_hide(item);
                
            }
            if (this.readyState == 4 && this.status == 500) {
                alert("Error occured: "+ this.responseText);
                document.getElementById("renameOld").value="";
                document.getElementById("renameNew").value="";
            }
        };
        xhttp.open("GET","/profile/rename/"+renameOld+"/"+renameNew,true);
        xhttp.send();
    }

    return false;
};

function delete_songs(item){
    var checks=  document.getElementsByName("issueCheck");
    var first =true;
    var songs = [];
    if(confirm("Are you sure you want to delete the selected songs?")){
        for (var i=0; i<checks.length; i++)  {
            if (checks[i].checked)  {
                first=false;
                songs.push(checks[i].id)
            }
        }
        if(checks.length===0 || first===true){
            alert("There are no songs or you didn't select any song")
            return;
        }
        
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
            } else {
            // code for IE6, IE5
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("songsList").innerHTML =this.responseText;
                div_hide(item);
                alert("songs deleted succesfully");
            }
            if (this.readyState == 4 && this.status == 500) {
                alert("Error occured: "+ this.responseText);
            }
        };
        xhttp.open("post","/profile/deletesongs/",true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({playlist:playlistMem,songs:songs}));

    }else{
        return;
    }
    
};

function share_playlist(item){
    var shareuser = document.getElementById("shareUser").value;
    var shareplaylist = document.getElementById("sharePlaylist").value;
    var permissions = "";
    if(document.getElementById("readwritePermission").checked){
        permission="read-write";
    }
    if(document.getElementById("readPermission").checked){
        permission="read";
    }
    if (shareuser==="" || shareplaylist==="" || permission==="") {
        alert("Fill All Fields !");
    } else {
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
            } else {
            // code for IE6, IE5
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert("Playlist share invite sent correctly");
                document.getElementById("shareUser").value="";
                document.getElementById("sharePlaylist").value="";
                document.getElementById("readPermission").checked=false;
                document.getElementById("readwritePermission").checked=false;
                div_hide(item);
                
            }
            if (this.readyState == 4 && this.status == 500) {
                alert("Error occured: "+ this.responseText);
                document.getElementById("shareUser").value="";
                document.getElementById("sharePlaylist").value="";
                document.getElementById("readPermission").checked=false;
                document.getElementById("readwritePermission").checked=false;
            }
        };
        xhttp.open("GET","/profile/share/"+shareuser+"/"+shareplaylist+"?permission="+permission,true);
        xhttp.send();
    }
    return false;
}

function unshare_playlist(item){
    var unshareuser = document.getElementById("unshareUser").value;
    var unshareplaylist = document.getElementById("unsharePlaylist").value;
    if (unshareuser==="" || unshareplaylist==="") {
        alert("Fill All Fields !");
    } else {
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
            } else {
            // code for IE6, IE5
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert("Playlist unshared correctly");
                document.getElementById("unshareUser").value="";
                document.getElementById("unsharePlaylist").value="";
                div_hide(item);
                
            }
            if (this.readyState == 4 && this.status == 500) {
                alert("Error occured: "+ this.responseText);
                document.getElementById("unshareUser").value="";
                document.getElementById("unsharePlaylist").value="";
            }
        };
        xhttp.open("GET","/profile/unshare/"+unshareuser+"/"+unshareplaylist,true);
        xhttp.send();
    }
    return false;
}

function playlistsOption(){
    var aux = document.getElementById("page-content-wrapper");
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
        } else {
        // code for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            aux.innerHTML=this.responseText;
            
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Error occured: "+ this.responseText +";  Please try again or reload the page.");
        }
    };
    xhttp.open("GET","/profile?ajax=true",true);
    xhttp.send();
}

function invitesOption(){
    var aux = document.getElementById("page-content-wrapper");
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
        } else {
        // code for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            aux.innerHTML=this.responseText;
            
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Error occured: "+ this.responseText +";  Please try again or reload the page.");
        }
    };
    xhttp.open("GET","/profile/getInvites",true);
    xhttp.send();
}

function getSharedSongsDiv(item){
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
        } else {
        // code for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("songsList").innerHTML=this.responseText;
            
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Error occured: "+ this.responseText +";  Please try again or reload the page.");
        }
    };
    xhttp.open("GET","/profile/getsharedsong?share="+item.id,true);
    xhttp.send();
}

function deleteShareInvite(item){
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
        } else {
        // code for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var row = item.parentNode.parentNode;
            row.parentNode.removeChild(row);
            let aux = document.getElementById("invUpdate").innerHTML;
            document.getElementById("invUpdate").innerHTML=parseInt(aux)-1;
            
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Error occured: "+ this.responseText +";  Please try again or reload the page.");
        }
    };
    xhttp.open("GET","/profile/remove/invitation/"+item.id,true);
    xhttp.send();

}

function acceptShareInvite(item){
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
        } else {
        // code for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var row = item.parentNode.parentNode;
            row.parentNode.removeChild(row);
            let aux = document.getElementById("invUpdate").innerHTML;
            document.getElementById("invUpdate").innerHTML=parseInt(aux)-1;
            
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Error occured: "+ this.responseText +";  Please try again or reload the page.");
        }
    };
    xhttp.open("GET","/profile/accept/invitation/"+item.id,true);
    xhttp.send();

}
