function uploadAttachment(e) {
    var file = e.target.files[0];
    var fd = new FormData();


    new Compressor(file, {
        quality: 0.5,
        success(result) {

            fd.append('attachments',result);

            $.ajax({
                url:"https://api.classicapp.online/chat/uploadattachment",
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

                  sendMessage(response.path);
                },

            });

        },
        error(err) {
          console.log(err.message);
        },
      });


};
