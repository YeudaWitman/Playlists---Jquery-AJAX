$(document).ready(function () {
    document.title = "This is the new page title.";
    var regExpURL = new RegExp("^[0-9]*$");
    var numberOfRows = 1;
    var max_fields = 12;






    $("#playerPlayButton").click(function () {
        $("#playerAlbumCover").toggleClass("w3-spin");
    });

    $("#playerPlayButton").click(initPlay);

    function initPlay() {
        if ($("#centerButton").hasClass("fa-pause")) {
            //console.log("stopped");
            $("#centerButton").removeClass("fa-pause");
            $("#centerButton").addClass("fa-play");
        } 
        else {
            //console.log("playing");
            $("#centerButton").removeClass("fa-play");
            $("#centerButton").addClass("fa-pause");
        }
        
    }

    $('#playlistFormNextBtn, #playlistFormBackBtn').click(function (e) {
        e.preventDefault();
        $("#addPlaylistStepOne, #addPlaylistStepTwo").toggle();
    });

    $("#addRowBtn").click(function(e){
        e.preventDefault();
        if(numberOfRows < max_fields){
            numberOfRows++;
            //console.log(numberOfRows);
            //$('#formInputs').append('<div class="form-row"><input type="text" name="url" class="songInput form-control col-8" placeholder="Song.mp3" value="url'+numberOfRows+'"><input type="text" name="name" class="songInput form-control col" placeholder="Name" value="name'+numberOfRows+'"></div>');
            $('#formInputs').append(`
            <div class="form-row">
                <input type="text" name="url" class="songInput form-control col-8" placeholder="Song.mp3" value="url${numberOfRows}">
                <input type="text" name="name" class="songInput form-control col" placeholder="Name" value="name${numberOfRows}">
            </div>`);
        }
    });

    $("#playlistFormSaveBtn").click(function() {
        let songsNamesList = $('#formplaylist [name="name"]').serializeArray();
        let songsURLsList = $('#formplaylist [name="url"]').serializeArray();
        let SongsObjArray = [];
        $.each(songsNamesList, function(index, value) {
            var songsObj = {name : "", url: ""};
            songsObj.name = value['value'];
            songsObj.url = getValueByIndex(index);
            SongsObjArray.push(songsObj);
        });
            //console.log(SongsObjArray);
          
        var p = new Playlist($("#PlaylistNameInput").val(), $("#PlaylistURLInput").val(), SongsObjArray); 
        manage.postPlaylist(p)

        function getValueByIndex(index) {
            return songsURLsList[index].value;
        }
    });

    function renderPlaylist(playlist) {
        let container = $("#playlistsContainer")
        let imageUrl = playlist.image;
        let playlistId = 'albumCover'+playlist.id;
        let deleteId = 'delete-'+playlist.id;
        let editId = 'edit'+playlist.id;
        let playId = 'play'+playlist.id;
        let playlistElement = `
        <div class="albumCoverContainer" id="playlistNo${playlist.id}">
            <div class="albumCoverTitle">${playlist.name}</div>
            <div class="albumCover" id="${playlistId}">
                <div class="buttonsContainer">
                    <span class="buttonTop delete" id="${deleteId}"><i class="fas fa-times-circle"></i></span>
                    <span class="buttonTop edit" id="${editId}"><i class="fas fa-pencil-alt"></i></span>
                    <div class="playButton play"><i class="fas fa-play-circle"></i></div>
                </div>
            </div>
        </div>`;
        container.append(playlistElement);
        $('#'+playlistId).css('background-image', 'url(' + imageUrl + ')');        
        
        $('.edit').click( () => console.log( this.id ));
        //remove playlist
        $('.delete').click(function() {
            idToRemove = this.id.slice(7);
            newid = 'playlistNo'+idToRemove;
            $('#'+newid).remove();
            manage.deletePlaylist(idToRemove);
        });

        $.each($(".albumCoverTitle"), function(i, title) {
            let curvedTitle = $(title)['0']
            $(curvedTitle).arctext({radius: 110})
        });
    }




    //function constructor
    function Playlist(name, image, songs) {
        this.name = name;
        this.image = image;
        this.songs = songs;
    }



    function managePlaylist() {

        this.getPlaylists = function() {
            //Get all playlists
            $.ajax({
                method: 'GET',
                url: 'api/playlist',
                dataType: 'json',
                success: function(data) {
                    $.each(data.data, (i, playlist) => renderPlaylist(playlist));
                }
            });
        }

        this.getPlaylistSongs = function(id) {
            //Get playlist songs
            $.ajax({
                method: 'GET',
                url: 'api/playlist/'+id+'/songs',
                dataType: 'json',
                success: function(data) {
                    renderPlaylist(data.data);
                }
            });
        }

        this.getPlaylistById = function(id) {
            //Get existing playlist
            $.ajax({
                method: 'GET',
                url: 'api/playlist/'+id,
                dataType: 'json',
                success: function(data) {
                    renderPlaylist(data.data);
                }
            });
        }

        this.postPlaylist = function(playlist){
            $.ajax({
                type: "POST",
                url: 'api/playlist',
                dataType: 'json',
                data: playlist,
                success: function(data) {
                    manage.getPlaylistById(data.data.id);
                }, 
                })
        }

        this.updatePlaylist = function(playlist){
            $.ajax({
                type: "POST",
                url: 'api/playlist',
                dataType: 'json',
                data: playlist,
                success: function(data) {
                    manage.getPlaylistById(data.data.id);
                }, 
                })
        }

        this.deletePlaylist = function(id) {
            $.ajax({
                method: 'DELETE',
                url: 'api/playlist/'+id,
                dataType: 'json',
                success: function(data) {
                }
            });
        }
    }


        //$('#playlistModal').modal('show');

var manage = new managePlaylist;
// manage.getPlaylistById(1);
manage.getPlaylists();
});