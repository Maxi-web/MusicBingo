const APIController = (function() {

    const clientId = '26fcecdecd8d402bae2f72bfdf3760ba';
    const clientSecret = CLIENT_SECRET; //see secrets in repo.

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

    const _search = async (token, searchValue) => {

      const result = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=playlist&limit=5`, {
          method: 'GET',
          headers: { 'Authorization' : 'Bearer ' + token}
      });

      const data = await result.json();
      return data.playlists.items;
  }

    return {
        getToken() {
            return _getToken();
        },
        getPlaylist(token, playlist_id) {
            return _getPlaylist(token, playlist_id);
        },
        search(token, searchValue) {
          return _search(token, searchValue);
        }
    }
})();

const GUIController = (function() {

    return {
      displaySearch(text, value) {
        const list = document.querySelector(".results-list")
        console.log(list);
    },
    }
})();

const APPController = (function (APICtrl) {
    //Populate the searched playlists
    const _findPlaylist = async (searchValue) => {
      //get the token 
      const token = await APICtrl.getToken();
      // get results 
      let results = await APICtrl.search(token, searchValue)
      const list = document.querySelector(".resultsList")
      //display results as a list on the page
      results.forEach( element => {
          const list = document.querySelector(".resultsList")
          div = document.createElement('div');
          div.classList.add('album')
          img = document.createElement('img');
          img.setAttribute('src', element.images[0].url);
          console.log(img);
          item = document.createElement('p')
          item.onclick = function(evt){
            console.log(evt.target);
          } 
          item.classList.add('playlistName')
          item.appendChild(document.createTextNode(`${element.name}:${element.id}`));
          div.appendChild(img)
          div.appendChild(item)
          list.appendChild(div);
          console.log(element);
        })
    }
    // Remove the old Playlist search data
    const _removePlaylist = () => {
      const list = document.querySelector(".resultsList")
      while (list.firstChild) {
        list.removeChild(list.lastChild);
      }
    }
    // get genres on page load
    async function loadPlaylist (player) {
      let bangers = []
        //get the token
        const token = await APICtrl.getToken();
        //get the playlist
       const playlist = await APICtrl.getPlaylist(token,'1nE8m2uEr3y4VKvx8tsII1');//Amy's Bday playlist
        //const playlist = await APICtrl.getPlaylist(token,'66uR2TmawyWuzUqHrTN1fO'); //Claire and Max Roadtrip
        console.log('BELOW')
        console.log(playlist.name)
        console.log('ABOVE')
        //get tracks
        const tracks = playlist.tracks.items
        for (var i = 0; i < tracks.length-1; i++) {
          bangers.push(tracks[i].track.name+' - ' + tracks[i].track.artists[0].name);
        }
        shuffleArray(bangers);
        tableCreate(bangers,player);
      }

    return {
        init() {
            console.log('App is starting');
        },
        table (player) {
          if (player == '') {
            alert('YOP');
          }
          else{
          loadPlaylist(player);
        }
        },
        findPlaylist(searchValue) {
          _findPlaylist(searchValue);
        },
        removePlaylist(){
          _removePlaylist();
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
    //grab body
    var body = document.body;
    //Create a div for player info and card to sit in
    var playerGrid = document.createElement('div');
    playerGrid.classList.add('playerGrid');
    // create new div with class playerBar
    var playerBar = document.createElement('div');
    playerBar.classList.add("playerBar");
    //create a p tag with class playerName
    var name = document.createElement('p');
    name.classList.add("playerName");
    //create a text node with the players name
    var text = document.createTextNode(`${player_name}'s Card`);
    //create two buttons, one with class showbtn, and one with class trashBtn
    var btn1 = document.createElement('button');
    btn1.classList.add('showBtn')
    btn1.textContent = 'Show Card'
    btn1.onclick = function(evt){
      evt.target.parentNode.nextSibling.classList.toggle('Hide');
    } 
    var btn2 = document.createElement('button');
    btn2.classList.add('trashBtn')
    btn2.textContent = 'Delete Card'
    btn2.onclick = function(evt){
      evt.target.parentNode.parentNode.remove()
    }
    //append text to p tag and then p tag and the two buttons to div
    name.appendChild(text);
    playerBar.appendChild(name);
    playerBar.appendChild(btn1);
    playerBar.appendChild(btn2);

    var tbl  = document.createElement('table');
    tbl.classList.add('Hide')
    var x = 0
    for(var i = 0; i < 4; i++){ //row
        var tr = tbl.insertRow();
        for(var j = 0; j < 4; j++){ //column
                x += 1
                var td = tr.insertCell();
                td.appendChild(document.createTextNode(array[x-1]));
        }
    }
    playerGrid.appendChild(playerBar);
    playerGrid.appendChild(tbl);
    body.appendChild(playerGrid);
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
      playername.value = ''
    };
  }
}

//Search results 
const searchResults = document.querySelector('.search');
searchResults.addEventListener('keydown',setSearch);
function setSearch(evt) {
  if (evt.keyCode == 13) {
    if(searchResults.value == ''){
      console.log('noooooooo');
    } else {
      APPController.removePlaylist();
      APPController.findPlaylist(searchResults.value);
      // console.log(searchResults.value);
      // console.log(searchResults.value.replace(/\s/g, '%20'));
      searchResults.value = ''
  }
  };
  }
