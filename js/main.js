$(document).ready(function () {
    $('#playerContainer').hide();
    //HELPERS
    var playlistsRenderArr = []; 
    var resultContainer = $("#playlistsContainer");
    var numberOfRows = 1;

    var service = new playlistService;
    var modalCtrl = new ModalControl;
    var musicPlayer = new PlayerControl;
    var eventStorage = new eventManager;
    
    function eventManager() {
    //events
        //Add playlist event
        $(document).on('click', '#openAddPlaylist', function() {
            numberOfRows = 1;
            $('#playlistFormSaveBtn').show().attr('id', 'playlistFormSaveBtn');
            $('#playlistFormNextBtn').show().attr("disabled", true);
            $('#playlistModal').modal('show');
            $('#playlistFormEditSaveBtn, #playlistFormEditNextBtn').hide();
            $("#modalTitle").text('Add New Playlist');
            $("#formplaylist")['0'].reset();
            modalCtrl.appendSongRow(1, 1, 1);
        });
        //Modal multistep control
        $('#playlistFormNextBtn, #playlistFormBackBtn').click(modalCtrl.toggleMuletiStep);

        //Add rows to 'add songs' form
        $(document).on('click', '#addRowBtn', modalCtrl.addSongsRows);

        //remove rows from 'add songs' form
        $(document).on('click', '.removeRowBtn', modalCtrl.removeSongsRows);

        //validate values
        $(document).on('blur', "#PlaylistNameInput, #PlaylistURLInput", n => {
            let validation = new Validation;
            validation.validatValue(n.target.id);
        });

        $(document).on('click', '#playlistFormSaveBtn', service.addPlaylist);//save the playlist

        //save playlist details after edit
        $(document).on('click', '#playlistFormEditNextBtn', service.saveEditForm);

        //save playlist songs after edit
        $(document).on('click', '#playlistFormEditSaveBtn', service.saveEditForm);
        //Delete playlist
        $(document).on('click', '.delete', modalCtrl.confirmDeleteMsg);

        //Play music
        $(document).on('click', '.play', musicPlayer.startPlay);
        $(document).on('click', '.songInList', musicPlayer.initPlay);
        $(document).on('click', '#playerPlayButton', musicPlayer.playSong);
        $(document).on('click', '#playerPauseButton', musicPlayer.initPause);
        $(document).on('click', '#closePlayer',musicPlayer.closePlayer);
        //edit/Delete played Playlist
        //$(document).on('click', '.deletePlayer', musicPlayer.initPlay);
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

    //לסדר את עריכת הפלייליסט - אולי ליצור אובייקט עריכה ולמסור לקונסטרקוטר את  המזהה רק אחכ לערוך לפי המזהה
    //Edit playlist event
    $(document).on('click', '.edit', function() {
        $('#playlistFormSaveBtn, #playlistFormNextBtn').hide();
        $('#playlistFormEditNextBtn, #playlistFormEditSaveBtn').show();
        id = $(this).attr('data-id');
        serviceData.searchById(id, service.editPlaylist)
        //set unique id to form
        $('#formplaylist').attr('data-id', id);
        $('#playlistModal').modal('show');
    });

    function PlayerControl() {
        this.startPlay = function() {
            $('#playerContainer').show();
            id = $(this).attr('data-id');
            let playTitle = $(this).attr('data-title');
            document.title = playTitle;//change the page title
            let playImage = $(this).closest(".albumCover").css('background-image');
            $('#playerAlbumCover').css('background-image', playImage);//Set image
            $('#songListsTitle').html('<strong>Now playing: '+playTitle+'</strong>');
            serviceData.GetPlaylistSongs(id, musicPlayer.appendSongList);
            $('#sideButtonsContainer>.deletePlayer').attr('id', id);
            $('#sideButtonsContainer>.editPlayer').attr('id', id);
        }

        this.initPlay = function() {
            $('.songInList').removeClass('songInListPlayed');
            $(this).addClass('songInListPlayed');
            songUrl = $(this).attr('song-url');
            $('#audioTag').attr('src', songUrl);
            musicPlayer.playSong();
        }

        this.initPause = function() {
            $(this).removeClass('songInListPlayed');
            $('#playerPauseButton').attr('id', 'playerPlayButton');
            musicPlayer.pauseAudio();
        }

        this.buttonIcon = function() {
            if ($("#centerButton").hasClass("fa-pause")) {
                $("#centerButton").removeClass("fa-pause").addClass("fa-play");
            } else {
                $("#centerButton").removeClass("fa-play").addClass("fa-pause");
            }  
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
            if ($('#audioTag').attr('src') === '') {
                $('#centerButton').toggleClass("playButtonErr");
                console.log('empty src');
            } else {
                musicPlayer.buttonIcon();
                $('#playerPlayButton').attr('id', 'playerPauseButton');
                $("#playerAlbumCover").toggleClass("w3-spin");
                $('#audioTag').trigger('play');
            }
        }

        this.pauseAudio = function(){
            musicPlayer.buttonIcon();
            $("#playerAlbumCover").toggleClass("w3-spin");
            $('#audioTag').trigger('pause');
        }

        this.closePlayer = function() {
            document.title = 'Playlists And Music';//change the page title
            $('#playerContainer').hide();
        }
    }

    function ModalControl() {
        let max_fields = 12;
        let min_fields = 1;

        this.appendSongRow = function (id, valueUrl, valueName) {
            $('#formInputs').append(`
            <div class="form-row">
                <input type="text" name="url" data-id="${id}" class="songInput form-control col-7" placeholder="Song${valueUrl}.mp3" value="${valueUrl}">
                <input type="text" name="name" data-id="${id}" class="songInput form-control col" placeholder${valueName}="Name" value="${valueName}">
                <button type="button" class="btn btn-outline-primary removeRowBtn"><i class="fas fa-minus"></i></button>
            </div>`);
        }

        this.addSongsRows = function () {            
            if(numberOfRows < max_fields){
                numberOfRows++;
                modalCtrl.appendSongRow(numberOfRows, numberOfRows, numberOfRows);
                $('#addRowBtn, .removeRowBtn').attr('disabled', false);
            } else {
                $('#addRowBtn').attr('disabled', true);
            }
        }

        this.removeSongsRows = function (t) {
            if(numberOfRows > min_fields){
                $(t.currentTarget).parent('div.form-row').remove();
                numberOfRows--;
                $('#addRowBtn, .removeRowBtn').attr('disabled', false);
            } else {
                $('.removeRowBtn').attr('disabled', true);
            }
        }

        this.toggleMuletiStep = function() {
            $("#addPlaylistStepOne, #addPlaylistStepTwo").toggle();
        }

        this.confirmDeleteMsg = function() {
            let id = $(this).attr('data-id');           
            let delTitle = $(this).attr('data-title');
            $('#modalDelTitle').text('Delete '+ delTitle);
            $('#playlistModalRemove').modal('show');
            $('#playlistDeleteConfirm').attr('data-id', id).on('click', () => {
                service.removePlaylist(id);
                $('#playlistModalRemove').modal('hide');
            });
        }
    }

    function playlistService() {
        
        this.renderPlaylist = function(playlistArray) {
            resultContainer.html('');
            $.each(playlistArray, function (i, playlist) {
                let pID = playlist.id;
                let pTitle = playlist.name;
                let pImage = playlist.image;
                let playlistElement = `
                    <div class="albumCoverContainer" id="playlistNo${pID}">
                        <div class="albumCoverTitle">${pTitle}</div>
                        <div class="albumCover" data-id="${pID}" style="background-image: url(${pImage})">
                            <div class="buttonsContainer">
                                <span class="buttonTop delete" data-id="${pID}" data-title="${pTitle}" data-img="${pImage}"><i class="fas fa-trash"></i></span>
                                <span class="buttonTop edit" data-id="${pID}" data-title="${pTitle}" data-img="${pImage}"><i class="fas fa-pencil-alt"></i></span>
                                <div class="playButton play" data-id="${pID}" data-title="${pTitle}" data-img="${pImage}"><i class="fas fa-play-circle"></i></div>
                            </div>
                        </div>
                    </div>`;
                resultContainer.append(playlistElement);
                $(".albumCoverTitle").arctext({radius: 110});
            })
        }

        this.removePlaylist = function(id) {
            $('#playlistNo'+id).remove();
            serviceData.deleteData(id, serviceData.getData)
        }

        this.editPlaylist = function(playlist) {
            $("#formplaylist")['0'].reset();
            $("#modalTitle").text('Edit: '+playlist['0'].name)
            $("#PlaylistNameInput").val(playlist['0'].name)
            $("#PlaylistURLInput").val(playlist['0'].image)
            let songs = serviceData.GetPlaylistSongs(playlist['0'].id, service.editSongs);
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

        this.saveEditForm = function(btnId) {
            //get unique id
            let dataId = $(btnId.target).closest("#formplaylist").attr('data-id');
            //check which button is clicked
            if (btnId.target.id === "playlistFormEditNextBtn") {
                service.saveEditedPlaylistDetails(dataId);//save playlist data
            } else {
                service.saveEditedPlaylistSongs(dataId);//save songs data
            }
            modalCtrl.toggleMuletiStep();
        }

        this.saveEditedPlaylistDetails = function(id) {             
            let pe = {"name": $("#PlaylistNameInput").val(), "image": $("#PlaylistURLInput").val()};
            serviceData.updateData(id, pe);
        }

        this.saveEditedPlaylistSongs = function (id) {
            let editSongsNamesList = $('#formplaylist [name="name"]').serializeArray();
            let editURLsList = $('#formplaylist [name="url"]').serializeArray();
            let editSongsObjArray = [];
            $.each(editSongsNamesList, function(index, value) {
                var editSongsObj = {name : "", url: ""};
                editSongsObj.name = value['value'];
                editSongsObj.url = getValueByIndex(index);
                editSongsObjArray.push(editSongsObj);
            });
            let s = {"songs": editSongsObjArray};
            serviceData.UpdatePlaylistSongs(id, s);
            //helper to get equal id
            function getValueByIndex(index) {
                return editURLsList[index].value;
            }
        }
        
        this.addPlaylist = function() {
            let songsNamesList = $('#formplaylist [name="name"]').serializeArray();
            let songsURLsList = $('#formplaylist [name="url"]').serializeArray();
            let SongsObjArray = [];
            let urlInput = $("#PlaylistURLInput").val();
            $.each(songsNamesList, function(index, value) {
                var songsObj = {name : "", url: ""};
                songsObj.name = value['value'];
                songsObj.url = getValueByIndex(index);
                SongsObjArray.push(songsObj);
            });
            let validation = new Validation;
            if(validation.validateWithExp(1, urlInput)) {
                let p = new Playlist($("#PlaylistNameInput").val(), urlInput, SongsObjArray); 
                serviceData.postData(p, serviceData.getData)
                modalCtrl.toggleMuletiStep();
            } else {
                return false;
            }

            //helper to get equal id
            function getValueByIndex(index) {
                return songsURLsList[index].value;
            }
            $("#formplaylist")['0'].reset();
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
            //Delete existing playlist
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

    function Validation() {
        this.expBank = [
            /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,//url
            /^(?!\s*$).+/g,//empty string
            /^([a-zA-Z0-9-_ ]{2,30})\.(|mp3)+$/g//file.mp3
        ]

        this.validatValue = function(t) {
            let nameInput = $('#'+t);
            let nameVal = $(nameInput).val();
            let helperText = $('#PlaylistHelp');
            let i = this.generateIndex(t);//generate index to rexExp Array
            if (this.validateWithExp(i, nameVal)) {
                $(nameInput).removeClass('is-invalid').addClass('is-valid');
                helperText.text('');
                $("#playlistFormNextBtn, #playlistFormEditNextBtn").attr("disabled", false);
                if (i = 1) {
                    $('#PlaylistCoverPreview').attr('src', nameVal)
                }
            } else {
                $(nameInput).removeClass('is-valid').addClass('is-invalid');
                helperText.text('fields is empty or invalid!');
                $("#playlistFormNextBtn, #playlistFormEditNextBtn").attr("disabled", true);
                if (i = 1) {
                    $('#PlaylistCoverPreview').attr('src', '')
                }
            }
        }

        this.validateWithExp = function (i, input) {
            let expression = this.expBank[i];
            let regex = new RegExp(expression);
            if (input.match(regex)) {
                return true;
            } else {
                return false;
            }
        }

        this.generateIndex = function (gi) {
                switch (gi) {
                    case "PlaylistNameInput":
                        return +1;
                        break;
                    case "PlaylistURLInput":
                        return +0;
                        break;
                    default:
                        break;
                }
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

});