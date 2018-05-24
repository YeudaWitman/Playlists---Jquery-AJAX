$(document).ready(function () {

    //HELPERS
    //change the page title
    document.title = "This is the new page title.";
    var playlistsRenderArr = []; 
    var resultContainer = $("#playlistsContainer");
    var numberOfRows = 1;
    var max_fields = 12;

    //events
    var service = new playlistService;
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
        service.editPlaylist(id);
    });
    //Modal multistep control
    $('#playlistFormNextBtn, #playlistFormBackBtn').click(function() {
        $("#addPlaylistStepOne, #addPlaylistStepTwo").toggle();
    });
    //Add rows to 'add songs' form
    $(document).on('click', '#addRowBtn', function(){
        if(numberOfRows < 2){
            numberOfRows++;
            $('#formInputs').append(`
            <div class="form-row">
                <input type="text" name="url" class="songInput form-control col-7" placeholder="Song.mp3" value="url${numberOfRows}">
                <input type="text" name="name" class="songInput form-control col" placeholder="Name" value="name${numberOfRows}">
                <button type="button" class="btn btn-outline-primary removeRowBtn"><i class="fas fa-minus"></i></button>
            </div>`);
        } else {
            console.log('full');
        }
    });
    //remove rows from 'add songs' form
    $(document).on('click', '.removeRowBtn', function() {
        $(this).parent().remove();
        numberOfRows--;
    });

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
                    service.renderPlaylist(resultArr);
                }
            }); 
        }

        //on blur if the input empty. reset the view
    }); 
    //save plst
    //function constructor
    function Playlist(name, image, songs) {
        this.name = name;
        this.image = image;
        this.songs = songs;
    }

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
          
        var p = new Playlist($("#PlaylistNameInput").val(), $("#PlaylistURLInput").val(), SongsObjArray); 
        serviceData.postData(p)

        function getValueByIndex(index) {
            return songsURLsList[index].value;
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

        this.editPlaylist = function(id) {
            console.log($('#playlistNo'+id));
            //TODO: add dataservice
        }
        
        this.addPlaylist = function() {
            console.log('add');
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
    
        this.searchById = function (id) {
            //Get existing playlist
            $.ajax( {
                method:'GET', 
                url:'api/playlist/' + id, 
                dataType:'json', 
                success:function (data) {
                    var resultArray = []
                    resultArray.push(data.data);
                    service.renderPlaylist(resultArray);
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
    }

    var serviceData = new dataService;
    serviceData.getData();
});