const APIController = (function() {

    const clientId = '26fcecdecd8d402bae2f72bfdf3760ba';
    const clientSecret = '012eafa36c4d41928338bde4763ac981';

    // private methods
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getPlaylist = async (token, playlist_id) => {

        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getPlaylist(token, genreId) {
            return _getPlaylist(token, genreId);
        },
    }
})();


const APPController = (function (APICtrl) {
    // get genres on page load
    async function loadPlaylist (player) {
      let bangers = []
        //get the token
        const token = await APICtrl.getToken();
        //get the genres
        const playlist = await APICtrl.getPlaylist(token,'1nE8m2uEr3y4VKvx8tsII1');//Amy's Bday playlist
        //const playlist = await APICtrl.getPlaylist(token,'66uR2TmawyWuzUqHrTN1fO'); //Claire and Max Roadtrip
        console.log(playlist);
        //get tracks
        const tracks = playlist.tracks.items
        console.log(tracks);
        for (var i = 0; i < tracks.length-1; i++) {
          bangers.push(tracks[i].track.name+' - ' + tracks[i].track.artists[0].name);
          console.log(tracks[i].track.name +' - ' + tracks[i].track.artists[0].name);
        }
        shuffleArray(bangers);
        tableCreate(bangers,player);
      }

    return {
        init() {
            console.log('App is starting');
            //loadPlaylist();
        },
        table (player) {
          loadPlaylist(player);
        }
    }

})(APIController);

// will need to call a method to load the genres on page load
//APPController.init();

//shuffle the playlist
function shuffleArray(playlist) {
    for (var i = playlist.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = playlist[i];
        playlist[i] = playlist[j];
        playlist[j] = temp;
    }
}

//creating the bingo card
function tableCreate(array, player_name){
    var body = document.body;
    var name = document.createElement('p');
    var text = document.createTextNode(`${player_name}'s Card`);
    name.appendChild(text);
    var tbl  = document.createElement('table');
    var x = 0
    for(var i = 0; i < 4; i++){ //row
        var tr = tbl.insertRow();
        for(var j = 0; j < 4; j++){ //column
                x += 1
                var td = tr.insertCell();
                td.appendChild(document.createTextNode(array[x-1]));
        }
    }
    body.appendChild(name);
    body.appendChild(tbl);
}
//Attach a name to a card
const playername = document.querySelector('.player');
console.log(playername);
playername.addEventListener('keydown',setQuery);

function setQuery(evt) {
  if (evt.keyCode == 13) {
    if(playername.value == ''){
      console.log('noooooooo');
    } else {
      APPController.table(playername.value);
    }
  }
}
