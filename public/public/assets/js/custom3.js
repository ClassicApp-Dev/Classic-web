

function updateprofile (){
    $("#profileform").submit();
};

function setCover(path){
    document.getElementsByClassName('cover-img')[0].style.backgroundImage = "url('http://50.18.102.80"+path.trim()+"')";
};

function handleFile(e) {
    var file = e.target.files[0];
    var fd = new FormData();
    

    new Compressor(file, {
        quality: 0.1,
        success(result) {
            
            fd.append('avatar',result);
            fd.append('type','upload');

            $.ajax({
                url:"http://50.18.102.80:3000/users/profile",
                data:fd,
                type:'POST',
                beforeSend: function(){
                  $('.lds-dual-ring overlay').css("visibility", "visible");
                },
                processData:false,
                contentType:false,
                headers:{
                    "Authorization": "Bearer "+$('.utk').val(),
                },
                
                success:function(response){
                    
                  window.location.href = "/refreshprofile"
                },

            });
        
        },
        error(err) {
          console.log(err.message);
        },
      });

 
};


function getfile(e) {
    var file = e.target.files[0];
    var newform = new FormData();
    

    new Compressor(file, {
        quality: 0.1,
        success(result) {
            
            newform.append('cover',result);
            newform.append('type','upload');

            $.ajax({
                url:"http://50.18.102.80:3000/users/profile",
                data:newform,
                type:'POST',
                processData:false,
                contentType:false,
                headers:{
                    "Authorization": "Bearer "+$('.utk').val(),
                },            

                success:function(response){
                    
                  window.location.href = "/refreshprofile"
                },
            });        
        },
        error(err) {
          console.log(err.message);
        },
      }); 
};
