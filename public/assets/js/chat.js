

    const socket = io.connect('https://50.18.102.80/');
    
   
    socket.on('connect', connectUser);
   
    socket.on("disconnect", disconnectUser)
    console.log("got to the chat part")
   
   
   
    function generateChat(align,data){
      var datetime = new Date(data.time);
      var hrs = (datetime.getHours().toString().length>1)?datetime.getHours().toString():('0'+datetime.getHours().toString());
      var mins = (datetime.getMinutes().toString().length>1)?datetime.getMinutes().toString():('0'+datetime.getMinutes().toString());
      var time  = hrs+':'+mins;
        if(align == "left"){
           
              var item = `<div class="message d-flex sending-end">
            
              <div style="align-self: center">                    

                <figcaption class="message-chat">
                  <span> `+data.message+` </span>
                </figcaption>
                <p class="time-stamp">`+data.fromAlias+`|`+time+`</p>
              </div>
            </div><br>`;
               
        }else{
           
            var item = ` <div class="message d-flex receiving-end">
            <div style="align-self: center">

              <figcaption class="message-chat">
                <span> `+data.message+` </span>
              </figcaption>
              <p class="time-stamp">Me|`+time+`</p>
             
            </div>
          </div><br>`;
           
        }
        return item;
    }
   
    socket.on('message', function (data) {
      var interestStore = JSON.parse(localStorage.getItem('interestStore'));

        if(data.type == 'interest'){
          if(data.interestId == localStorage.getItem('activeInterest')){
            try{
              $('#messagebody').html( $('#messagebody').html() + generateChat("left",data));
            }catch(err){}
          }else{
            if(interestStore[data.interestId].unreadMessages == undefined){
              interestStore[data.interestId].unreadMessages = 1;
            }else{
              interestStore[data.interestId].unreadMessages+= 1;
            }
            $('.unread[data-interest='+data.interestId+']').html(interestStore[data.interestId].unreadMessages);
            $('.unreadCont[data-interest='+data.interestId+']').css('display','block');
          }
        }

        
        if(interestStore[data.interestId]['interestMessages']!=undefined){
          interestStore[data.interestId]['interestMessages'].push(data);
        }else{
          interestStore[data.interestId]['interestMessages'] = [];
          interestStore[data.interestId]['interestMessages'].push(data);
        }
        
        localStorage.setItem('interestStore',JSON.stringify(interestStore));
      
    });
   
    function sendMessage(){
        var msg = $('#chatinput').val(); 

        socket.emit("sendMessage",{message:msg,token:($('.utk').val()),interestId:localStorage.getItem('activeInterest'),type:"interest"},function(data){
          $('#messagebody').html( $('#messagebody').html() + generateChat("right",{message:msg,time:data.time_received}));
        });
       
       
        $('#chatinput').val('');
    }
   
    function connectUser () {  // Called whenever a user signs in
      socket.emit('userConnected', $('.utk').val());
    }
   
    function disconnectUser () {  // Called whenever a user signs out
      socket.emit('userDisconnected',$('.utk').val());
    }



    //----------------------------------------------------------------------------------------------------------------
    //----Chat Navigation Functions
    //----------------------------------------------------------------------------------------------------------------

    $('.open-chat').click(function(){
      var interest_id = $(this).attr('data-interest');
      localStorage.setItem('activeInterest',interest_id);
      if(window.location.toString().includes('chat-interest')){
        var interestStore = JSON.parse(localStorage.getItem('interestStore'));

        //Remove unread indicator
        interestStore[interest_id].unreadMessages = 0;
        $('.unread[data-interest='+interest_id+']').html('');
        $('.unreadCont[data-interest='+interest_id+']').css('display','none');


        var interestData = interestStore[interest_id];
        $('.chat-right-side').css('display','none');
        $('.message-view').css('display','block');
        $('.members-section').css('display','block');

        //Load Interest Messages

        function loadMessages(data){
          $('#messagebody').html('');
          for(var m in data){
            data[m].fromAlias = (data[m].fromAlias!=undefined)?data[m].fromAlias:data[m].alias;
            data[m].time = (data[m].time!=undefined)?eval(data[m].time):eval(data[m].datetime);  
            if(data[m].username == $('.un').val()){
              $('#messagebody').html( $('#messagebody').html() + generateChat('right',data[m]));
              
            }else{
              $('#messagebody').html( $('#messagebody').html() + generateChat('left',data[m]));
            }
          }
          var mb = document.getElementsByClassName('message-box')[0];
          mb.scrollTop = mb.scrollHeight;
        }


        if(interestData['interestMessages']==undefined){
          $.get('/getInterestMessages/'+interest_id,function(data,status){
            data.sort(function(a, b) {
              var keyA = eval(a.datetime);
               var  keyB = eval(b.datetime);
              // Compare the 2 dates
              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            });
            interestStore[interest_id]['interestMessages'] = data;
            localStorage.setItem('interestStore',JSON.stringify(interestStore));
            loadMessages(data);
          });
        }else{
          var data = JSON.parse(localStorage.getItem('interestStore'))[interest_id].interestMessages;
          loadMessages(data);
        }

        //Set Active Chat Block
        $('.chat-block.active').removeClass('active');
        $('.chat-block[data-interest='+interest_id+']').addClass('active');
        $('.interest-title').html(interestData.interestName);
        $('.member-count').html(interestData.interestMembers.length);
        $('.online-count').html(interestData.onlineMembers);

        //Load Interest Members List
        $('.member-list').html('');
        for(var i in interestData.interestMembers){
          $('.member-list').html( $('.member-list').html() + `                
          <div class="chat-block">
          <div class="chat-block_flex_between pl-3 pr-3">
            <div class="d-flex">
              <div class="chat-block_flex_img_container">
                <img
                  src="/assets/images/chat-img.png"
                  class="img-fluid member-img"
                  alt="chat-logo"
                />
              </div>
              <strong class="strong member-name pl-2"> `+interestData.interestMembers[i].alias+` </strong>
            </div>
            <div class="profile-more">
              <span
                class="iconify"
                data-icon="fe:arrow-right"
                data-inline="false"
              ></span>
            </div>
          </div>
        </div>`);
        }
      }else{
        window.location.replace('/chat-interest');
      }

    });