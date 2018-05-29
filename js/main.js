$(document).ready(function () {
    $('#playerContainer').hide();
    //HELPERS
    //change the page title
    document.title = "This is the new page title.";
    var playlistsRenderArr = []; 
    var resultContainer = $("#playlistsContainer");
    var numberOfRows = 1;
    var max_fields = 12;
    var min_fields = 1;

    //events
    var service = new playlistService;
    var modalCtrl = new ModalControl;
    var musicPlayer = new PlayerControl;

    //Add playlist event
    $(document).on('click', '#openAddPlaylist', function() {
        $('#playlistModal').modal('show');
        $('#playlistFormSaveBtn').show();
        $('#playlistFormEditSaveBtn').hide();
        $('#formInputs').html('');
        $('#playlistFormSaveBtn').attr('id', 'playlistFormSaveBtn');
        modalCtrl.appendSongRow(1, 1, 1);
    });
    //Delete playlist confirm
    $(document).on('click', '.delete', function() {
        id = $(this).attr('data-id');
        let delTitle = $(this).attr('data-title');
        $('#modalDelTitle').text('Delete '+delTitle);
        $('#playlistModalRemove').modal('show');
        $('#playlistDeleteConfirm').attr('data-id', id);
    });
    //Delete playlist
    $(document).on('click', '#playlistDeleteConfirm', function() {
        id = $(this).attr('data-id');
        //service.removePlaylist(id);
        //$('#playlistModalRemove').modal('hide');
    });

    //Edit playlist event
    $(document).on('click', '.edit', function() {
        $('#playlistFormSaveBtn').hide();
        $('#playlistFormEditSaveBtn').show();
        id = $(this).attr('data-id');
        serviceData.searchById(id, service.editPlaylist)
        //set unique id to form
        $('#formplaylist').attr('data-id', id);
        $('#playlistModal').modal('show');
    });

    //add playlist
    $(document).on('click', '#playlistFormSaveBtn',service.addPlaylist);
    //save playlist after edit
    $(document).on('click', '#playlistFormEditSaveBtn', function() {
        //get unique id
        let dataId = $(this).closest("#formplaylist").attr('data-id');
        service.saveEditedPlaylist(dataId);
        $("#formplaylist")['0'].reset();
        modalCtrl.toggleMuletiStep();
    });

    //Modal multistep control
    $('#playlistFormNextBtn, #playlistFormBackBtn').click(modalCtrl.toggleMuletiStep);

    //Add rows to 'add songs' form
    $(document).on('click', '#addRowBtn', function() {
        if(numberOfRows < max_fields){
            numberOfRows++;
            modalCtrl.appendSongRow(numberOfRows, numberOfRows, numberOfRows)
        } else {
            console.log('full');
        }
    });

    //remove rows from 'add songs' form
    $(document).on('click', '.removeRowBtn', function() {
        if(numberOfRows > min_fields){
            $(this).parent().remove();
            numberOfRows--;
        } else {
            console.log('end');
        }
    });

    //Play music
    $(document).on('click', '.play', musicPlayer.startPlay);
    $(document).on('click', '.songInList', musicPlayer.initPlay);
    $(document).on('click', '#playerPlayButton', musicPlayer.playSong);
    $(document).on('click', '#playerPauseButton', musicPlayer.initPause);
    $(document).on('click', '#closePlayer',musicPlayer.closePlayer);

    function PlayerControl() {
        this.startPlay = function() {
            $('#playerContainer').show();
            id = $(this).attr('data-id');
            let playTitle = $(this).attr('data-title');
            $('#songListsTitle').html('<strong>Now playing: '+playTitle+'</strong>');
            serviceData.GetPlaylistSongs(id, musicPlayer.appendSongList);
            $('#sideButtonsContainer>.delete').attr('data-id', id);
            $('#sideButtonsContainer>.edit').attr('data-id', id);
        }
        this.initPlay = function() {
            songUrl = $(this).attr('song-url');
            console.log(songUrl)
            $('#audioTag').attr('src', songUrl);
            musicPlayer.playSong();
        }

        this.initPause = function() {
            $('#playerPauseButton').attr('id', 'playerPlayButton');
            musicPlayer.pauseAudio();
        }

        this.buttonIcon = function() {
            if ($("#centerButton").hasClass("fa-pause")) {
                $("#centerButton").removeClass("fa-pause");
                $("#centerButton").addClass("fa-play");
            } 
            else {
                $("#centerButton").removeClass("fa-play");
                $("#centerButton").addClass("fa-pause");
            }  
        }

        this.renderPlayer = function() {
            $("#musicPlayer").show;
        }

        this.appendSongList = function(songsList) {
            $('#playerSongList').html('');
            $.each(songsList['0'].songs, function(i, song) {
                $('#playerSongList').append(`
                    <li class="songInList" song-url="${song.url}">${song.name}</li>
                `)
            })
        }

        this.playSong = function() {
            musicPlayer.buttonIcon();
            $('#playerPlayButton').attr('id', 'playerPauseButton');
            $("#playerAlbumCover").toggleClass("w3-spin");
            $('#audioTag').trigger('play');
        }

        this.pauseAudio = function(){
            musicPlayer.buttonIcon();
            $("#playerAlbumCover").toggleClass("w3-spin");
            $('#audioTag').trigger('pause');
        }

        this.closePlayer = function() {
            $('#playerContainer').hide();
        }
    }

    function ModalControl() {
        this.appendSongRow = function (id, valueUrl, valueName) {
            $('#formInputs').append(`
            <div class="form-row">
                <input type="text" name="url" data-id="${id}" class="songInput form-control col-7" placeholder="Song.mp3" value="${valueUrl}">
                <input type="text" name="name" data-id="${id}" class="songInput form-control col" placeholder="Name" value="${valueName}">
                <button type="button" class="btn btn-outline-primary removeRowBtn"><i class="fas fa-minus"></i></button>
            </div>`);
        }

        this.toggleMuletiStep = function() {
            $("#addPlaylistStepOne, #addPlaylistStepTwo").toggle();
        }

    }

    //Search by name
    $('#searchByName').keyup(function () {
        if ($('#searchByName').val().length > 1) {
            resultContainer.html('');
            var searchField = $('#searchByName').val(); 
            var expression = new RegExp(searchField, "i"); 
            var resultArr = []; 
            $.each(playlistsRenderArr, function (i, value) {
                if (value.name.search(expression) != -1) {
                    resultArr.push(value); 
                }
            });
            service.renderPlaylist(resultArr);
        }
        if ($('#searchByName').val().length <= 1) {
            serviceData.getData();
        }
    }); 

    function playlistService() {
        this.renderPlaylist = function(playlistArray) {
            resultContainer.html('');
            $.each(playlistArray, function (i, playlist) {
                let pID = playlist.id;
                let pTitle = playlist.name;
                let playlistElement = `
                    <div class="albumCoverContainer" id="playlistNo${pID}">
                        <div class="albumCoverTitle">${pTitle}</div>
                        <div class="albumCover" data-id="${pID}">
                            <div class="buttonsContainer">
                                <span class="buttonTop delete" data-id="${pID}" data-title="${pTitle}"><i class="fas fa-trash"></i></span>
                                <span class="buttonTop edit" data-id="${pID}" data-title="${pTitle}"><i class="fas fa-pencil-alt"></i></span>
                                <div class="playButton play" data-id="${pID}" data-title="${pTitle}"><i class="fas fa-play-circle"></i></div>
                            </div>
                        </div>
                    </div>`;
                resultContainer.append(playlistElement);
                $(".albumCoverTitle").arctext({radius: 110})
            })
        }

        this.removePlaylist = function(id) {
            $('#playlistNo'+id).remove();
            serviceData.deleteData(id, serviceData.getData)
        }

        this.editPlaylist = function(playlist) {
            $("#modalTitle").text('Edit: '+playlist['0'].name)
            $("#PlaylistNameInput").val(playlist['0'].name)
            $("#PlaylistURLInput").val(playlist['0'].image)
            let songs = serviceData.GetPlaylistSongs(playlist['0'].id, service.editSongs);
            //TODO: add dataservice
        }
        this.editSongs = function(songs) {
            numberOfRows = 0;
            let songsArray = songs['0'].songs;
            numberOfRows = $(songsArray).length;
            $('#formInputs').html('');
            $.each(songsArray, function (i, song) {
                modalCtrl.appendSongRow(i, song.url, song.name);
            });
        }

        this.saveEditedPlaylist = function(id) {
            let editSongsNamesList = $('#formplaylist [name="name"]').serializeArray();
            let editURLsList = $('#formplaylist [name="url"]').serializeArray();
            let editSongsObjArray = [];
            $.each(editSongsNamesList, function(index, value) {
                var editSongsObj = {name : "", url: ""};
                editSongsObj.name = value['value'];
                editSongsObj.url = getValueByIndex(index);
                editSongsObjArray.push(editSongsObj);
            });
              
            let pe = {"name": $("#PlaylistNameInput").val(), "image": $("#PlaylistURLInput").val()}
            let s = {"songs": editSongsObjArray}
            serviceData.updateData(id, pe)
            serviceData.UpdatePlaylistSongs(id, s)
            //helper to get equal id
            function getValueByIndex(index) {
                return editURLsList[index].value;
            }
        }
        
        this.addPlaylist = function() {
            let songsNamesList = $('#formplaylist [name="name"]').serializeArray();
            let songsURLsList = $('#formplaylist [name="url"]').serializeArray();
            let SongsObjArray = [];
            $.each(songsNamesList, function(index, value) {
                var songsObj = {name : "", url: ""};
                songsObj.name = value['value'];
                songsObj.url = getValueByIndex(index);
                SongsObjArray.push(songsObj);
            });
            let p = new Playlist($("#PlaylistNameInput").val(), $("#PlaylistURLInput").val(), SongsObjArray); 
            serviceData.postData(p, serviceData.getData)
            //helper to get equal id
            function getValueByIndex(index) {
                return songsURLsList[index].value;
            }
            $("#formplaylist")['0'].reset();
            toggleMuletiStep();
        }
    }

    function dataService () {
        //var service = new playlistService;

        this.getData = function() {
            //Get all playlists
            $.ajax( {
                method:'GET', 
                url:'api/playlist', 
                dataType:'json', 
                success:function (data) {
                    service.renderPlaylist(data.data);
                    playlistsRenderArr = data.data;
                }
            });
        }
    
        this.searchById = function (id, callBack) {
            //Get existing playlist
            $.ajax( {
                method:'GET', 
                url:'api/playlist/' + id, 
                dataType:'json', 
                success:function (data) {
                    var resultArray = []
                    resultArray.push(data.data);
                    callBack(resultArray);
                    //service.renderPlaylist(resultArray);
                }
            }); 
        }

        this.GetPlaylistSongs = function (id, callBack) {
            //Get playlist songs
            $.ajax( {
                method:'GET', 
                url:'api/playlist/' + id +'/songs', 
                dataType:'json', 
                success:function (data) {
                    var resultArray = []
                    resultArray.push(data.data);
                    callBack(resultArray);;
                }
            }); 
        }

        this.postData = function(dataObj, callBack){
            //Create new playlists
            $.ajax({
                type: "POST",
                url: 'api/playlist',
                dataType: 'json',
                data: dataObj,
                success: function() {
                    callBack();
                }, 
            })
        }

        this.updateData = function(id, dataObj){
            //Update existing playlist info
            $.ajax({
                type: "POST",
                url: 'api/playlist/'+id,
                dataType: 'json',
                data: dataObj,
                success: function(data) {
                    console.log(data)
                    serviceData.getData();
                }, 
            })
        }

        this.UpdatePlaylistSongs = function(id, dataObj){
            //Update playlist songs
            $.ajax({
                type: "POST",
                url: 'api/playlist/'+id+'/songs',
                dataType: 'json',
                data: dataObj,
                success: function() {
                    serviceData.getData();
                }, 
            })
        }

        this.deleteData = function(id, callBack){
            //Update playlist songs
            $.ajax({
                type: "DELETE",
                url: 'api/playlist/'+id,
                dataType: 'json',
                success: function() {
                    callBack();
                }, 
            })
        }
    }

    var serviceData = new dataService;
    serviceData.getData();

    //function constructor
    function Playlist(name, image, songs) {
        this.name = name;
        this.image = image;
        this.songs = songs;
    }
    function emptyCallback(data) {
        console.log(data['0']);
        return data['0'];
    }
});