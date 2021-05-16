

    const socket = io.connect('https://50.18.102.80/');


    socket.on('connect', connectUser);

    socket.on("disconnect", disconnectUser)

    var loadMembers;

    function generateChat(align,data){
      var datetime = new Date(data.time);
      var hrs = (datetime.getHours().toString().length>1)?datetime.getHours().toString():('0'+datetime.getHours().toString());
      var mins = (datetime.getMinutes().toString().length>1)?datetime.getMinutes().toString():('0'+datetime.getMinutes().toString());
      var time  = hrs+':'+mins;

      var attach = ((data.attachment!=undefined)&&(data.attachment!='null')&&(data.attachment!=null))?('<img src="https://50.18.102.80'+data.attachment+'"/>'):'';


      // Create image and message boxes
      var messageFig = (data.message!='')?(`<figcaption class="message-chat">
                        <span> `+data.message+` </span>
                      </figcaption>`):``;


      var imageFig = (attach!='')?(`<figcaption class="image-chat">
                    `+ attach +`
                    </figcaption>`):``;


        if(align == "left"){

              var item = `<div class="message d-flex sending-end">

              <div style="align-self: center">
              `+ imageFig +`
              `+ messageFig +`
                <p class="time-stamp">`+data.fromAlias+`|`+formatAMPM(datetime)+`</p>
              </div>
            </div><br>`;

        }else{

            var item = ` <div class="message d-flex receiving-end">
            <div style="align-self: center">
            `+ imageFig +`
            `+ messageFig +`
              <p class="time-stamp">Me|`+formatAMPM(datetime)+`</p>

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
          if(interestStore[data.interestId]['interestMessages']!=undefined){
            interestStore[data.interestId]['interestMessages'].push(data);
          }else{
            interestStore[data.interestId]['interestMessages'] = [];
            interestStore[data.interestId]['interestMessages'].push(data);
          }

          localStorage.setItem('interestStore',JSON.stringify(interestStore));
        }else{

          var activeUserAlias = localStorage.getItem('activeUserChatAlias');
          if((activeUserAlias!=null)&&(activeUserAlias!='null')){
            try{
              $('#messagebody').html( $('#messagebody').html() + generateChat("left",data));
            }catch(err){}
          }

          var userMessages = JSON.parse(localStorage.getItem('userMessages'));

          userMessages[data.fromAlias].push(data);

          localStorage.setItem('userMessages',JSON.stringify(userMessages));
        }



    });

    socket.on('interestJoin',function(data){
      var interestStore = JSON.parse(localStorage.getItem('interestStore'));
      var currentCount = $('.total-members[data-interest='+data.interestId+']').html();
      $('.total-members[data-interest='+data.interestId+']').html((eval(currentCount)+1));

      if(localStorage.getItem('activeInterest')==data.interestId){
        $('.member-count').html( eval($('.member-count').html()) + 1);
      }
      interestStore[data.interestId].interestMembers.push({username:data.username,alias:data.alias});
      loadMembers(interestStore[data.interestId].interestMembers);
      localStorage.setItem('interestStore',JSON.stringify(interestStore));
    });

    socket.on('interestLeave',function(data){
      var currentCount = $('.total-members[data-interest='+data.interestId+']').html();
      $('.total-members[data-interest='+data.interestId+']').html((eval(currentCount)-1));

      if(localStorage.getItem('activeInterest')==data.interestId){
        $('.member-count').html( eval($('.member-count').html()) - 1);
        $('.online-count').html( eval($('.online-count').html()) - 1);
      }

      interestStore[data.interestId].onlineMembers-= 1;
      localStorage.setItem('interestStore',JSON.stringify(interestStore));
    });

    socket.on('isOnline',function(data){

      if(localStorage.getItem('activeInterest')==data.interestId){
        $('.online-count').html( eval($('.online-count').html()) + 1);
      }

      interestStore[data.interestId].onlineMembers += 1;
      localStorage.setItem('interestStore',JSON.stringify(interestStore));

      var activeUserAlias = localStorage.getItem('activeUserChatAlias');
      if((activeUserAlias!=null)&&(activeUserAlias!='null')){
        if(activeUserAlias==data.alias){
          $('.online-stat').html('Online');
        }
      }
    });

    socket.on('isOffline',function(data){

      if(localStorage.getItem('activeInterest')==data.interestId){
        $('.online-count').html( eval($('.online-count').html()) - 1);
      }

      interestStore[data.interestId].onlineMembers -= 1;
      localStorage.setItem('interestStore',JSON.stringify(interestStore));

      var activeUserAlias = localStorage.getItem('activeUserChatAlias');
      if((activeUserAlias!=null)&&(activeUserAlias!='null')){
        if(activeUserAlias==data.alias){
          var lastSeen = (new Date()).getTime();
          setLastSeenTime({lastSeen:lastSeen});
        }
      }
    });

    function sendMessage(attachment){
        var msg = $('#chatinput').val();

        var activeInterest = localStorage.getItem('activeInterest');
        if((activeInterest!='null')&&(activeInterest!=null)){


          socket.emit("sendMessage",{message:msg,token:($('.utk').val()),interestId:localStorage.getItem('activeInterest'),type:"interest",attachment:((attachment!=undefined)?attachment:null)},function(data){
            var messageData = {message:msg,time:data.time_received};
            if(attachment!=undefined){
              messageData['attachment'] = attachment;
            }
            $('#messagebody').html( $('#messagebody').html() + generateChat("right",messageData));
          });
        }else{
          socket.emit('getUserStat',{alias:$('.user-alias').html()},function(data){
            socket.emit("sendMessage",{message:msg,token:($('.utk').val()),to:data.username,type:"direct",attachment:((attachment!=undefined)?attachment:null)},function(data){
              var messageData = {message:msg,time:data.time_received};
              if(attachment!=undefined){
                messageData['attachment'] = attachment;
              }
              $('#messagebody').html( $('#messagebody').html() + generateChat("right",messageData));


              var userMessages = JSON.parse(localStorage.getItem('userMessages'));

              userMessages[data.fromAlias].push(data);

              localStorage.setItem('userMessages',JSON.stringify(userMessages));

            });
          });

        }




        $('#chatinput').val('');
    }

    function connectUser () {  // Called whenever a user signs in
      socket.emit('userConnected', $('.utk').val());
    }

    function disconnectUser () {  // Called whenever a user signs out
      socket.emit('userDisconnected',$('.utk').val());
    }



    //----------------------------------------------------------------------------------------------------------------
    //----Chat Functions
    //----------------------------------------------------------------------------------------------------------------


    //Function to format time
    function formatAMPM(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }

    function loadMessages(data,offset){
      var count = 0;
      data.reverse();
      var start = eval($('#m-cnt').html());
      if(offset){
        data = data.slice((start-1));
      }else{
        $('#messagebody').html('');
      }
      for(var m in data){

        //Set alias, username and time depending on interest or direct messages
        data[m].fromAlias = (data[m].fromAlias!=undefined)?data[m].fromAlias:data[m].alias;
        data[m].time = (data[m].time!=undefined)?eval(data[m].time):eval(data[m].datetime);

        var sessionUser = (data[m].username!=undefined)?data[m].username:data[m].fromUsername;

        if(sessionUser == $('.un').val()){
          $('#messagebody').html( generateChat('right',data[m]) + $('#messagebody').html() );

        }else{
          $('#messagebody').html(generateChat('left',data[m]) + $('#messagebody').html() );
        }
        count++;
        if(count>24){ break; }
      }
      $('#m-cnt').html( eval($('#m-cnt').html()) + count );
      var mb = document.getElementsByClassName('message-box')[0];
      if(offset==undefined){
        mb.scrollTop = mb.scrollHeight;
      }
    }



    //Function to set last seen of user
    function setLastSeenTime(data){
      var lastDateObj = new Date(eval(data.lastSeen));
            var year = lastDateObj.getFullYear();
            var month = lastDateObj.getMonth();
            var date = lastDateObj.getDate();
            var lastSeenTime = '';
            var today = new Date();

            // Create time and add leading zeros if needed
            var hours = (lastDateObj.getHours().toString().length==2)?lastDateObj.getHours():('0'+lastDateObj.getHours());
            var minutes = (lastDateObj.getMinutes().toString().length==2)?lastDateObj.getMinutes():('0'+lastDateObj.getMinutes());

            if((today.getDate()==date)&&(today.getMonth()==month)&&(today.getFullYear()==year)){

              lastSeenTime ='today at '+ hours +':'+minutes;

            }else{
              if(today.getDate()!=date){
                var day = lastDateObj.toString().split(' ')[0];
                var dateNo = (lastDateObj.getDate().toString().length==2)?lastDateObj.getDate():('0'+lastDateObj.getDate());
                lastSeenTime += (day + ' '+dateNo);
              }
              if(today.getMonth()!=month){
                var monthString = lastDateObj.toString().split(' ')[1];
                lastSeenTime+= (' '+monthString);
              }
              if(today.getFullYear()!=year){
                lastSeenTime += (' '+ year);
              }

              lastSeenTime += (', '+ hours +':'+ minutes);
            }

            if(data.lastSeen == undefined){
              $('.online-stat').html('');
            }else{
              $('.online-stat').html('Last seen '+lastSeenTime);
            }
    }


    //Listener to open interest chat interface

    $('.open-interest-chat').click(function(){
      var interest_id = $(this).attr('data-interest');
      localStorage.setItem('activeInterest',interest_id);
      localStorage.setItem('activeUserChatAlias',null);

      $('.chat-intro.interest-chat').show();
      $('.chat-intro.one-chat').hide();
      
      $('.the-flex').addClass('chat-flex');
      $('.the-flex').removeClass('the-flex');

      //Prevent double listeners by killing any existing ones
      $('.open-direct-chat').off('click');

      var interestStore = JSON.parse(localStorage.getItem('interestStore'));

      var interestData = interestStore[interest_id];

      if(window.location.href.toString().includes('chat-interest')){
        $('#m-cnt').html('0');
        //Remove unread indicator
        interestStore[interest_id].unreadMessages = 0;
        $('.unread[data-interest='+interest_id+']').html('');
        $('.unreadCont[data-interest='+interest_id+']').css('display','none');


        //Load Interest Messages


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
        $('.online-count').html(interestData.onlineMembers-1);

        //Load Interest Members List

        loadMembers = function(data){
          $('.member-list').html('');
          for(var i in data){
            var addMember = ``;
            var username = $('.un').val();
            if(username!=data[i].username){
              addMember += `<a href="#" class="open-direct-chat" data-alias="`+data[i].alias+`">`;
            }
            addMember += `
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
                <strong class="strong member-name pl-2"> `+data[i].alias + ((username==data[i].username)?'(You)':'') +` </strong>
              </div>
              <div class="profile-more">
                <span
                  class="iconify"
                  data-icon="fe:arrow-right"
                  data-inline="false"
                ></span>
              </div>
            </div>
          </div>`;
            if(username!=data[i].username){
              addMember += `</a>`;
            }
            $('.member-list').html( $('.member-list').html() + addMember);
          }
        }
        loadMembers(interestData.interestMembers);

        //Load direct messages
        var userMessages = {};
        if(localStorage.getItem('userMessages')!=undefined){
          userMessages = JSON.parse(localStorage.getItem('userMessages'));
        }
        function loadDirectMessages(index,store){
          if(store[index]!=undefined){
            $.get('/getDirectMessages/'+store[index].alias,function(data,status){
              data.sort(function(a, b) {
                var keyA = eval(a.time);
                 var  keyB = eval(b.time);
                // Compare the 2 dates
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
              });

              userMessages[store[index].alias] = data;
              localStorage.setItem('userMessages',JSON.stringify(userMessages));
            });
            loadDirectMessages((index+1),store);
          }
        }
        loadDirectMessages(0,interestData.interestMembers);

      }else{
        window.location.replace('/chat-interest');
      }



      // Listener for opening direct chat

      $('.open-direct-chat').click(function(){

        $('.chat-intro.interest-chat').hide();

        $('.chat-intro.one-chat').show();

        var alias = $(this).attr('data-alias');

        //Set active opened chat alias
        localStorage.setItem('activeUserChatAlias',alias);
        localStorage.setItem('activeInterest',null);

        var userMessages = JSON.parse(localStorage.getItem('userMessages'));

        $('.user-alias').html(alias);

        $('.online-stat').html('');

        socket.emit('getUserStat',{alias:alias},function(data){
          if(data.isOnline){
            $('.online-stat').html("Online");
          }else{
            setLastSeenTime(data);
          }
        });

        if(userMessages[alias]==undefined){
          $.get('/getDirectMessages/'+alias,function(data,status){
            data.sort(function(a, b) {
              var keyA = eval(a.time);
               var  keyB = eval(b.time);
              // Compare the 2 dates
              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            });
            userMessages[alias] = data;
            localStorage.setItem('userMessages',JSON.stringify(userMessages));
            loadMessages(data);
          });
        }else{
          loadMessages(userMessages[alias]);
        }

      });

    });


    //Fetch initial interest messages
    var interestStore = JSON.parse(localStorage.getItem('interestStore'));
    function loadInterestMessages(index,store){
      if(store[index]!=undefined){
        $.get('/getInterestMessages/'+store[index],function(data,status){
          if(data.length>0){
            try{
              data.sort(function(a, b) {
                var keyA = eval(a.datetime);
                var  keyB = eval(b.datetime);
                // Compare the 2 dates
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
              });
              interestStore[store[index]]['interestMessages'] = data;
              localStorage.setItem('interestStore',JSON.stringify(interestStore));

              var lastMessage = data[data.length-1];

              /*if((lastMessage.attachment!=null)&&(lastMessage.attachment!='null')){
                var lastMessageText = '<i class="fas fa-image"></i> Image';
              }else{*/
                var lastMessageText = lastMessage.message.substr(0,45)+ ((lastMessage.message.length>45)?'...':'');
                //}
                $('.chat-intro.last-message[data-interest='+store[index]+']').html( lastMessageText  );

                var msgTime = (data[(data.length-1)].time!=undefined)?(data[(data.length-1)].time):data[(data.length-1)].datetime;
                var lastTimeObj = new Date(eval(msgTime));

                var lastMessageTime = formatAMPM(lastTimeObj);
                var today = new Date();
                if((lastTimeObj.getDate()!=today.getDate())||(lastTimeObj.getMonth()!=today.getMonth())||(lastTimeObj.getFullYear()!=today.getFullYear())){
                  lastMessageTime = lastTimeObj.getDate()+'/'+(lastTimeObj.getMonth()+1)+'/'+lastTimeObj.getFullYear();
                }

                $('.last-message-time[data-interest='+store[index]+']').html( '<b>'+ lastMessageTime + '</b>' );
            }catch(err){

            }
          }
        });
        loadInterestMessages((index+1),store);
      }
    }
    var store = Object.keys(interestStore);
    loadInterestMessages(0,store);


    //Add scroll listener to load more messages
    $('.message-box').scroll(function(){
      if($(this).scrollTop() == 0){

        //Temporarily turn off listener
        //$(this).off('scroll');

        //Get current scroll height
        var scrollHeight = $(this).prop('scrollHeight');

        var active = localStorage.getItem('activeInterest');

        if((active!=null)&&(active!='null')){
          var data = JSON.parse(localStorage.getItem('interestStore'))[active].interestMessages;
        }else{
          var activeUserAlias = localStorage.getItem('activeUserChatAlias');
          var data = JSON.parse(localStorage.getItem('userMessages'))[activeUserAlias ];
        }


        loadMessages(data,true);
        var newScrollHeight = $(this).prop('scrollHeight');

        $(this).scrollTop((newScrollHeight - scrollHeight));
      }
    });
