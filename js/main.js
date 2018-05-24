$(document).ready(function () {

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

    //Add playlist event
    $(document).on('click', '#openAddPlaylist', function() {
        $('#playlistModal').modal('show');
        $('#formInputs').html('');
        $('#playlistFormSaveBtn').attr('id', 'playlistFormSaveBtn');
        appendSongRow(1, 1, 1);
    });
    //Delete playlist confirm
    $(document).on('click', '.delete', function() {
        id = $(this).attr('data-id');
        $('#playlistModalRemove').modal('show');
        $('#playlistDeleteConfirm').attr('data-id', id);
    });
    //Delete playlist
    $(document).on('click', '#playlistDeleteConfirm', function() {
        id = $(this).attr('data-id');
        console.log(id);
        service.removePlaylist(id);
        //$('#playlistModalRemove').modal('hide');
    });

    //Edit playlist event
    $(document).on('click', '.edit', function() {
        id = $(this).attr('data-id');
        serviceData.searchById(id, service.editPlaylist)
        //set unique id to form
        $('#formplaylist').attr('data-id', id);
        $('#playlistModal').modal('show');
        $('#playlistFormSaveBtn').attr('id', 'playlistFormEditSaveBtn');
    });

    //add/save playlist
    $("#playlistFormSaveBtn").click(service.addPlaylist);
    //save playlist after edit
    $(document).on('click', '#playlistFormEditSaveBtn', function() {
        //get unique id
        let dataId = $(this).closest("#formplaylist").attr('data-id');
        service.saveEditedPlaylist(dataId);
    });

    //Modal multistep control
    $('#playlistFormNextBtn, #playlistFormBackBtn').click(function() {
        $("#addPlaylistStepOne, #addPlaylistStepTwo").toggle();
    });

    //Add rows to 'add songs' form
    $(document).on('click', '#addRowBtn', function() {
        if(numberOfRows < max_fields){
            numberOfRows++;
            appendSongRow(numberOfRows, numberOfRows, numberOfRows)
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

    function appendSongRow(id, valueUrl, valueName) {
        $('#formInputs').append(`
        <div class="form-row">
            <input type="text" name="url" data-id="${id}" class="songInput form-control col-7" placeholder="Song.mp3" value="${valueUrl}">
            <input type="text" name="name" data-id="${id}" class="songInput form-control col" placeholder="Name" value="${valueName}">
            <button type="button" class="btn btn-outline-primary removeRowBtn"><i class="fas fa-minus"></i></button>
        </div>`);
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
                let playlistElement = `
                    <div class="albumCoverContainer" id="playlistNo${pID}">
                        <div class="albumCoverTitle">${playlist.name}</div>
                        <div class="albumCover" data-id="${pID}">
                            <div class="buttonsContainer">
                                <span class="buttonTop delete" data-id="${pID}"><i class="fas fa-times-circle"></i></span>
                                <span class="buttonTop edit" data-id="${pID}"><i class="fas fa-pencil-alt"></i></span>
                                <div class="playButton play" data-id="${pID}"><i class="fas fa-play-circle"></i></div>
                            </div>
                        </div>
                    </div>`;
                resultContainer.append(playlistElement);
                $(".albumCoverTitle").arctext({radius: 110})
            })
        }

        this.removePlaylist = function(id) {
            $('#playlistNo'+id).remove();
            //TODO: add dataservice
        }

        this.editPlaylist = function(playlist) {
            console.log('edit');
            console.log(playlist['0']);
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
                appendSongRow(i, song.url, song.name);
            });
        }

        this.saveEditedPlaylist = function(id) {
            let songsNamesList = $('#formplaylist [name="name"]').serializeArray();
            let songsURLsList = $('#formplaylist [name="url"]').serializeArray();
            let SongsObjArray = [];
            $.each(songsNamesList, function(index, value) {
                var songsObj = {name : "", url: ""};
                songsObj.name = value['value'];
                songsObj.url = getValueByIndex(index);
                SongsObjArray.push(songsObj);
            });
              
            let p = {"name": $("#PlaylistNameInput").val(), "image": $("#PlaylistURLInput").val()}
            let s = {"songs": SongsObjArray}
            console.log(p);
            console.log(id);
            serviceData.updateData(id, p)
            serviceData.UpdatePlaylistSongs(id, s)
            //helper to get equal id
            function getValueByIndex(index) {
                return songsURLsList[index].value;
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
              
            var p = new Playlist($("#PlaylistNameInput").val(), $("#PlaylistURLInput").val(), SongsObjArray); 
            //serviceData.postData(p)
            //helper to get equal id
            function getValueByIndex(index) {
                return songsURLsList[index].value;
            }
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

        this.postData = function(dataObj){
            //Create new playlists
            $.ajax({
                type: "POST",
                url: 'api/playlist',
                dataType: 'json',
                data: dataObj,
                success: function() {
                    serviceData.getData();
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
    }

    var serviceData = new dataService;
    serviceData.getData();

    //function constructor
    function Playlist(name, image, songs) {
        this.name = name;
        this.image = image;
        this.songs = songs;
    }

    function PlaylistEdit(name, image) {
        this.name = name;
        this.image = image;
    }
});